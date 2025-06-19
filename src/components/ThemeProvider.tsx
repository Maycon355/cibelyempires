'use client';
import React, { createContext, useState, useContext } from 'react';

type Theme = 'modern' | 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'modern',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('modern');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div
        className={
          (theme === 'modern'
            ? 'min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 transition-colors duration-500 text-black'
            : theme === 'dark'
            ? 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 transition-colors duration-500 text-white'
            : 'min-h-screen bg-gradient-to-br from-white via-gray-100 to-blue-100 transition-colors duration-500 text-black')
        }
      >
        {/* Seletor de tema fixo no topo direito */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeSelector />
        </div>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <div className="flex gap-2 bg-white/80 rounded shadow px-3 py-2 items-center">
      <span className="text-xs font-semibold text-gray-700">Tema:</span>
      <button
        className={`rounded px-2 py-1 text-xs font-bold border ${theme === 'modern' ? 'bg-gradient-to-r from-blue-400 to-pink-400 text-white border-blue-400' : 'border-gray-300 text-gray-700'}`}
        onClick={() => setTheme('modern')}
      >
        Degradê
      </button>
      <button
        className={`rounded px-2 py-1 text-xs font-bold border ${theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'border-gray-300 text-gray-700'}`}
        onClick={() => setTheme('dark')}
      >
        Escuro
      </button>
      <button
        className={`rounded px-2 py-1 text-xs font-bold border ${theme === 'light' ? 'bg-blue-100 text-blue-900 border-blue-300' : 'border-gray-300 text-gray-700'}`}
        onClick={() => setTheme('light')}
      >
        Claro
      </button>
    </div>
  );
} 