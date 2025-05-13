// src/store.ts
import {create} from 'zustand';
import { predefinedColorSchemes } from '../data'; // Import for default

interface EffectState {
  blurRadius: number;
  // setBlurRadius: (radius: number) =>  void; // No longer needed if blur is fixed
  thresholdValue: number;
  setThresholdValue: (value: number) => void;
  duotoneColor1: string; // Hex color string
  setDuotoneColor1: (color: string) => void;
  duotoneColor2: string; // Hex color string
  setDuotoneColor2: (color: string) => void;
  // New: to track the currently selected scheme, optional but good for UI
  activeColorSchemeName: string | null;
  setActiveColorScheme: (scheme: { color1: string, color2: string, name: string }) => void;
}

export const useEffectStore = create<EffectState>((set) => ({
  // Fixed blur radius
  blurRadius: 1.0,
  // setBlurRadius: (radius) => set({ blurRadius: Math.max(0, radius) }), // Keep if programmatic changes might be needed later

  thresholdValue: 0.85,
  setThresholdValue: (value) => set({ thresholdValue: Math.max(0, Math.min(1, value)) }),

  // Updated default duotone colors
  duotoneColor1: predefinedColorSchemes[0].color1, // Default to the first scheme's color1
  setDuotoneColor1: (color) => set({ duotoneColor1: color }),

  duotoneColor2: predefinedColorSchemes[0].color2, // Default to the first scheme's color2
  setDuotoneColor2: (color) => set({ duotoneColor2: color }),

  activeColorSchemeName: predefinedColorSchemes[0].name, // Default to the first scheme
  setActiveColorScheme: (scheme) => set({
    duotoneColor1: scheme.color1,
    duotoneColor2: scheme.color2,
    activeColorSchemeName: scheme.name,
  }),
}));
