// src/App.tsx
import { CanvasComponent } from "./components/CanvasComponent";
import { ControlsComponent } from "./components/ControlsComponent";
import { useEffectStore } from "./store/store";
import "./index.css"; // Assuming your Tailwind base styles are here or in main.tsx
import { motion } from "motion/react";
import { useRef } from "react";

function App() {
  const { canvasWidth, canvasHeight } = useEffectStore();
  const isFirstRender = useRef(true);

  return (
    <div className="flex flex-row h-screen bg-[#F4F0E6] text-gray-700 font-sans">
      {/* Controls Panel */}
      <aside className="w-96 h-auto bg-[#F4F0E6] overflow-y-auto flex-shrink-0 border-[#24330D]">
        <div className="sticky m-4">
          <ControlsComponent />
        </div>
      </aside>
      {/* Canvas Area */}
      <main className="flex-1 min-w-0 overflow-auto bg-[#F4F0E6] p-4 pl-0">
        <div className="w-max">
          <motion.div
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: canvasHeight, opacity: 100 }}
            transition={{
              duration: 0.8,

              ease: [0.3, 0.35, 0.0, 1.0],
              delay: isFirstRender.current ? 0.75 : 0,
            }}
            onAnimationComplete={() => {
              isFirstRender.current = false;
            }}
            style={{
              width: `${canvasWidth}px`,
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
          >
            <CanvasComponent />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;
