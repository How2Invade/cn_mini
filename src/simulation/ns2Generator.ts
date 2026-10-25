import { Device, NetworkLink, Packet } from './types';

/**
 * Generates valid NS-2 simulation Tcl script representing the current topology and traffic state.
 */
export function generateNS2Tcl(
  devices: Device[],
  links: NetworkLink[],
  reconvergenceDelayTicks: number = 5,
  qosEnabled: boolean = false
): string {
  const lines: string[] = [];

  lines.push('# =================================================================');
  lines.push('# NS-2 Simulation Script: Smart Adaptive Campus Network Model');
  lines.push('# Generated dynamically from browser simulation engine state');
  lines.push('# NOTE: Generated equivalent model; not executed directly by browser');
  lines.push('# =================================================================\n');

  lines.push('set ns [new Simulator]');
  lines.push('set nf [open campus_simulation.nam w]');
  lines.push('$ns namtrace-all $nf');
  lines.push('set tf [open campus_simulation.tr w]');
  lines.push('$ns trace-all $tf\n');

  lines.push('# --- Node Definitions ---');
  // Create mapping of node ID to clean tcl variable name
  const nodeVarMap: Record<string, string> = {};
  devices.forEach((d) => {
    const varName = `n_${d.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    nodeVarMap[d.id] = varName;
    lines.push(`set ${varName} [$ns node] ;# ${d.name} (${d.ip || 'no-ip'})`);
  });
  lines.push('');

  lines.push('# --- Duplex Links with Queue & Latency ---');
  const queueType = qosEnabled ? 'PriQueue' : 'DropTail';
  links.forEach((l) => {
    const srcVar = nodeVarMap[l.source];
    const tgtVar = nodeVarMap[l.target];
    if (srcVar && tgtVar) {
      const bwMb = l.capacity * 2; // scale capacity to simulated Mbps
      const delayMs = l.cost * 5;  // cost to simulated latency ms
      lines.push(
        `$ns duplex-link $${srcVar} $${tgtVar} ${bwMb}Mb ${delayMs}ms ${queueType} ;# Link ${l.id} (Queue: ${l.queueLimit})`
      );
      lines.push(`$ns queue-limit $${srcVar} $${tgtVar} ${l.queueLimit}`);
    }
  });
  lines.push('');

  lines.push('# --- Dynamic Routing Protocol ---');
  lines.push('$ns rtproto DV ;# Distance Vector / Dijkstra path recomputation\n');

  lines.push('# --- Link Failure & Recovery Schedule ---');
  const failedLink = links.find((l) => l.state === 'DOWN');
  if (failedLink) {
    const srcVar = nodeVarMap[failedLink.source];
    const tgtVar = nodeVarMap[failedLink.target];
    lines.push(`$ns rtmodel-at 2.0 down $${srcVar} $${tgtVar} ;# Injected link failure ${failedLink.id}`);
    const recovSec = (2.0 + (reconvergenceDelayTicks * 0.1)).toFixed(2);
    lines.push(`$ns rtmodel-at ${recovSec} up $${srcVar} $${tgtVar}   ;# Protocol reconverged`);
  } else {
    lines.push('# (All links currently operating in normal steady state)');
  }
  lines.push('');

  lines.push('# --- Traffic Agents and Application Setup ---');
  const pcStud = devices.find((d) => d.id === 'PC-STUD');
  const srvWeb = devices.find((d) => d.id === 'SRV-WEB' || d.id === 'SRV-CAMPUS');
  if (pcStud && srvWeb) {
    const srcVar = nodeVarMap[pcStud.id];
    const dstVar = nodeVarMap[srvWeb.id];
    lines.push(`set udp0 [new Agent/UDP]`);
    lines.push(`$ns attach-agent $${srcVar} $udp0`);
    lines.push(`set cbr0 [new Application/Traffic/CBR]`);
    lines.push(`$cbr0 set packetSize_ 1000`);
    lines.push(`$cbr0 set interval_ 0.05`);
    lines.push(`$cbr0 attach-agent $udp0\n`);
    lines.push(`set null0 [new Agent/Null]`);
    lines.push(`$ns attach-agent $${dstVar} $null0`);
    lines.push(`$ns connect $udp0 $null0\n`);
    lines.push(`$ns at 0.5 "$cbr0 start"`);
    lines.push(`$ns at 9.5 "$cbr0 stop"`);
  }
  lines.push('');

  lines.push('# --- Finish Procedure ---');
  lines.push('proc finish {} {');
  lines.push('    global ns nf tf');
  lines.push('    $ns flush-trace');
  lines.push('    close $nf');
  lines.push('    close $tf');
  lines.push('    exec nam campus_simulation.nam &');
  lines.push('    exit 0');
  lines.push('}');
  lines.push('$ns at 10.0 "finish"');
  lines.push('$ns run');

  return lines.join('\n');
}

/**
 * Maps real simulation engine packet transitions to standard NS-2 12-column trace format:
 * [event: + | - | r | d] [time] [from-node] [to-node] [pkt-type] [pkt-size] [flags] [fid] [src-addr] [dst-addr] [seq-num] [pkt-id]
 */
export function generateNS2Trace(packets: Packet[]): string {
  if (packets.length === 0) {
    return '# No packet events recorded yet. Inject traffic to generate trace rows.\n';
  }

  const lines: string[] = [];
  lines.push('# event time from to pkt_type size flags fid src_ip dst_ip seq pkt_id');

  packets.forEach((p, idx) => {
    const timeSec = (p.createdTick * 0.1).toFixed(4);
    const pktType = p.trafficClass === 'CLASS_HIGH' ? 'cbr/exp' : 'cbr';
    const flags = '-------';
    const fid = p.trafficClass === 'CLASS_HIGH' ? '1' : '0';
    const seq = idx.toString();
    const cleanId = p.id.replace(/[^0-9]/g, '') || idx.toString();

    // Trace Enqueue (+)
    lines.push(`+ ${timeSec} ${p.source} ${p.path[1] || p.destination} ${pktType} ${p.sizeBytes} ${flags} ${fid} ${p.sourceIp} ${p.destIp} ${seq} ${cleanId}`);

    // If delivered (r)
    if (p.status === 'delivered') {
      const delivTime = ((p.createdTick + Math.max(1, p.path.length)) * 0.1).toFixed(4);
      const lastHop = p.path[p.path.length - 2] || p.source;
      lines.push(`r ${delivTime} ${lastHop} ${p.destination} ${pktType} ${p.sizeBytes} ${flags} ${fid} ${p.sourceIp} ${p.destIp} ${seq} ${cleanId}`);
    } else if (p.status === 'dropped') {
      const dropTime = ((p.createdTick + Math.max(1, p.currentHopIndex)) * 0.1).toFixed(4);
      const dropNode = p.path[p.currentHopIndex] || p.source;
      const nextNode = p.path[p.currentHopIndex + 1] || p.destination;
      lines.push(`d ${dropTime} ${dropNode} ${nextNode} ${pktType} ${p.sizeBytes} ${flags} ${fid} ${p.sourceIp} ${p.destIp} ${seq} ${cleanId} ;# ${p.dropReason || 'drop'}`);
    } else {
      // In flight / dequeued (-)
      const deqTime = ((p.createdTick + 0.05) * 0.1).toFixed(4);
      lines.push(`- ${deqTime} ${p.source} ${p.path[1] || p.destination} ${pktType} ${p.sizeBytes} ${flags} ${fid} ${p.sourceIp} ${p.destIp} ${seq} ${cleanId}`);
    }
  });

  return lines.join('\n');
}
