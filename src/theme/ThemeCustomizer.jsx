import React, { useState } from 'react';
import { Palette, X, RotateCcw, Check, Sparkles, Sliders, Type, Maximize2 } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { THEMES, SHAPES, FONTS, DENSITIES } from './themeConstants';

export default function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme, setTheme,
    shape, setShape,
    font, setFont,
    density, setDensity,
    customColors, updateCustomColor,
    resetTheme
  } = useTheme();

  return (
    <>
      {/* Floating Theme Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-2 border border-blue-400/40"
        title="Customize UI & Visual Design"
        aria-label="Open Design Customizer"
      >
        <Palette size={20} className="animate-spin-slow" />
        <span className="text-xs font-bold hidden sm:inline">Design System</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
          <div 
            className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--color-text-primary)' }}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Palette size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Design & Theme Engine</h3>
                    <p className="text-xs text-slate-400">Decoupled styling tokens</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Notice Banner */}
              <div className="p-3 mb-6 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2">
                <Sparkles size={16} className="shrink-0 mt-0.5 text-blue-400" />
                <span>
                  Adjust any visual attribute instantly. <strong>No backend hardware features or map GPS calculations will be interrupted.</strong>
                </span>
              </div>

              {/* 1. Color Theme Presets */}
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                  <Sliders size={14} /> Color Palette Preset
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        theme === t.id 
                          ? 'border-blue-500 bg-blue-500/10 font-bold' 
                          : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs" 
                          style={{ backgroundColor: t.preview }} 
                        />
                        <span className="text-xs">{t.name}</span>
                      </div>
                      {theme === t.id && <Check size={14} className="text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Shape / Corner Radius */}
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                  <Maximize2 size={14} /> Component Shape & Corners
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {SHAPES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setShape(s.id)}
                      className={`p-2.5 text-xs rounded-xl border transition flex items-center justify-between ${
                        shape === s.id 
                          ? 'border-blue-500 bg-blue-500/10 font-bold text-blue-300' 
                          : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{s.name}</span>
                      {shape === s.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Font Family */}
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                  <Type size={14} /> Typography
                </label>
                <div className="space-y-2">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFont(f.id)}
                      className={`w-full p-2.5 text-xs rounded-xl border text-left transition flex items-center justify-between ${
                        font === f.id 
                          ? 'border-blue-500 bg-blue-500/10 font-bold text-blue-300' 
                          : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                      }`}
                      style={{ fontFamily: f.family }}
                    >
                      <span>{f.name}</span>
                      {font === f.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Density / Scale */}
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                  <Sliders size={14} /> Sizing & Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DENSITIES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDensity(d.id)}
                      className={`p-2 text-xs rounded-xl border text-center transition ${
                        density === d.id 
                          ? 'border-blue-500 bg-blue-500/10 font-bold text-blue-300' 
                          : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d.id.charAt(0).toUpperCase() + d.id.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Custom Color Override Hex Pickers */}
              <div className="mb-6 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                  Custom Accent Overrides
                </label>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Distress Red Glow</span>
                    <input 
                      type="color" 
                      value={customColors['--color-distress'] || '#EF4444'} 
                      onChange={(e) => updateCustomColor('--color-distress', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Command Blue</span>
                    <input 
                      type="color" 
                      value={customColors['--color-command'] || '#3B82F6'} 
                      onChange={(e) => updateCustomColor('--color-command', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Readiness Green</span>
                    <input 
                      type="color" 
                      value={customColors['--color-readiness'] || '#10B981'} 
                      onChange={(e) => updateCustomColor('--color-readiness', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Reset & Apply */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={resetTheme}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition"
              >
                <RotateCcw size={14} /> Reset Defaults
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-lg shadow-blue-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
