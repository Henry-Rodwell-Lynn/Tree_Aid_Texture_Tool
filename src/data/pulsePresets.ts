// src/data/pulsePresets.ts

export interface PulsePreset {
    name: string;
    durations: number[]; // FADE_DURATION values in ms
  }
  
  export const pulsePresets: PulsePreset[] = [
    {
      name: 'Tree Signal 1',
      durations: [
        6000, 2000, 5500, 2500, 5000,
        1800, 4700, 2200, 6000, 1900
      ]
    },
    {
      name: 'Tree Signal 2',
      durations: [
        16000, 8000, 18000, 7000, 15000,
        9000, 17000, 6000, 16000, 10000
      ]
    },
  ];