// src/data.ts

export interface ColorScheme {
  name: string; // For potential display or identification
  color1: string; // Hex for duotoneColor1
  color2: string; // Hex for duotoneColor2
}

export const predefinedColorSchemes: ColorScheme[] = [
  { name: "Forest Mist", color1: "#4B7D01", color2: "#335402" }, // Default Green / Light Blue
  { name: "Earthy Bark", color1: "#D4D418", color2: "#BDBC1D" }, // Dark Brown / Yellow-Green
  { name: "Sunset Grove", color1: "#C66420", color2: "#4E2F1D" }, // Dark Green / Orange
  { name: "Desert Bloom", color1: "#FF9D58", color2: "#ECC996" }, // Dark Brown / Cream
  { name: "Spring Leaf", color1: "#EACC7E", color2: "#F4F0E6" },
  { name: "Spring Lesf", color1: "#FF9E3E", color2: "#FF8433" }, // Green / Light Yellow-Green
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
    name: "Oak",
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
  {
    name: "Shea",
    id: "shea",
    images: [
      {
        id: "shea1",
        url: "/assets/shea_1.png",
        altText: "Shea Bark Texture 1",
      },
      {
        id: "shea2",
        url: "/assets/shea_2.png",
        altText: "Shea Bark Texture 2",
      },
    ],
  },
  {
    name: "Moringa",
    id: "moringa",
    images: [
      {
        id: "moringa1",
        url: "/assets/moringa_1.png",
        altText: "Moringa Bark Texture 1",
      },
      {
        id: "moringa2",
        url: "/assets/moringa_2.png",
        altText: "Moringa Bark Texture 2",
      },
    ],
  },
  {
    name: "Mango",
    id: "mango",
    images: [
      {
        id: "mango1",
        url: "/assets/mango_bark_1.png",
        altText: "Mango Bark Texture 1",
      },
      {
        id: "mango2",
        url: "/assets/mango_bark_2.png",
        altText: "Mango Bark Texture 2",
      },
    ],
  },
  {
    name: "Cashew",
    id: "cashew",
    images: [
      {
        id: "cashew1",
        url: "/assets/cashew_bark_1.png",
        altText: "Cashew Bark Texture 1",
      },
      {
        id: "cashew2",
        url: "/assets/cashew_bark_2.png",
        altText: "Cashew Bark Texture 2",
      },
    ],
  },
  {
    name: "Acacia",
    id: "acacia",
    images: [
      {
        id: "acacia1",
        url: "/assets/acacia_bark_1.png",
        altText: "Acacia Bark Texture 1",
      },
      {
        id: "acacia2",
        url: "/assets/acacia_bark_2.png",
        altText: "Acacia Bark Texture 2",
      },
    ],
  },
  {
    name: "Foliage",
    id: "foliage",
    images: [
      {
        id: "foliage1",
        url: "/assets/foliage_1.png",
        altText: "Foliage Texture 1",
      },
      {
        id: "foliage2",
        url: "/assets/foliage_2.png",
        altText: "Foliage Texture 2",
      },
    ],
  },
];
