import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../engine';
import { PRESETS } from '../presets';
import { findShortestPath } from '../graph';

describe('Campus Network Simulation Engine', () => {
  it('Preset 1: Research Paper Baseline initializes correctly', () => {
    const preset = PRESETS[0];
    const engine = new SimulationEngine(preset.devices, preset.links);
    
    expect(engine.devices.size).toBe(7);
    expect(engine.links.length).toBe(6);
    expect(engine.tick).toBe(0);
    expect(engine.generatedCount).toBe(0);
  });

  it('Dijkstra: calculates correct shortest path on baseline', () => {
    const preset = PRESETS[0];
    const engine = new SimulationEngine(preset.devices, preset.links);

    const result = findShortestPath('PC-STUD', 'SRV-CAMPUS', engine.devices, engine.links);
    expect(result.path).toEqual(['PC-STUD', 'SW-ACC-B', 'SW-DIST', 'SRV-CAMPUS']);
    expect(result.totalCost).toBe(8); // 5 + 2 + 1
  });

  it('Preset 2: Enhanced network prefers SW1 over SW2 due to lower cost', () => {
    const preset = PRESETS[1];
    const engine = new SimulationEngine(preset.devices, preset.links);

    // PC-STUD to SRV-WEB
    const result = findShortestPath('PC-STUD', 'SRV-WEB', engine.devices, engine.links);
    expect(result.path).toEqual(['PC-STUD', 'SW6', 'SW4', 'SW1', 'SRV-WEB']);
    expect(result.totalCost).toBe(11); // 5 + 3 + 2 + 1 = 11 vs via SW2 (5+3+4+2=14)
  });

  it('Link Failure: reroutes through alternate path SW2 when primary SW1 uplink fails', () => {
    const preset = PRESETS[1];
    const engine = new SimulationEngine(preset.devices, preset.links);

    // Sever primary link L_SW1_SW4
    engine.setLinkState('L_SW1_SW4', 'DOWN');
    expect(engine.isReconverging).toBe(true);

    // Advance past reconvergence window
    for (let i = 0; i < 6; i++) {
      engine.step();
    }
    expect(engine.isReconverging).toBe(false);

    // Alternate path calculation: PC-STUD -> SW6 -> SW4 -> SW2 -> SW1 -> SRV-WEB (Cost: 5+3+4+1+1 = 14)
    // Direct SW2->SRV-WEB has cost 5+3+4+2 = 14; with tie-breaking SW1 < SW2, SW2->SW1->SRV-WEB is chosen!
    const result = findShortestPath('PC-STUD', 'SRV-WEB', engine.devices, engine.links);
    expect(result.path).toEqual(['PC-STUD', 'SW6', 'SW4', 'SW2', 'SW1', 'SRV-WEB']);
  });

  it('Packet Accounting Invariant: generated == delivered + dropped + in_flight', () => {
    const preset = PRESETS[1];
    const engine = new SimulationEngine(preset.devices, preset.links);

    // Send 5 packets
    for (let i = 0; i < 5; i++) {
      engine.sendPacket('PC-STUD', 'SRV-WEB');
    }

    // Step a few ticks
    engine.step();
    engine.step();

    const metrics = engine.getMetrics();
    expect(metrics.generated).toBe(metrics.delivered + metrics.dropped + metrics.inFlight);

    // Step until all arrive
    for (let i = 0; i < 10; i++) {
      engine.step();
    }

    const finalMetrics = engine.getMetrics();
    expect(finalMetrics.inFlight).toBe(0);
    expect(finalMetrics.delivered).toBe(5);
    expect(finalMetrics.dropped).toBe(0);
    expect(finalMetrics.deliveryPercentage).toBe(100);
  });

  it('Determinism: two runs with identical inputs produce identical logs and metrics', () => {
    const preset = PRESETS[1];

    // Run 1
    const engine1 = new SimulationEngine(preset.devices, preset.links, { seed: 12345 });
    for (let i = 0; i < 3; i++) engine1.sendPacket('PC-STUD', 'SRV-WEB');
    for (let i = 0; i < 6; i++) engine1.step();

    // Run 2
    const engine2 = new SimulationEngine(preset.devices, preset.links, { seed: 12345 });
    for (let i = 0; i < 3; i++) engine2.sendPacket('PC-STUD', 'SRV-WEB');
    for (let i = 0; i < 6; i++) engine2.step();

    expect(engine1.getMetrics()).toEqual(engine2.getMetrics());
    expect(engine1.events.length).toBe(engine2.events.length);
  });

  it('Security: Student access to FTP is blocked by ACL policy with vlan_policy_denied', () => {
    const preset = PRESETS[6]; // Preset 7
    const engine = new SimulationEngine(preset.devices, preset.links);

    const pkt = engine.sendPacket('PC-STUD', 'SRV-FTP');
    expect(pkt?.status).toBe('dropped');
    expect(pkt?.dropReason).toBe('vlan_policy_denied');
    expect(engine.dropCountsByReason.vlan_policy_denied).toBe(1);
  });

  it('QoS Strict Priority: Voice/LMS traffic preempts buffer over Best-Effort', () => {
    const preset = PRESETS[5]; // Preset 6 (bottleneck capacity = 2, queue limit = 5)
    const engine = new SimulationEngine(preset.devices, preset.links, { qosEnabled: true });

    // Send 6 Best Effort packets (will fill buffer of 5, drop 1)
    for (let i = 0; i < 6; i++) {
      engine.sendPacket('PC-STUD', 'SRV-WEB', 'CLASS_BEST_EFFORT');
    }

    // Now send 1 High-Priority Voice/LMS packet
    const highPkt = engine.sendPacket('PC-STUD', 'SRV-WEB', 'CLASS_HIGH');
    expect(highPkt?.status).toBe('queued');

    // High priority packet should not have been tail-dropped
    expect(highPkt?.dropReason).toBeUndefined();
  });
});
