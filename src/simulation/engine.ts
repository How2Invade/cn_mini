import {
  Device,
  NetworkLink,
  Packet,
  SimulationEvent,
  SimulationMetrics,
  DropReason,
  TrafficClass,
  LinkState
} from './types';
import { findShortestPath, getLinkBetween } from './graph';

export interface EngineConfig {
  seed?: number;
  reconvergenceDelayTicks?: number;
  qosEnabled?: boolean;
}

export class SimulationEngine {
  public tick: number = 0;
  public devices: Map<string, Device> = new Map();
  public links: NetworkLink[] = [];
  public events: SimulationEvent[] = [];
  public packets: Packet[] = [];
  public recentPackets: Packet[] = []; // Live tracked packets for visual rendering
  
  public reconvergenceDelayTicks: number = 5;
  public qosEnabled: boolean = false;
  
  // Reconvergence state
  public isReconverging: boolean = false;
  public reconvergenceEndTick: number = 0;
  public lastFailureTick: number | null = null;
  public recoveryTicks: number | null = null;
  
  // Accounting metrics
  public generatedCount: number = 0;
  public deliveredCount: number = 0;
  public droppedCount: number = 0;
  public dropCountsByReason: Record<DropReason, number> = {
    no_route: 0,
    link_down: 0,
    destination_unreachable: 0,
    vlan_policy_denied: 0,
    queue_overflow: 0,
  };

  private seed: number;
  private eventCounter: number = 0;
  private static readonly MAX_EVENTS = 500;
  private static readonly MAX_PACKETS = 2000;

  constructor(devices: Device[], links: NetworkLink[], config?: EngineConfig) {
    this.seed = config?.seed ?? 42;
    this.reconvergenceDelayTicks = config?.reconvergenceDelayTicks ?? 5;
    this.qosEnabled = config?.qosEnabled ?? false;
    this.loadTopology(devices, links);
  }

  public loadTopology(devices: Device[], links: NetworkLink[]): void {
    this.reset();
    this.devices.clear();
    this.recentPackets = [];
    for (const d of devices) {
      this.devices.set(d.id, { ...d, interfaces: d.interfaces.map(i => ({ ...i })) });
    }
    this.links = links.map(l => ({
      ...l,
      queue: [],
      packetsInFlight: [],
      tailDropsCount: 0,
      totalTransmitted: 0,
    }));
  }

  public reset(): void {
    this.tick = 0;
    this.events = [];
    this.eventCounter = 0;
    this.packets = [];
    this.generatedCount = 0;
    this.deliveredCount = 0;
    this.droppedCount = 0;
    this.isReconverging = false;
    this.reconvergenceEndTick = 0;
    this.lastFailureTick = null;
    this.recoveryTicks = null;
    this.dropCountsByReason = {
      no_route: 0,
      link_down: 0,
      destination_unreachable: 0,
      vlan_policy_denied: 0,
      queue_overflow: 0,
    };
    for (const link of this.links) {
      link.queue = [];
      link.packetsInFlight = [];
      link.tailDropsCount = 0;
      link.totalTransmitted = 0;
    }
  }

  /**
   * Deterministic PRNG
   */
  public pseudoRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  public logEvent(
    type: SimulationEvent['type'],
    severity: SimulationEvent['severity'],
    description: string,
    source?: string,
    target?: string,
    metadata?: Record<string, any>
  ): void {
    const event: SimulationEvent = {
      id: `evt-${this.tick}-${++this.eventCounter}`,
      tick: this.tick,
      timestamp: new Date().toISOString(),
      type,
      severity,
      description,
      source,
      target,
      metadata,
    };
    this.events.unshift(event); // newest first for display
    if (this.events.length > SimulationEngine.MAX_EVENTS) {
      this.events.length = SimulationEngine.MAX_EVENTS;
    }
  }

