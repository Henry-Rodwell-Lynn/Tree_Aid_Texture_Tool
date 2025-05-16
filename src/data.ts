// src/data.ts

export interface ColorScheme {
  name: string; // For potential display or identification
  color1: string; // Hex for duotoneColor1
  color2: string; // Hex for duotoneColor2
}

export const predefinedColorSchemes: ColorScheme[] = [
  { name: "Forest Mist", color1: "#335402", color2: "#C7E3F6" }, // Default Green / Light Blue
  { name: "Earthy Bark", color1: "#4A3B31", color2: "#A8B868" }, // Dark Brown / Yellow-Green
  { name: "Sunset Grove", color1: "#24330D", color2: "#F9A03F" }, // Dark Green / Orange
  { name: "Desert Bloom", color1: "#5C3D2E", color2: "#EFE2BA" }, // Dark Brown / Cream
  { name: "Spring Leaf", color1: "#335402", color2: "#D4E09B" }, // Green / Light Yellow-Green
  // Add more schemes as needed
];

export interface TreeImage {
  id: string; // e.g., "english_1"
  url: string; // e.g., "/assets/english_bark_1.png"
  altText?: string;
}

export interface TreeType {
  name: string; // e.g., "English Oak"
  id: string; // e.g., "english_oak"
  images: TreeImage[];
}

export const treeTypes: TreeType[] = [
  {
    name: "English Oak",
    id: "english_oak",
    images: [
      {
        id: "eng1",
        url: "/assets/english_bark_1.png",
        altText: "English Oak Bark Texture 1",
      },
      {
        id: "eng2",
        url: "/assets/english_bark_2.png",
        altText: "English Oak Bark Texture 2",
      },
      {
        id: "eng3",
        url: "/assets/english_bark_3.png",
        altText: "English Oak Bark Texture 3",
      },
      {
        id: "eng4",
        url: "/assets/english_bark_4.png",
        altText: "English Oak Bark Texture 4",
      },
      {
        id: "eng5",
        url: "/assets/english_bark_5.png",
        altText: "English Oak Bark Texture 5",
      },
      // Add more English Oak images if you have them
    ],
  },
  {
    name: "Baobab",
    id: "baobab",
    images: [
      {
        id: "bao1",
        url: "/assets/baobab_bark_1.png",
        altText: "Baobab Bark Texture 1",
      },
      {
        id: "bao2",
        url: "/assets/baobab_bark_2.png",
        altText: "Baobab Bark Texture 2",
      },
      // Add more Baobab images if you have them
    ],
  },
  // Add more tree types later
];
