"use client";
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ForceDarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(initialDark);
    applyTheme(initialDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    const body = document.body;
    
    if (dark) {
      // Aplicar modo escuro
      html.classList.add('dark');
      body.style.backgroundColor = '#0f172a'; // slate-900
      body.style.color = '#f8fafc'; // slate-50
      
      // Força CSS customizado
      const style = document.getElementById('custom-dark-styles') || document.createElement('style');
      style.id = 'custom-dark-styles';
      style.innerHTML = `
        .dark {
          color-scheme: dark;
        }
        .dark body {
          background: linear-gradient(135deg, #0f172a, #1e293b, #334155) !important;
          color: #f8fafc !important;
        }
        .dark * {
          border-color: #374151 !important;
        }
      `;
      document.head.appendChild(style);
      
      console.log('DARK MODE APPLIED - HTML classes:', html.classList.toString());
    } else {
      // Aplicar modo claro
      html.classList.remove('dark');
      body.style.backgroundColor = '';
      body.style.color = '';
      
      // Remover CSS customizado
      const style = document.getElementById('custom-dark-styles');
      if (style) style.remove();
      
      console.log('LIGHT MODE APPLIED - HTML classes:', html.classList.toString());
    }
  };

  const toggleTheme = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);
    
    localStorage.setItem('theme', newDarkState ? 'dark' : 'light');
    applyTheme(newDarkState);
    
    console.log(`THEME TOGGLED: ${newDarkState ? 'DARK' : 'LIGHT'}`);
    console.log('HTML element classes:', document.documentElement.classList.toString());
    console.log('Body styles:', {
      backgroundColor: document.body.style.backgroundColor,
      color: document.body.style.color
    });
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm"
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      style={{
        backgroundColor: isDark ? '#374151' : '#f1f5f9',
        color: isDark ? '#d1d5db' : '#374151'
      }}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