  public setLinkState(linkId: string, newState: LinkState): void {
    const link = this.links.find(l => l.id === linkId);
    if (!link || link.state === newState) return;

    link.state = newState;

    if (newState === 'DOWN') {
      this.lastFailureTick = this.tick;
      this.recoveryTicks = null;
      this.isReconverging = true;
      this.reconvergenceEndTick = this.tick + this.reconvergenceDelayTicks;

      this.logEvent(
        'LINK_DOWN',
        'error',
        `Link ${link.id} (${link.source} <-> ${link.target}) failed. Reconvergence triggered (${this.reconvergenceDelayTicks} ticks).`,
        link.source,
        link.target
      );

      // Drop any packets actively in flight on this failed link
      const inFlight = [...link.packetsInFlight];
      link.packetsInFlight = [];
      for (const pkt of inFlight) {
        this.dropPacket(pkt, 'link_down', `Dropped while in flight on severed link ${link.id}`);
      }

      // Drop queued packets on this link
      const queued = [...link.queue];
      link.queue = [];
      for (const pkt of queued) {
        this.dropPacket(pkt, 'link_down', `Dropped from queue of severed link ${link.id}`);
      }
    } else if (newState === 'UP') {
      this.logEvent(
        'LINK_UP',
        'success',
        `Link ${link.id} (${link.source} <-> ${link.target}) physically restored.`,
        link.source,
        link.target
      );
    }
  }

  public setLinkCost(linkId: string, newCost: number): void {
    const link = this.links.find(l => l.id === linkId);
    if (!link) return;
    link.cost = Math.max(1, newCost);
    this.logEvent(
      'LINK_UP',
      'info',
      `Link ${link.id} metric cost updated to ${link.cost}.`,
      link.source,
      link.target
    );
  }

  /**
   * Injects one tick's worth of the scenario's background workload.
   * Deterministic: `rate` packets per call. When `mixClasses` is true the
   * batch alternates CLASS_HIGH / CLASS_BEST_EFFORT so QoS effects are visible.
   * Returns the packets created (dropped ones included).
   */
  public injectScenarioTraffic(params: {
    source: string;
    destination: string;
    rate: number;
    trafficClass: TrafficClass;
    mixClasses?: boolean;
  }): Packet[] {
    const created: Packet[] = [];
    const count = Math.max(1, Math.floor(params.rate));
    for (let i = 0; i < count; i++) {
      const cls: TrafficClass = params.mixClasses
        ? (i % 2 === 0 ? 'CLASS_HIGH' : 'CLASS_BEST_EFFORT')
        : params.trafficClass;
      const pkt = this.sendPacket(params.source, params.destination, cls);
      if (pkt) created.push(pkt);
    }
    return created;
  }

