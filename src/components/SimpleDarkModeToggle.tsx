"use client";
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SimpleDarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(initialDark);
    
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);
    
    if (newDarkState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Switched to DARK mode');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Switched to LIGHT mode');
    }
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm"
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
