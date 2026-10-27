import fs from 'fs';

function toVLQ(value) {
    let buffer = [value & 0x7F];
    while ((value >>= 7)) {
      buffer.unshift((value & 0x7F) | 0x80);
    }
    return buffer;
}
function strToBytes(str) {
    return str.split('').map(c => c.charCodeAt(0));
}
function numToBytes16(num) {
    return [(num >> 8) & 0xFF, num & 0xFF];
}
function numToBytes32(num) {
    return [(num >> 24) & 0xFF, (num >> 16) & 0xFF, (num >> 8) & 0xFF, num & 0xFF];
}

const bpm = 120;
const validTracks = [
  {
    name: "Piano",
    instrument: "piano",
    events: [
      { timestamp: 0, duration: 500, note: 60, velocity: 100 }
    ]
  }
];

let header = [
    ...strToBytes('MThd'),
    ...numToBytes32(6),
    ...numToBytes16(1),
    ...numToBytes16(validTracks.length),
    ...numToBytes16(480)
];

let tracksData = [];
validTracks.forEach((track, index) => {
    let eventsData = [];
    
    if (index === 0) {
      let microsecondsPerBeat = Math.round(60000000 / bpm);
      eventsData.push(
        0x00, 0xFF, 0x51, 0x03,
        (microsecondsPerBeat >> 16) & 0xFF,
        (microsecondsPerBeat >> 8) & 0xFF,
        microsecondsPerBeat & 0xFF
      );
    }
    
    let trackName = track.name || `Track ${index + 1}`;
    eventsData.push(0x00, 0xFF, 0x03, trackName.length, ...strToBytes(trackName));

    let midiEvents = [
        { type: 'noteOn', note: 60, velocity: 100, tick: 0 },
        { type: 'noteOff', note: 60, velocity: 0, tick: 480 } // duration 500ms at 120bpm is 1 beat = 480 ticks
    ];

    let lastTick = 0;
    let channel = index % 16;
    if (channel === 9) channel = 10; 

    for (const ev of midiEvents) {
      let delta = ev.tick - lastTick;
      lastTick = ev.tick;
      eventsData.push(...toVLQ(delta));
      
      if (ev.type === 'noteOn') {
        eventsData.push(0x90 | channel, ev.note, ev.velocity);
      } else {
        eventsData.push(0x80 | channel, ev.note, ev.velocity);
      }
    }

    eventsData.push(0x00, 0xFF, 0x2F, 0x00);

    tracksData.push(
      ...strToBytes('MTrk'),
      ...numToBytes32(eventsData.length),
      ...eventsData
    );
});
const midiFileBytes = new Uint8Array([...header, ...tracksData]);
fs.writeFileSync('test.mid', midiFileBytes);
