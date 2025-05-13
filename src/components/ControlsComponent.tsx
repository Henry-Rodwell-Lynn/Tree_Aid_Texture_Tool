// src/components/ControlsComponent.tsx
import React from 'react';
import { useEffectStore } from '../store/store';
import { predefinedColorSchemes, type ColorScheme } from '../data'; // Import schemes

export function ControlsComponent() {
  const {
    // blurRadius, // No longer needed from store for UI control
    thresholdValue, setThresholdValue,
    // duotoneColor1, setDuotoneColor1, // No longer individual pickers
    // duotoneColor2, setDuotoneColor2,
    activeColorSchemeName, // To highlight active scheme
    setActiveColorScheme,  // New setter for schemes
  } = useEffectStore();

  const handleSchemeSelect = (scheme: ColorScheme) => {
    setActiveColorScheme(scheme);
  };

  return (
    <div className="p-4 space-y-6 bg-opacity-50 text-[#24330D] rounded-lg w-full"> {/* Adjusted background for new theme */}
      {/* Threshold Value Slider */}
      <div>
        <label htmlFor="thresholdValue" className="block text-sm font-medium mb-1">
          Threshold: <span className="font-mono bg-gray-300 text-gray-700 px-1 rounded">{thresholdValue.toFixed(2)}</span>
        </label>
        <input
          type="range"
          id="thresholdValue"
          min="0"
          max="1"
          step="0.01"
          value={thresholdValue}
          onChange={(e) => setThresholdValue(parseFloat(e.target.value))}
          className="w-full h-3 bg-gray-400 rounded-lg appearance-none cursor-pointer accent-[#335402]" // Styled accent
        />
      </div>

      {/* Predefined Color Scheme Buttons */}
      <div>
        <label className="block text-sm font-medium mb-2">Colour Scheme:</label>
        <div className="grid grid-cols-3 gap-2"> {/* Adjust grid columns as needed */}
          {predefinedColorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              title={scheme.name}
              onClick={() => handleSchemeSelect(scheme)}
              className={`w-full aspect-square rounded-md focus:outline-none transition-all duration-150 ease-in-out
                          ${activeColorSchemeName === scheme.name ? 'ring-2 ring-offset-2 ring-[#335402] ring-offset-[#cdc9bf]' : 'ring-1 ring-gray-400 hover:ring-gray-500'}
                          flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg`}
              aria-pressed={activeColorSchemeName === scheme.name}
            >
              {/* Visual representation of the color scheme */}
              <div className="w-full h-full flex">
                <div style={{ backgroundColor: scheme.color1 }} className="w-1/2 h-full"></div>
                <div style={{ backgroundColor: scheme.color2 }} className="w-1/2 h-full"></div>
              </div>
              {/* Optional: Add scheme name if design allows, or use tooltip */}
              {/* <span className="text-xs mt-1">{scheme.name}</span> */}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
