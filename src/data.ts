// src/data.ts

export interface ColorScheme {
    name: string; // For potential display or identification
    color1: string; // Hex for duotoneColor1
    color2: string; // Hex for duotoneColor2
  }
  
  export const predefinedColorSchemes: ColorScheme[] = [
    { name: "Forest Mist", color1: '#335402', color2: '#C7E3F6' }, // Default Green / Light Blue
    { name: "Earthy Bark", color1: '#4A3B31', color2: '#A8B868' }, // Dark Brown / Yellow-Green
    { name: "Sunset Grove", color1: '#24330D', color2: '#F9A03F' }, // Dark Green / Orange
    { name: "Desert Bloom", color1: '#5C3D2E', color2: '#EFE2BA' }, // Dark Brown / Cream
    { name: "Spring Leaf", color1: '#335402', color2: '#D4E09B' }, // Green / Light Yellow-Green
    // Add more schemes as needed
  ];
  