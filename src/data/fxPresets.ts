export const trackFxPresets = {
  bass: {
    cumbia_sub: { name: "Cumbia Sub", eq: { low: 4, mid: -2, high: -4 }, compressor: { threshold: -20, ratio: 4 }, reverb: { mix: 0.05 } },
    urbano_808: { name: "Urbano 808", eq: { low: 6, mid: -1, high: 2 }, compressor: { threshold: -24, ratio: 6 }, reverb: { mix: 0.02 } },
    edm_drive: { name: "EDM Drive", eq: { low: 5, mid: 0, high: 3 }, compressor: { threshold: -22, ratio: 8 }, reverb: { mix: 0.10 } },
    jazz_upright: { name: "Jazz Upright", eq: { low: 1, mid: 2, high: 1 }, compressor: { threshold: -12, ratio: 2 }, reverb: { mix: 0.15 } },
    rock_punch: { name: "Rock Punch", eq: { low: 3, mid: 3, high: 2 }, compressor: { threshold: -18, ratio: 4 }, reverb: { mix: 0.08 } },
    metal_click: { name: "Metal Click", eq: { low: 5, mid: -4, high: 6 }, compressor: { threshold: -26, ratio: 8 }, reverb: { mix: 0.0 } },
    pop_slap: { name: "Pop Slap", eq: { low: 2, mid: 1, high: 4 }, compressor: { threshold: -18, ratio: 3 }, reverb: { mix: 0.12 } },
    soul_warm: { name: "Soul Warm", eq: { low: 3, mid: 0, high: -3 }, compressor: { threshold: -16, ratio: 3 }, reverb: { mix: 0.06 } },
  },
  drums: {
    cumbia_perc: { name: "Cumbia Perc", eq: { low: 3, mid: 2, high: 4 }, compressor: { threshold: -16, ratio: 3 }, reverb: { mix: 0.15 } },
    reggaeton_seco: { name: "Reggaeton Seco", eq: { low: 5, mid: -2, high: 3 }, compressor: { threshold: -22, ratio: 6 }, reverb: { mix: 0.05 } },
    edm_heavy: { name: "EDM Heavy", eq: { low: 4, mid: -1, high: 5 }, compressor: { threshold: -24, ratio: 8 }, reverb: { mix: 0.20 } },
    jazz_brushes: { name: "Jazz Brushes", eq: { low: 0, mid: 1, high: 2 }, compressor: { threshold: -14, ratio: 2 }, reverb: { mix: 0.25 } },
    rock_arena: { name: "Rock Arena", eq: { low: 3, mid: -1, high: 4 }, compressor: { threshold: -20, ratio: 4 }, reverb: { mix: 0.35 } },
    metal_blast: { name: "Metal Blast", eq: { low: 5, mid: -3, high: 6 }, compressor: { threshold: -26, ratio: 10 }, reverb: { mix: 0.10 } },
    pop_tight: { name: "Pop Tight", eq: { low: 2, mid: 1, high: 3 }, compressor: { threshold: -18, ratio: 4 }, reverb: { mix: 0.15 } },
    lofi_dust: { name: "Lo-Fi Dust", eq: { low: 2, mid: -2, high: -4 }, compressor: { threshold: -20, ratio: 5 }, reverb: { mix: 0.10 } },
  },
  synth: {
    tropical_keys: { name: "Tropical Keys", eq: { low: -2, mid: 3, high: 2 }, compressor: { threshold: -16, ratio: 3 }, reverb: { mix: 0.20 } },
    urbano_lead: { name: "Urbano Lead", eq: { low: -3, mid: 2, high: 4 }, compressor: { threshold: -20, ratio: 4 }, reverb: { mix: 0.25 } },
    edm_pluck: { name: "EDM Pluck", eq: { low: -4, mid: 1, high: 6 }, compressor: { threshold: -24, ratio: 6 }, reverb: { mix: 0.35 } },
    jazz_intimo: { name: "Jazz Íntimo", eq: { low: 1, mid: 2, high: -1 }, compressor: { threshold: -12, ratio: 2 }, reverb: { mix: 0.30 } },
    rock_pad: { name: "Rock Pad", eq: { low: -1, mid: 1, high: 2 }, compressor: { threshold: -18, ratio: 3 }, reverb: { mix: 0.40 } },
    metal_synth: { name: "Metal Synth", eq: { low: -2, mid: 4, high: 5 }, compressor: { threshold: -20, ratio: 5 }, reverb: { mix: 0.25 } },
    pop_brillante: { name: "Pop Brillante", eq: { low: -2, mid: 1, high: 5 }, compressor: { threshold: -18, ratio: 4 }, reverb: { mix: 0.30 } },
    soul_rhodes: { name: "Soul Rhodes", eq: { low: 2, mid: 3, high: -2 }, compressor: { threshold: -14, ratio: 2 }, reverb: { mix: 0.20 } },
  }
};
