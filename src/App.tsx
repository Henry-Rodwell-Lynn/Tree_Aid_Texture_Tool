// src/App.tsx
import { CanvasComponent } from './components/CanvasComponent';
import { ControlsComponent } from './components/ControlsComponent';
import { useEffectStore } from './store/store';
import './index.css'; // Assuming your Tailwind base styles are here or in main.tsx

function App() {
  const { canvasWidth, canvasHeight } = useEffectStore();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F4F0E6] text-gray-700 font-sans">
      {/* Controls Panel */}
      <aside className="w-72 lg:w-80 p-6 bg-[#cdc9bf] shadow-2xl overflow-y-auto flex-shrink-0">
        <div className="sticky top-6">
          <h1 className="text-3xl font-bold mb-6 text-[#24330D]">Texture Generator</h1>
          <ControlsComponent />
        </div>
      </aside>

      {/* Canvas Area */}
      <main className="flex-1 min-w-0 overflow-auto bg-[#F4F0E6] p-4 md:p-8">
        <div className="w-max">
          <div
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
            className="rounded-lg overflow-hidden shadow-lg"
          >
            <CanvasComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