  /**
   * Generates and injects a new packet
   */
  public sendPacket(
    sourceId: string,
    destinationId: string,
    trafficClass: TrafficClass = 'CLASS_BEST_EFFORT',
    destPort?: number
  ): Packet | null {
    const src = this.devices.get(sourceId);
    const dst = this.devices.get(destinationId);

    if (!src || !dst) return null;

    this.generatedCount++;
    const pkt: Packet = {
      id: `PKT-${this.generatedCount.toString().padStart(4, '0')}`,
      source: sourceId,
      destination: destinationId,
      sourceIp: src.ip || '192.168.1.1',
      destIp: dst.ip || '192.168.1.254',
      trafficClass,
      sizeBytes: trafficClass === 'CLASS_HIGH' ? 128 : 1024,
      createdTick: this.tick,
      path: [],
      currentHopIndex: 0,
      status: 'created',
    };
    this.packets.push(pkt);
    if (this.packets.length > SimulationEngine.MAX_PACKETS) {
      this.packets.shift();
    }
    this.recentPackets.push(pkt);
    if (this.recentPackets.length > 40) {
      this.recentPackets.shift();
    }

    // ACL / Security Policy Check
    // e.g., Student VLAN 30 denied access to FTP (port 21) or DMZ internal probes
    if (src.vlan === 30) {
      if (destPort === 21 || dst.id === 'SRV-FTP') {
        this.dropPacket(pkt, 'vlan_policy_denied', `Denied by ACL_VLAN30_IN: Student access to FTP (port 21) prohibited.`);
        return pkt;
      }
      if (dst.vlan === 10) {
        this.dropPacket(pkt, 'vlan_policy_denied', `Denied by ACL: Direct student access to Management VLAN 10 prohibited.`);
        return pkt;
      }
    }

    // Check Destination Health
    if (dst.type === 'server' && dst.interfaces.length === 0) {
      this.dropPacket(pkt, 'destination_unreachable', `Destination server ${dst.name} is down or service offline.`);
      return pkt;
    }

    // Route calculation via Dijkstra
    const route = findShortestPath(sourceId, destinationId, this.devices, this.links);
    if (!route.path || route.path.length < 2) {
      this.dropPacket(pkt, 'no_route', `No route to destination ${dst.name}. Network may be partitioned.`);
      return pkt;
    }

    // If currently reconverging, packets cannot traverse the topology reliably
    if (this.isReconverging) {
      this.dropPacket(pkt, 'link_down', `Dropped during topology reconvergence window.`);
      return pkt;
    }

    pkt.path = route.path;
    pkt.currentHopIndex = 0;

    // Enqueue into first hop link
    const firstHop = route.path[0];
    const secondHop = route.path[1];
    const link = getLinkBetween(firstHop, secondHop, this.links);

    if (!link || link.state !== 'UP') {
      this.dropPacket(pkt, 'link_down', `First hop link unavailable.`);
      return pkt;
    }

    this.enqueuePacketOnLink(link, pkt);
    this.logEvent(
      'PACKET_SENT',
      'info',
      `Packet ${pkt.id} [${pkt.trafficClass === 'CLASS_HIGH' ? 'Voice/LMS' : 'Bulk'}] sent from ${src.name} to ${dst.name} via ${route.path.join(' -> ')}.`,
      src.id,
      dst.id
    );

    return pkt;
  }

  /**
   * Enqueues packet with QoS tail-drop and strict priority scheduling
   */
  private enqueuePacketOnLink(link: NetworkLink, pkt: Packet): void {
    if (link.queue.length >= link.queueLimit) {
      // Buffer full
      if (this.qosEnabled && pkt.trafficClass === 'CLASS_HIGH') {
        // Find best-effort packet to evict
        const beIndex = link.queue.findIndex(p => p.trafficClass === 'CLASS_BEST_EFFORT');
        if (beIndex !== -1) {
          const evicted = link.queue.splice(beIndex, 1)[0];
          this.dropPacket(evicted, 'queue_overflow', `Evicted by strict-priority QoS on link ${link.id}`);
          link.queue.push(pkt);
          pkt.status = 'queued';
          this.logEvent('QOS_PRIORITIZED', 'warning', `High-priority packet ${pkt.id} preempted buffer space on link ${link.id}`, link.source, link.target);
          return;
        }
      }
      // Tail drop
      link.tailDropsCount++;
      this.dropPacket(pkt, 'queue_overflow', `Buffer queue full (${link.queueLimit} pkts) on link ${link.id}`);
      return;
    }

    link.queue.push(pkt);
    pkt.status = 'queued';
  }

  private dropPacket(pkt: Packet, reason: DropReason, detail: string): void {
    if (pkt.status === 'delivered' || pkt.status === 'dropped') return; // prevent double count

    pkt.status = 'dropped';
    pkt.dropReason = reason;
    this.droppedCount++;
    this.dropCountsByReason[reason] = (this.dropCountsByReason[reason] || 0) + 1;

    // Set dropLocation if possible
    if (pkt.path && pkt.path.length > 0) {
      const dropNodeId = pkt.path[Math.min(pkt.currentHopIndex, pkt.path.length - 1)];
      const node = this.devices.get(dropNodeId);
      if (node) {
        pkt.dropLocation = { x: node.position.x, y: node.position.y };
      }
    } else {
      const srcNode = this.devices.get(pkt.source);
      if (srcNode) {
        pkt.dropLocation = { x: srcNode.position.x, y: srcNode.position.y };
      }
    }

    this.logEvent(
      'PACKET_DROPPED',
      'error',
      `Packet ${pkt.id} dropped: ${reason} (${detail})`,
      pkt.source,
      pkt.destination
    );
  }

