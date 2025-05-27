// src/data.ts

export interface ColorScheme {
  name: string; // For potential display or identification
  color1: string; // Hex for duotoneColor1
  color2: string; // Hex for duotoneColor2
}

export const predefinedColorSchemes: ColorScheme[] = [
  { name: "TA Dark Green - TA Green", color1: "#24330D", color2: "#335402" },
  { name: "TA Green - 4B7D01", color1: "#335402", color2: "#416C02" }, 
  { name: "Baobab Green - D4D418", color1: "#BDBC1D", color2: "#D4D418" }, 
  { name: "Tree Bark Brown - 8A4A1F", color1: "#4E2F1D", color2: "#8A4A1F" },
  { name: "Shea Nut Beige - F5B377", color1: "#ECC996", color2: "#FFDEB2" }, 
  { name: "Boulie Beige - EFDEB2", color1: "#F4F0E6", color2: "#EFDEB2" },
  { name: "Cashew Orange - FF9E3E", color1: "#FF8433", color2: "#FF9E3E" },
  { name: "Cashew Yellow - DEDA45", color1: "#FFF86D", color2: "#DEDA45" },
  { name: "Seedling Green - EAFFCA", color1: "#D2F49E", color2: "#EAFFCA" },
  { name: "Blue Sky - DAF0FF", color1: "#C7E3F6", color2: "#DDEFFB" },
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
