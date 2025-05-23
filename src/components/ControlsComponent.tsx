// src/components/ControlsComponent.tsx
import { useEffectStore } from "../store/store";
import { predefinedColorSchemes, type ColorScheme } from "../data";
import { pulsePresets } from "../data/pulsePresets";

export function ControlsComponent() {
  const thresholdValue = useEffectStore(state => state.thresholdValue);
  const setThresholdValue = useEffectStore(state => state.setThresholdValue);
  const activeColorSchemeName = useEffectStore(state => state.activeColorSchemeName);
  const setActiveColorScheme = useEffectStore(state => state.setActiveColorScheme);
  const availableTreeTypes = useEffectStore(state => state.availableTreeTypes);
  const selectedTreeTypeId = useEffectStore(state => state.selectedTreeTypeId);
  const selectTreeType = useEffectStore(state => state.selectTreeType);
  // Use selector so component re-renders when isRecording changes
  const isRecording = useEffectStore(s => s.isRecording);
  const isPaused = useEffectStore(state => state.isPaused);
  const setIsPaused = useEffectStore(state => state.setIsPaused);
  const goToNextImage = useEffectStore(state => state.goToNextImage);
  const goToPreviousImage = useEffectStore(state => state.goToPreviousImage);

  const handleSchemeSelect = (scheme: ColorScheme) => {
    setActiveColorScheme(scheme);
  };

  const handleTreeSelect = (treeId: string) => {
    selectTreeType(treeId);
  };


  return (
    <div className="divide-y divide-[#24330D] bg-opacity-50 text-[#24330D] w-full max-w-none border-r-1 border-t-2 border-l-2 border-b-1">
      <div className="flex">
        <h1 className="text-3xl font-bold mb-3 mt-3 ml-3 text-[#24330D]">
          Texture Generator
        </h1>
        
      </div>
      {/* Canvas Size Controls */}
      <div className="border-t-1 border-[#24330D] p-4 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-left uppercase">
          Canvas Size (px):
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            className="w-1/2 px-3 py-1 border-2 border-gray-300 text-sm"
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
            className="w-1/2 px-3 py-1 border-2 border-gray-300 text-sm"
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
      <div className="border-t border-b border-[#24330D] p-4 shadow-sm">
        <label
          htmlFor="thresholdValue"
          className="block text-sm font-medium mb-1 text-left uppercase"
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

      {/* Fade In and Fade Out Buttons */}
      <div className="border-t border-b border-[#24330D] p-4 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-left uppercase">
          Loop Fade Tools:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => animateThreshold(thresholdValue, 0.5, 2000)}
            className="px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] hover:bg-[#D2F49E] hover:text-[#24330D]"
          >
            Fade In
          </button>
          <button
            onClick={() => animateThreshold(thresholdValue, 0.0, 2000)}
            className="px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] hover:bg-[#D2F49E] hover:text-[#24330D]"
          >
            Fade Out
          </button>
        </div>
      </div>


      {/* Color Scheme Buttons (existing) */}
      <div className="border-t border-b border-[#24330D] p-4 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-left uppercase">
          Colour Scheme:
        </label>
        <div className="grid grid-cols-5 gap-2">
          {predefinedColorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              title={scheme.name}
              onClick={() => handleSchemeSelect(scheme)}
              className={`aspect-square w-full focus:outline-none transition-all duration-150 ease-in-out
                          ${
                            activeColorSchemeName === scheme.name
                              ? "ring-2 ring-offset-2 ring-[#335402] ring-offset-[#cdc9bf]"
                              : "ring-1 ring-gray-400 " + (activeColorSchemeName !== scheme.name ? "hover:ring-gray-500 hover:bg-[#D2F49E] hover:text-[#24330D]" : "") + " transition-colors duration-150 ease-in-out"
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

      {/* Tree Type Selection Buttons */}
      <div className="border-t border-b border-[#24330D] p-4 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-left uppercase">
          Texture:
        </label>
        <div className="flex flex-col gap-2">
          {availableTreeTypes.map((tree) => (
            <button
              key={tree.id}
              onClick={() => handleTreeSelect(tree.id)}
              className={`px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] ${
                selectedTreeTypeId === tree.id
                  ? "bg-[#24330D] text-[#D2F49E]"
                  : "bg-transparent text-[#24330D]"
              } ${selectedTreeTypeId !== tree.id ? "hover:bg-[#D2F49E] hover:text-[#24330D]" : ""}`}
              aria-pressed={selectedTreeTypeId === tree.id}
            >
              {tree.name}
            </button>
          ))}
        </div>
      </div>
      {/* Pulse Control Buttons */}
      <div className="border-t border-b border-[#24330D] p-4 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-left uppercase">
          Tree Pulse:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {pulsePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() =>
                useEffectStore.getState().setPulseProfile(preset.name)
              }
              className={`px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] ${
                useEffectStore.getState().activePulseName === preset.name
                  ? "bg-[#24330D] text-[#D2F49E]"
                  : "bg-transparent text-[#24330D]"
              } ${useEffectStore.getState().activePulseName !== preset.name ? "hover:bg-[#D2F49E] hover:text-[#24330D]" : ""}`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="border-t border-b border-[#24330D] p-4 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-left uppercase">
          Playback:
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => goToPreviousImage?.()}
            className="px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] hover:bg-[#D2F49E] hover:text-[#24330D]"
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-5 py-3 text-base font-bold border-2 border-[#24330D] transition-colors duration-150 ease-in-out ${
              isPaused
                ? "bg-[#D2F49E] text-[#24330D]"
                : "bg-transparent text-[#24330D]"
            } hover:bg-[#D2F49E] hover:text-[#24330D]`}
          >
            {isPaused ? "Play" : "Pause"}
          </button>
          <button
            onClick={() => goToNextImage?.()}
            className="px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] hover:bg-[#D2F49E] hover:text-[#24330D]"
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="border-t border-b border-[#24330D] p-4 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-left uppercase">
          Export:
        </label>
        <div className="flex-col flex gap-2">
          <button
            onClick={() => {
              console.log("Export Image button clicked");
              useEffectStore.getState().triggerImageExport?.();
            }}
            className="px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] hover:bg-[#D2F49E] hover:text-[#24330D]"
          >
            Export Image
          </button>
          <button
            onClick={() => {
              console.log(
                isRecording ? "Recording stopped" : "Recording started"
              );
              useEffectStore.getState().toggleRecording?.();
            }}
            className={`px-5 py-3 text-base font-bold border-2 border-[#24330D] transition-colors duration-150 ease-in-out ${
              isRecording
                ? "animate-pulse"
                : ""
            }`}
            style={{
              backgroundColor: isRecording ? "red" : "transparent",
              color: isRecording ? "white" : "#24330D",
              cursor: "pointer"
            }}
          >
            {isRecording ? "Recording..." : "Toggle Video Recording"}
          </button>
        </div>
      </div>
      {/* <button
        onClick={() =>
          useEffectStore
            .getState()
            .setUseFFmpeg(!useEffectStore.getState().useFFmpeg)
        }
        className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
      >
        Export Format:{" "}
        {useEffectStore.getState().useFFmpeg ? "MP4 (H.264)" : "WebM"}
      </button> */}
    </div>
  );
}

function animateThreshold(from: number, to: number, duration: number) {
  const startTime = performance.now();
  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const value = from + (to - from) * eased;
    useEffectStore.getState().setThresholdValue(value);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}
