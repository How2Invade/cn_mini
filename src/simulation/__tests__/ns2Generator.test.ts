import { describe, it, expect } from 'vitest';
import { generateNS2Tcl, generateNS2Trace } from '../ns2Generator';
import { PRESETS } from '../presets';
import { Packet } from '../types';

describe('NS-2 Tcl and Trace Generator', () => {
  it('generates valid NS-2 Tcl script structure', () => {
    const preset = PRESETS[1]; // Enhanced preset
    const tcl = generateNS2Tcl(preset.devices, preset.links, preset.reconvergenceDelayTicks, false);

    expect(tcl).toContain('set ns [new Simulator]');
    expect(tcl).toContain('namtrace-all');
    expect(tcl).toContain('duplex-link');
    expect(tcl).toContain('DropTail');
    expect(tcl).toContain('finish');
    expect(tcl).toContain('$ns run');
  });

  it('switches to PriQueue when QoS is enabled', () => {
    const preset = PRESETS[5]; // QoS preset
    const tcl = generateNS2Tcl(preset.devices, preset.links, 5, true);

    expect(tcl).toContain('PriQueue');
  });

  it('maps real engine packet events to NS-2 12-column trace entries', () => {
    const mockPackets: Packet[] = [
      {
        id: 'PKT-0001',
        source: 'PC-STUD',
        destination: 'SRV-WEB',
        sourceIp: '192.168.30.10',
        destIp: '192.168.40.10',
        trafficClass: 'CLASS_BEST_EFFORT',
        sizeBytes: 1024,
        createdTick: 2,
        path: ['PC-STUD', 'SW6', 'SW4', 'SW1', 'SRV-WEB'],
        currentHopIndex: 4,
        status: 'delivered',
      },
      {
        id: 'PKT-0002',
        source: 'PC-STUD',
        destination: 'SRV-WEB',
        sourceIp: '192.168.30.10',
        destIp: '192.168.40.10',
        trafficClass: 'CLASS_HIGH',
        sizeBytes: 128,
        createdTick: 3,
        path: ['PC-STUD', 'SW6', 'SW4'],
        currentHopIndex: 2,
        status: 'dropped',
        dropReason: 'link_down',
      },
    ];

    const trace = generateNS2Trace(mockPackets);
    expect(trace).toContain('+ 0.2000 PC-STUD SW6 cbr 1024');
    expect(trace).toContain('r 0.7000 SW1 SRV-WEB cbr 1024');
    expect(trace).toContain('d 0.5000 SW4 SRV-WEB cbr/exp 128');
    expect(trace).toContain('link_down');
  });
});
