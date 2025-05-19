// src/App.tsx
import { CanvasComponent } from "./components/CanvasComponent";
import { ControlsComponent } from "./components/ControlsComponent";
import { useEffectStore } from "./store/store";
import "./index.css"; // Assuming your Tailwind base styles are here or in main.tsx

function App() {
  const { canvasWidth, canvasHeight } = useEffectStore();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#ECC996] text-gray-700 font-sans">
      {/* Controls Panel */}
      <aside className="w-80 lg:w-96  bg-[#F4F0E6] shadow-2xl overflow-y-auto flex-shrink-0  border-[#24330D]">
        <div className="sticky border-r-1 m-4">

          <ControlsComponent />
        </div>
      </aside>

      {/* Canvas Area */}
      <main className="flex-1 min-w-0 overflow-auto bg-[#F4F0E6] p-4 pl-0">
        <div className="w-max">
          <div
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
            className="overflow-hidden"
          >
            <CanvasComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
