// src/components/ControlsComponent.tsx
import React from "react";
import { useEffectStore } from "../store/store";
import { predefinedColorSchemes, type ColorScheme } from "../data";
import { pulsePresets } from "../data/pulsePresets";

export function ControlsComponent() {
  const {
    thresholdValue,
    setThresholdValue,
    activeColorSchemeName,
    setActiveColorScheme,
    availableTreeTypes,
    selectedTreeTypeId,
    selectTreeType, // New from store
  } = useEffectStore();

  const handleSchemeSelect = (scheme: ColorScheme) => {
    setActiveColorScheme(scheme);
  };

  const handleTreeSelect = (treeId: string) => {
    selectTreeType(treeId);
  };

  const isRecording = useEffectStore((s) => s.isRecording);

  return (
    <div className="p-4 space-y-6 bg-opacity-50 text-[#24330D] rounded-lg w-full">
      {/* Canvas Size Controls */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Canvas Size (px):
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            className="w-1/2 px-3 py-1 rounded border border-gray-300 text-sm"
            placeholder="Width"
            value={useEffectStore((s) => s.canvasWidth)}
            onChange={(e) => {
              const width = parseInt(e.target.value);
              if (!isNaN(width))
                useEffectStore
                  .getState()
                  .setCanvasSize(width, useEffectStore.getState().canvasHeight);
            }}
          />
          <input
            type="number"
            className="w-1/2 px-3 py-1 rounded border border-gray-300 text-sm"
            placeholder="Height"
            value={useEffectStore((s) => s.canvasHeight)}
            onChange={(e) => {
              const height = parseInt(e.target.value);
              if (!isNaN(height))
                useEffectStore
                  .getState()
                  .setCanvasSize(useEffectStore.getState().canvasWidth, height);
            }}
          />
        </div>
      </div>

      {/* Threshold Slider (existing) */}
      <div>
        <label
          htmlFor="thresholdValue"
          className="block text-sm font-medium mb-1"
        >
          Threshold:{" "}
          <span className="font-mono bg-gray-300 text-gray-700 px-1 rounded">
            {thresholdValue.toFixed(2)}
          </span>
        </label>
        <input
          type="range"
          id="thresholdValue"
          min="0"
          max="1"
          step="0.01"
          value={thresholdValue}
          onChange={(e) => setThresholdValue(parseFloat(e.target.value))}
          className="w-full h-3 bg-gray-400 rounded-lg appearance-none cursor-pointer accent-[#335402]"
        />
      </div>

      {/* Color Scheme Buttons (existing) */}
      <div>
        <label className="block text-sm font-medium mb-2">Colour Scheme:</label>
        <div className="grid grid-cols-3 gap-2">
          {predefinedColorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              title={scheme.name}
              onClick={() => handleSchemeSelect(scheme)}
              className={`w-full aspect-square rounded-md focus:outline-none transition-all duration-150 ease-in-out
                          ${
                            activeColorSchemeName === scheme.name
                              ? "ring-2 ring-offset-2 ring-[#335402] ring-offset-[#cdc9bf]"
                              : "ring-1 ring-gray-400 hover:ring-gray-500"
                          }
                          flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg`}
              aria-pressed={activeColorSchemeName === scheme.name}
            >
              <div className="w-full h-full flex">
                <div
                  style={{ backgroundColor: scheme.color1 }}
                  className="w-1/2 h-full"
                ></div>
                <div
                  style={{ backgroundColor: scheme.color2 }}
                  className="w-1/2 h-full"
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* NEW: Tree Type Selection Buttons */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Form (Tree Type):
        </label>
        <div className="grid grid-cols-2 gap-3">
          {" "}
          {/* Or grid-cols-3 if more types */}
          {availableTreeTypes.map((tree) => (
            <button
              key={tree.id}
              onClick={() => handleTreeSelect(tree.id)}
              className={`px-4 py-3 rounded-md text-sm font-semibold focus:outline-none transition-colors duration-150 ease-in-out shadow
                          ${
                            selectedTreeTypeId === tree.id
                              ? "bg-[#335402] text-white hover:bg-opacity-90"
                              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                          }`}
              aria-pressed={selectedTreeTypeId === tree.id}
            >
              {tree.name}
            </button>
          ))}
        </div>
      </div>
      {/* Pulse Control Buttons */}
      <div>
        <label className="block text-sm font-medium mb-2">Tree Pulse:</label>
        <div className="flex gap-2">
          {pulsePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() =>
                useEffectStore.getState().setPulseProfile(preset.name)
              }
              className={`px-3 py-2 rounded-md text-sm font-semibold shadow transition-all duration-150 ease-in-out
          ${
            useEffectStore.getState().activePulseName === preset.name
              ? "bg-[#335402] text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      {/* Export Buttons */}
      <div>
        <label className="block text-sm font-medium mb-2">Export:</label>
        <div className="flex-col flex gap-2">
          <button
            onClick={() => {
              console.log("Export Image button clicked");
              useEffectStore.getState().triggerImageExport?.();
            }}
            className="w-full bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md shadow hover:bg-gray-400 transition-all duration-150"
          >
            Export Image
          </button>
          <button
            onClick={() => {
              console.log(isRecording ? "Recording stopped" : "Recording started");
              useEffectStore.getState().toggleRecording?.();
            }}
            className={`w-full font-medium px-4 py-2 rounded-md shadow transition-all duration-150 ${
              isRecording
                ? "bg-red-600 text-white animate-pulse hover:bg-red-700"
                : "bg-gray-300 text-gray-700 hover:bg-red-600 hover:text-white"
            }`}
          >
            {isRecording ? "Recording..." : "Toggle Video Recording"}
          </button>
        </div>
      </div>
      <button
        onClick={() =>
          useEffectStore
            .getState()
            .setUseFFmpeg(!useEffectStore.getState().useFFmpeg)
        }
        className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
      >
        Export Format:{" "}
        {useEffectStore.getState().useFFmpeg ? "MP4 (H.264)" : "WebM"}
      </button>
    </div>
  );
}
