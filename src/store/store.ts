// src/store.ts
import { create } from "zustand";
import { predefinedColorSchemes } from "../data"; // Keep existing color schemes
import { treeTypes, type TreeType } from "../data"; // Import new tree data
import { pulsePresets } from "../data/pulsePresets"; // Add at top

interface EffectState {
  blurRadius: number;
  thresholdValue: number;
  setThresholdValue: (value: number) => void;
  duotoneColor1: string;
  duotoneColor2: string;
  activeColorSchemeName: string | null;
  setActiveColorScheme: (scheme: {
    color1: string;
    color2: string;
    name: string;
  }) => void;

  // New state for tree types and image cycling
  availableTreeTypes: TreeType[];
  selectedTreeTypeId: string | null;
  // These two URLs will drive the CanvasComponent's texture loading
  currentImageA_url: string | null;
  currentImageB_url: string | null;
  selectTreeType: (treeId: string) => void;

  pulseDurations: number[];
  activePulseName: string;
  pulseIndex: number;
  setPulseProfile: (name: string) => void;
  advancePulse: () => void;

  triggerImageExport?: () => void;
  toggleRecording?: () => void;
  setExportTriggers: (
    imageExportFn: () => void,
    toggleVideoFn: () => void
  ) => void;

  canvasWidth: number;
  canvasHeight: number;
  setCanvasSize: (width: number, height: number) => void;

  // store.ts (EffectState interface)
  useFFmpeg: boolean;
  setUseFFmpeg: (val: boolean) => void;

  isRecording: boolean;
  setIsRecording: (val: boolean) => void;

  currentTextureIndex: number;
  nextTextureIndex: number;
  isFading: boolean;
  setNextTextureIndex: (index: number) => void;
  completeFade: () => void;

  imageShuffleQueue: number[];
  shuffleImages: (treeId: string) => void;

  updateFadeState: () => void;
}

export const useEffectStore = create<EffectState>((set, get) => ({
  // Existing state
  blurRadius: 1.0,
  thresholdValue: 0.85,
  setThresholdValue: (value) =>
    set({ thresholdValue: Math.max(0, Math.min(1, value)) }),
  duotoneColor1: predefinedColorSchemes[0].color1,
  duotoneColor2: predefinedColorSchemes[0].color2,
  activeColorSchemeName: predefinedColorSchemes[0].name,
  setActiveColorScheme: (scheme) =>
    set({
      duotoneColor1: scheme.color1,
      duotoneColor2: scheme.color2,
      activeColorSchemeName: scheme.name,
    }),

  // New state initialization
  availableTreeTypes: treeTypes, // Load tree types from data.ts
  selectedTreeTypeId: treeTypes.length > 0 ? treeTypes[0].id : null, // Default to first tree type

  // Initialize currentImageA_url and currentImageB_url based on the default selected tree
  currentImageA_url:
    treeTypes.length > 0 && treeTypes[0].images.length > 0
      ? treeTypes[0].images[0].url
      : null,
  currentImageB_url:
    treeTypes.length > 0 && treeTypes[0].images.length > 1
      ? treeTypes[0].images[1].url
      : treeTypes.length > 0 && treeTypes[0].images.length > 0
      ? treeTypes[0].images[0].url
      : null, // Fallback to first if only one image

  selectTreeType: (treeId: string) => {
    const selectedTree = get().availableTreeTypes.find((tree) => tree.id === treeId);
    if (selectedTree && selectedTree.images.length > 0) {
      const imageA = selectedTree.images[0].url;
      const imageB = selectedTree.images.length > 1
        ? selectedTree.images[1].url
        : selectedTree.images[0].url;

      set({
        selectedTreeTypeId: treeId,
        currentImageA_url: imageA,
        currentImageB_url: imageB,
      });

      get().shuffleImages(treeId); // Shuffle order and update indices
    } else {
      console.warn(`Tree type with id "${treeId}" not found or has no images.`);
      set({
        selectedTreeTypeId: treeId,
        currentImageA_url: null,
        currentImageB_url: null,
      });
    }
  },
  pulseDurations: pulsePresets[0].durations,
  activePulseName: pulsePresets[0].name,
  pulseIndex: 0,

  setPulseProfile: (name) => {
    const profile = pulsePresets.find((p) => p.name === name);
    if (profile) {
      set({
        activePulseName: profile.name,
        pulseDurations: profile.durations,
        pulseIndex: 0,
      });
    }
  },

  advancePulse: () => {
    const currentIndex = get().pulseIndex;
    const total = get().pulseDurations.length;
    set({ pulseIndex: (currentIndex + 1) % total });
  },
  setExportTriggers: (imageExportFn, toggleVideoFn) => {
    set({
      triggerImageExport: imageExportFn,
      toggleRecording: toggleVideoFn,
    });
  },

  canvasWidth: 1080,
  canvasHeight: 1080,
  setCanvasSize: (width: number, height: number) =>
    set({ canvasWidth: width, canvasHeight: height }),

  useFFmpeg: false,
  setUseFFmpeg: (val) => set({ useFFmpeg: val }),

  isRecording: false,
  setIsRecording: (val) => set({ isRecording: val }),

  currentTextureIndex: 0,
  nextTextureIndex: 1,
  isFading: false,

  setNextTextureIndex: (index) => {
    set({ nextTextureIndex: index, isFading: true });
  },

  completeFade: () => {
    set((state) => ({
      currentTextureIndex: state.nextTextureIndex,
      isFading: false,
    }));
  },

  updateFadeState: () => {
    const { imageShuffleQueue, currentTextureIndex, selectedTreeTypeId } = get();
    if (!selectedTreeTypeId || imageShuffleQueue.length === 0) return;

    const currentIdx = imageShuffleQueue.indexOf(currentTextureIndex);
    const nextIdx = (currentIdx + 1) % imageShuffleQueue.length;
    set({
      nextTextureIndex: imageShuffleQueue[nextIdx],
      isFading: true,
    });
  },

  imageShuffleQueue: [],
  shuffleImages: (treeId: string) => {
    const selectedTree = get().availableTreeTypes.find(t => t.id === treeId);
    if (!selectedTree) return;

    const indices = [...Array(selectedTree.images.length).keys()];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    set({
      imageShuffleQueue: indices,
      currentTextureIndex: indices[0],
      nextTextureIndex: indices.length > 1 ? indices[1] : indices[0],
      selectedTreeTypeId: treeId,
    });
  },
}));
