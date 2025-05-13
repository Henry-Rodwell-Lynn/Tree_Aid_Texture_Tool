// src/App.tsx
import { CanvasComponent } from './components/CanvasComponent';
import { ControlsComponent } from './components/ControlsComponent';
import './index.css'; // Assuming your Tailwind base styles are here or in main.tsx

function App() {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F4F0E6] text-gray-700 font-sans"> {/* Adjusted text color for better contrast on light bg */}
      {/* Controls Panel */}
      <aside className="w-full md:w-72 lg:w-80 p-6 bg-[#cdc9bf] shadow-2xl overflow-y-auto">
        <div className="sticky top-6"> {/* Adjusted sticky top for padding */}
          <h1 className="text-3xl font-bold mb-6 text-[#24330D]">Texture Generator</h1>
          <ControlsComponent />
        </div>
      </aside>

      {/* Canvas Area */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 bg-[#F4F0E6] overflow-hidden">
        <div className="w-full h-auto max-w-4xl max-h-[85vh] aspect-square rounded-lg overflow-hidden shadow-lg"> {/* Added shadow to canvas container */}
          <CanvasComponent
            width={1024} // Example: Initial render buffer width
            height={1024} // Example: Initial render buffer height
          />
        </div>
      </main>
    </div>
  );
}

export default App;
