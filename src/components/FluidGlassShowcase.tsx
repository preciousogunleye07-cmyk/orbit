import React, { useState } from 'react';
import FluidGlass from './FluidGlass';
import { Eye, Layers, Navigation, Sparkles } from 'lucide-react';

export const FluidGlassShowcase: React.FC = () => {
  const [mode, setMode] = useState<'lens' | 'cube' | 'bar'>('lens');

  return (
    <section className="max-w-[1200px] mx-auto px-6 my-16">
      <div className="bg-[#181524] border border-[#332d47] rounded-[24px] overflow-hidden shadow-2xl relative">
        {/* Header Bar */}
        <div className="p-6 sm:p-8 border-b border-[#332d47] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive 3D Fluid Canvas
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">
              Orbit Space Visual Experience
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light mt-1 max-w-xl">
              Interact with our dynamic WebGL fluid glass refraction lens. Move your cursor or touch to distort and explore the campus gallery in real time.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 bg-[#100e17] p-1.5 rounded-full border border-[#332d47] shrink-0 self-start md:self-auto">
            <button
              onClick={() => setMode('lens')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                mode === 'lens'
                  ? 'bg-[#8b5cf6] text-[#ffffff] shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lens</span>
            </button>

            <button
              onClick={() => setMode('cube')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                mode === 'cube'
                  ? 'bg-[#8b5cf6] text-[#ffffff] shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cube</span>
            </button>

            <button
              onClick={() => setMode('bar')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                mode === 'bar'
                  ? 'bg-[#8b5cf6] text-[#ffffff] shadow-md'
                  : 'text-[#c4c7c8] hover:text-[#ffffff]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Bar Nav</span>
            </button>
          </div>
        </div>

        {/* WebGL Canvas Height Container */}
        <div className="relative h-[480px] w-full bg-[#100e17] cursor-grab active:cursor-grabbing">
          <FluidGlass
            mode={mode}
            lensProps={{
              scale: 0.28,
              ior: 1.2,
              thickness: 6,
              chromaticAberration: 0.15,
              anisotropy: 0.02
            }}
            barProps={{
              navItems: [
                { label: 'Academy', link: '#courses' },
                { label: 'SIWES', link: '#siwes' },
                { label: 'Workspace', link: '#workspace' },
                { label: 'Admissions', link: '#enroll' }
              ]
            }}
            cubeProps={{
              scale: 0.25,
              ior: 1.18,
              thickness: 5
            }}
          />

          {/* Interactive Hint Banner */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-[#100e17]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#332d47] text-[11px] text-[#c4c7c8] font-mono flex items-center gap-2 shadow-lg z-10">
            <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-ping" />
            <span>Hover / Scroll inside canvas to refractor images and title text</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FluidGlassShowcase;
