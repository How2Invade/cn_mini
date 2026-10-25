export type DeviceType = 'router' | 'l3switch' | 'switch' | 'pc' | 'server';

export type TrafficClass = 'CLASS_BEST_EFFORT' | 'CLASS_HIGH';

export type DropReason = 
  | 'no_route'
  | 'link_down'
  | 'destination_unreachable'
  | 'vlan_policy_denied'
  | 'queue_overflow';

export interface DeviceInterface {
  name: string; // e.g. "Gi0/1", "Fa0/24"
  ip?: string;
  mask?: string;
  mac: string;
  vlan?: number;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  vlan?: number; // Primary VLAN if endpoint or access switch
  ip?: string;
  gateway?: string;
  mac: string;
  interfaces: DeviceInterface[];
  hsrpPriority?: number; // e.g. 110 for SW1, 100 for SW2
  isHsrpActive?: boolean;
  routingTable?: RouteEntry[];
  position: { x: number; y: number };
}

export interface RouteEntry {
  destination: string; // Subnet e.g. "192.168.40.0/24"
  nextHop: string;     // IP or Device ID
  interface: string;
  metric: number;
}

export type LinkState = 'UP' | 'DOWN' | 'BLOCKED';

export interface NetworkLink {
  id: string;
  source: string; // Device ID
  target: string; // Device ID
  sourceInterface: string;
  targetInterface: string;
  cost: number;
  capacity: number; // Max packets processed per tick
  queueLimit: number; // Max queue buffer depth
  state: LinkState;
  queue: Packet[]; // Buffered packets
  packetsInFlight: Packet[]; // Packets currently traversing link
  tailDropsCount: number;
  totalTransmitted: number;
}

export interface Packet {
  id: string;
  source: string; // Device ID
  destination: string; // Device ID
  sourceIp: string;
  destIp: string;
  trafficClass: TrafficClass;
  sizeBytes: number;
  createdTick: number;
  path: string[]; // List of Device IDs on path
  currentHopIndex: number;
  status: 'created' | 'queued' | 'in_transit' | 'delivered' | 'dropped';
  dropReason?: DropReason;
  dropLocation?: { x: number; y: number };
}

export type EventSeverity = 'info' | 'success' | 'warning' | 'error';

export interface SimulationEvent {
  id: string;
  tick: number;
  timestamp: string;
  severity: EventSeverity;
  type: 
    | 'PACKET_SENT'
    | 'PACKET_DELIVERED'
    | 'PACKET_DROPPED'
    | 'LINK_DOWN'
    | 'LINK_UP'
    | 'RECONVERGING'
    | 'RECONVERGED'
    | 'QOS_PRIORITIZED';
  source?: string;
  target?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface SimulationMetrics {
  generated: number;
  delivered: number;
  dropped: number;
  inFlight: number;
  deliveryPercentage: number;
  lossPercentage: number;
  recoveryTicks: number | null; // Ticks to first delivery after failure
  activeLinkUtilization: Record<string, number>;
  activeQueueDepths: Record<string, number>;
  dropCountsByReason: Record<DropReason, number>;
}

export interface PresetConfig {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  devices: Device[];
  links: NetworkLink[];
  reconvergenceDelayTicks: number;
  defaultTrafficParams?: {
    source: string;
    destination: string;
    count: number;
    rate: number;
    trafficClass: TrafficClass;
    qosEnabled: boolean;
  };
  expectedEvents: string[];
  successCriteria: string;
}
