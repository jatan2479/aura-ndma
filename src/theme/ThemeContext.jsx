import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, SHAPES, FONTS, DENSITIES } from './themeConstants';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('aura_theme') || 'tactical-dark');
  const [shape, setShape] = useState(() => localStorage.getItem('aura_shape') || 'modern');
  const [font, setFont] = useState(() => localStorage.getItem('aura_font') || 'inter');
  const [density, setDensity] = useState(() => localStorage.getItem('aura_density') || 'standard');
  const [customColors, setCustomColors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aura_custom_colors')) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-shape', shape);
    root.setAttribute('data-density', density);
    
    // Apply font
    const selectedFont = FONTS.find(f => f.id === font);
    if (selectedFont) {
      root.style.setProperty('--current-font', selectedFont.family);
      document.body.style.fontFamily = selectedFont.family;
    }

    // Apply custom colors if specified
    Object.entries(customColors).forEach(([key, val]) => {
      if (val) root.style.setProperty(key, val);
    });

    localStorage.setItem('aura_theme', theme);
    localStorage.setItem('aura_shape', shape);
    localStorage.setItem('aura_font', font);
    localStorage.setItem('aura_density', density);
    localStorage.setItem('aura_custom_colors', JSON.stringify(customColors));
  }, [theme, shape, font, density, customColors]);

  const updateCustomColor = (varName, colorHex) => {
    setCustomColors(prev => ({ ...prev, [varName]: colorHex }));
  };

  const resetTheme = () => {
    setTheme('tactical-dark');
    setShape('modern');
    setFont('inter');
    setDensity('standard');
    setCustomColors({});
    localStorage.removeItem('aura_custom_colors');
  };

  return (
    <ThemeContext.Provider value={{
      theme, setTheme,
      shape, setShape,
      font, setFont,
      density, setDensity,
      customColors, updateCustomColor,
      resetTheme,
      THEMES, SHAPES, FONTS, DENSITIES
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
