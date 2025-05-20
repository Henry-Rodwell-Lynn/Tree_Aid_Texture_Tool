// src/data.ts

export interface ColorScheme {
  name: string; // For potential display or identification
  color1: string; // Hex for duotoneColor1
  color2: string; // Hex for duotoneColor2
}

export const predefinedColorSchemes: ColorScheme[] = [
  { name: "Desert Bloom", color1: "#24330D", color2: "#335402" },
  { name: "Forest Mist", color1: "#4B7D01", color2: "#335402" }, // Default Green / Light Blue
  { name: "Earthy Bark", color1: "#D4D418", color2: "#BDBC1D" }, // Dark Brown / Yellow-Green
  { name: "Sunset Grove", color1: "#C66420", color2: "#4E2F1D" },
  { name: "Spring Lesf", color1: "#FF9E3E", color2: "#FF8433" }, // Dark Green / Orange
  // Dark Brown / Cream
  { name: "Spring Leaf", color1: "#ECC996", color2: "#FFDEB2" },
  { name: "Spring Laf", color1: "#EACC7E", color2: "#F4F0E6" },
  // Green / Light Yellow-Green
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
    name: "Tree Bark",
    id: "Tree Bark",
    images: [
      {
        id: "TB1",
        url: "/assets/Tree_Bark_1.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB2",
        url: "/assets/Tree_Bark_2.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB3",
        url: "/assets/Tree_Bark_3.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB4",
        url: "/assets/Tree_Bark_4.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB5",
        url: "/assets/Tree_Bark_5.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB6",
        url: "/assets/Tree_Bark_6.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB7",
        url: "/assets/Tree_Bark_7.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB8",
        url: "/assets/Tree_Bark_8.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB9",
        url: "/assets/Tree_Bark_9.webp",
        altText: "Tree Bark",
      },
      {
        id: "TB10",
        url: "/assets/Tree_Bark_10.webp",
        altText: "Tree Bark",
      },
    ],
  },
  {
    name: "Produce & Foliage",
    id: "Produce & Foliage",
    images: [
      {
        id: "pandf1",
        url: "/assets/fandp_1.webp",
        altText: "Produce & Foliage",
      },
      {
        id: "pandf2",
        url: "/assets/fandp_2.webp",
        altText: "Produce & Foliage",
      },
      {
        id: "pandf3",
        url: "/assets/fandp_3.webp",
        altText: "Produce & Foliage",
      },
      {
        id: "pandf4",
        url: "/assets/fandp_4.webp",
        altText: "Produce & Foliage",
      },
      {
        id: "pandf5",
        url: "/assets/fandp_5.webp",
        altText: "Produce & Foliage",
      },
      {
        id: "pandf6",
        url: "/assets/fandp_6.webp",
        altText: "Produce & Foliage",
      },
      {
        id: "pandf7",
        url: "/assets/fandp_7.webp",
        altText: "Produce & Foliage",
      },
      {
        id: "pandf8",
        url: "/assets/fandp_8.webp",
        altText: "Produce & Foliage",
      },
    ],
  },
  {
    name: "Landscapes",
    id: "Landscapes",
    images: [
      {
        id: "ls1",
        url: "/assets/ls_1.webp",
        altText: "Landscape",
      },
      {
        id: "ls2",
        url: "/assets/ls_2.webp",
        altText: "Landscape",
      },
      {
        id: "ls3",
        url: "/assets/ls_3.webp",
        altText: "Landscape",
      },
      {
        id: "ls4",
        url: "/assets/ls_4.webp",
        altText: "Landscape",
      },
      {
        id: "ls5",
        url: "/assets/ls_5.webp",
        altText: "Landscape",
      },
      {
        id: "ls6",
        url: "/assets/ls_6.webp",
        altText: "Landscape",
      },
      {
        id: "ls7",
        url: "/assets/ls_7.webp",
        altText: "Landscape",
      },
      {
        id: "ls8",
        url: "/assets/ls_8.webp",
        altText: "Landscape",
      },
    ],
  },
];
