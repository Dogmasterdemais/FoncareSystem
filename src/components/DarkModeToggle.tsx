"use client";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function DarkModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('DarkModeToggle mounted:', { theme, resolvedTheme });
  }, [theme, resolvedTheme]);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    console.log('Toggling theme from', resolvedTheme, 'to', newTheme);
    setTheme(newTheme);
    
    // Força a aplicação imediata
    setTimeout(() => {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, 50);
  };

  if (!mounted) {
    return (
      <button className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm">
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button 
      onClick={toggleTheme} 
      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm"
      title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo escuro'}
    >
      {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
