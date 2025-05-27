// src/components/ControlsComponent.tsx
import { useEffectStore } from "../store/store";
import { predefinedColorSchemes, type ColorScheme } from "../data";
import { pulsePresets } from "../data/pulsePresets";
import { motion } from "motion/react";

export function ControlsComponent() {
  const thresholdValue = useEffectStore((state) => state.thresholdValue);
  const setThresholdValue = useEffectStore((state) => state.setThresholdValue);
  const activeColorSchemeName = useEffectStore(
    (state) => state.activeColorSchemeName
  );
  const setActiveColorScheme = useEffectStore(
    (state) => state.setActiveColorScheme
  );
  const availableTreeTypes = useEffectStore(
    (state) => state.availableTreeTypes
  );
  const selectedTreeTypeId = useEffectStore(
    (state) => state.selectedTreeTypeId
  );
  const selectTreeType = useEffectStore((state) => state.selectTreeType);
  // Use selector so component re-renders when isRecording changes
  const isRecording = useEffectStore((s) => s.isRecording);
  const isPaused = useEffectStore((state) => state.isPaused);
  const setIsPaused = useEffectStore((state) => state.setIsPaused);
  const goToNextImage = useEffectStore((state) => state.goToNextImage);
  const canvasWidth = useEffectStore((s) => s.canvasWidth);
  const canvasHeight = useEffectStore((s) => s.canvasHeight);
  const setCanvasSize = useEffectStore((s) => s.setCanvasSize);
  const activePulseName = useEffectStore((s) => s.activePulseName);
  const setPulseProfile = useEffectStore((s) => s.setPulseProfile);


  const handleSchemeSelect = (scheme: ColorScheme) => {
    setActiveColorScheme(scheme);
  };

  const handleTreeSelect = (treeId: string) => {
    selectTreeType(treeId);
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.3, 0.35, 0.0, 1.0] }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              when: "beforeChildren",
              staggerChildren: 0.1,
              delayChildren: 0.8,
              ease: [0.3, 0.35, 0.0, 1.0],
            },
          },
        }}
        className="divide-y-2 divide-[#24330D] text-[#24330D] w-full max-w-none border-t-2 border-l-2 border-b-2 border-r-2 border-[#24330D]"
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <img className="h-8" src="/assets/Tree-Aid-Logo.svg" />
          <h1 className="text-3xl font-bold mb-3 mt-3 ml-3 text-[#24330D]">
            Texture Generator:
          </h1>
        </div>
        {/* Canvas Size Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.3, 0.35, 0.0, 1.0] }}
          className="p-4"
        >
            <label className="block text-sm font-medium mb-2 text-left uppercase">
              Canvas Size (px):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="w-1/2 px-3 py-1 border-2 border-gray-300 text-sm"
                placeholder="Width"
                value={canvasWidth}
                onChange={(e) => {
                  const width = parseInt(e.target.value);
                  if (!isNaN(width)) setCanvasSize(width, canvasHeight);
                }}
              />
              <input
                type="number"
                className="w-1/2 px-3 py-1 border-2 border-gray-300 text-sm"
                placeholder="Height"
                value={canvasHeight}
                onChange={(e) => {
                  const height = parseInt(e.target.value);
                  if (!isNaN(height)) setCanvasSize(canvasWidth, height);
                }}
              />
            </div>
        </motion.div>

        {/* Threshold Slider (existing) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.3, 0.35, 0.0, 1.0] }}
          className="p-4"
        >
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
        </motion.div>

        {/* Fade In and Fade Out Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.3, 0.35, 0.0, 1.0] }}
          className="p-4"
        >
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
        </motion.div>

        {/* Color Scheme Buttons (existing) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.3, 0.35, 0.0, 1.0] }}
          className="p-4"
        >
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
                                  : "ring-1 ring-gray-400 " +
                                    (activeColorSchemeName !== scheme.name
                                      ? "hover:ring-gray-500 hover:bg-[#D2F49E] hover:text-[#24330D]"
                                      : "") +
                                    " transition-colors duration-150 ease-in-out"
                              }
                              flex items-center justify-center overflow-hidden`}
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
        </motion.div>

        {/* Tree Type Selection Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.3, 0.35, 0.0, 1.0] }}
          className="p-4"
        >
            <label className="block text-sm font-medium mb-2 text-left uppercase">
              Texture:
            </label>
            <div className="grid gap-2">
              {availableTreeTypes.map((tree) => (
                <button
                  key={tree.id}
                  onClick={() => handleTreeSelect(tree.id)}
                  className={`px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] ${
                    selectedTreeTypeId === tree.id
                      ? "bg-[#24330D] text-[#D2F49E]"
                      : "bg-transparent text-[#24330D]"
                  } ${
                    selectedTreeTypeId !== tree.id
                      ? "hover:bg-[#D2F49E] hover:text-[#24330D]"
                      : ""
                  }`}
                  aria-pressed={selectedTreeTypeId === tree.id}
                >
                  {tree.name}
                </button>
              ))}
            </div>
        </motion.div>
        {/* Pulse Control Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.3, 0.35, 0.0, 1.0] }}
          className="p-4"
        >
            <label className="block text-sm font-medium mb-2 text-left uppercase">
              Tree Pulse:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {pulsePresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setPulseProfile(preset.name)}
                  className={`px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] ${
                    activePulseName === preset.name
                      ? "bg-[#24330D] text-[#D2F49E]"
                      : "bg-transparent text-[#24330D]"
                  } ${
                    activePulseName !== preset.name
                      ? "hover:bg-[#D2F49E] hover:text-[#24330D]"
                      : ""
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
        </motion.div>

        {/* Playback Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: [0.3, 0.35, 0.0, 1.0] }}
          className="p-4"
        >
            <label className="block text-sm font-medium mb-2 text-left uppercase">
              Animation:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-5 py-3 text-base font-bold border-2 border-[#24330D] transition-colors duration-150 ease-in-out ${
                  isPaused
                    ? "bg-[#D2F49E] text-[#24330D] animate-pulse"
                    : "bg-transparent text-[#24330D]"
                } hover:bg-[#D2F49E] hover:text-[#24330D] flex justify-center items-center`}
              >
                <div className="flex justify-center items-center w-full h-full">
                  {isPaused ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 3v10l9-5-9-5z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3 2h3v12H3V2zm7 0h3v12h-3V2z" />
                    </svg>
                  )}
                </div>
              </button>
              <button
                onClick={() => goToNextImage?.()}
                className="px-5 py-3 text-base font-bold focus:outline-none transition-colors duration-150 ease-in-out border-2 border-[#24330D] hover:bg-[#D2F49E] hover:text-[#24330D] flex justify-center items-center"
              >
                <div className="flex justify-center items-center w-full h-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth=".75"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"
                    />
                    <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192" />
                  </svg>
                </div>
              </button>
            </div>
        </motion.div>

        {/* Export Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: [0.3, 0.35, 0.0, 1.0] }}
          className="p-4"
        >
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
                  isRecording ? "animate-pulse" : ""
                }`}
                style={{
                  backgroundColor: isRecording ? "red" : "transparent",
                  color: isRecording ? "white" : "#24330D",
                  cursor: "pointer",
                }}
              >
                {isRecording ? "Recording..." : "Toggle Video Recording"}
              </button>
            </div>
        </motion.div>
      </motion.div>
    </motion.div>
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