  private deliverPacket(pkt: Packet): void {
    if (pkt.status === 'delivered' || pkt.status === 'dropped') return; // prevent double count

    pkt.status = 'delivered';
    this.deliveredCount++;

    if (this.lastFailureTick !== null && this.recoveryTicks === null) {
      this.recoveryTicks = this.tick - this.lastFailureTick;
      this.logEvent(
        'RECONVERGED',
        'success',
        `First packet delivered following failure. Recovery time: ${this.recoveryTicks} ticks.`,
        pkt.source,
        pkt.destination
      );
    }

    this.logEvent(
      'PACKET_DELIVERED',
      'success',
      `Packet ${pkt.id} delivered successfully at destination ${pkt.destination}.`,
      pkt.source,
      pkt.destination
    );
  }

  /**
   * Advances the simulation by 1 discrete tick
   */
  public step(): void {
    this.tick++;

    // 1. Process Reconvergence Expiration
    if (this.isReconverging && this.tick >= this.reconvergenceEndTick) {
      this.isReconverging = false;
      this.logEvent(
        'RECONVERGED',
        'info',
        `Topology reconvergence complete. Routing tables recalculated.`
      );
    }

    // 2. Deliver in-flight packets reaching their hop
    for (const link of this.links) {
      if (link.packetsInFlight.length === 0) continue;

      const arrived = [...link.packetsInFlight];
      link.packetsInFlight = [];

      for (const pkt of arrived) {
        pkt.currentHopIndex++;
        const currentDevice = pkt.path[pkt.currentHopIndex];

        if (currentDevice === pkt.destination) {
          // Packet arrived at final destination!
          this.deliverPacket(pkt);
        } else {
          // Forward to next hop
          const nextHop = pkt.path[pkt.currentHopIndex + 1];
          const nextLink = getLinkBetween(currentDevice, nextHop, this.links);

          if (!nextLink || nextLink.state !== 'UP') {
            this.dropPacket(pkt, 'link_down', `Next link down on forward path.`);
          } else {
            this.enqueuePacketOnLink(nextLink, pkt);
          }
        }
      }
    }

    // 3. Move queued packets to in-flight based on link capacity and QoS
    for (const link of this.links) {
      if (link.state !== 'UP' || link.queue.length === 0) continue;

      // Sort queue if QoS enabled: high priority first
      if (this.qosEnabled) {
        link.queue.sort((a, b) => (b.trafficClass === 'CLASS_HIGH' ? 1 : 0) - (a.trafficClass === 'CLASS_HIGH' ? 1 : 0));
      }

      const transmitBatch = link.queue.splice(0, link.capacity);
      for (const pkt of transmitBatch) {
        pkt.status = 'in_transit';
        link.packetsInFlight.push(pkt);
        link.totalTransmitted++;
      }
    }
  }

  public getMetrics(): SimulationMetrics {
    const inFlight = this.generatedCount - (this.deliveredCount + this.droppedCount);
    const deliveryPercentage = this.generatedCount > 0 
      ? Number(((this.deliveredCount / this.generatedCount) * 100).toFixed(1))
      : 0;
    
    // Loss % is exact only when in-flight is 0, or calculated dynamically
    const lossPercentage = this.generatedCount > 0
      ? Number(((this.droppedCount / this.generatedCount) * 100).toFixed(1))
      : 0;

    const activeLinkUtilization: Record<string, number> = {};
    const activeQueueDepths: Record<string, number> = {};

    for (const link of this.links) {
      activeLinkUtilization[link.id] = Math.min(
        100,
        Math.round(((link.packetsInFlight.length + link.queue.length) / Math.max(1, link.capacity)) * 100)
      );
      activeQueueDepths[link.id] = link.queue.length;
    }

    return {
      generated: this.generatedCount,
      delivered: this.deliveredCount,
      dropped: this.droppedCount,
      inFlight: Math.max(0, inFlight),
      deliveryPercentage,
      lossPercentage,
      recoveryTicks: this.recoveryTicks,
      activeLinkUtilization,
      activeQueueDepths,
      dropCountsByReason: { ...this.dropCountsByReason },
    };
  }
}
