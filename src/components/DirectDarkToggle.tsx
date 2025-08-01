"use client";
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DirectDarkToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const initialDark = savedTheme === 'dark';
    setIsDark(initialDark);
    
    if (initialDark) {
      applyDarkMode();
    }
  }, []);

  const applyDarkMode = () => {
    // Aplicar estilos diretamente no body e elementos principais
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.color = '#f8fafc';
    
    // Aplicar em todos os elementos principais
    const elements = document.querySelectorAll('header, main, aside, div, section');
    elements.forEach((el: any) => {
      if (el.classList.contains('bg-white')) {
        el.style.backgroundColor = '#1e293b';
      }
      if (el.classList.contains('text-gray-900')) {
        el.style.color = '#f8fafc';
      }
      if (el.classList.contains('border-gray-200')) {
        el.style.borderColor = '#374151';
      }
    });
  };

  const applyLightMode = () => {
    // Remover estilos do modo escuro
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    
    // Remover estilos dos elementos
    const elements = document.querySelectorAll('header, main, aside, div, section');
    elements.forEach((el: any) => {
      el.style.backgroundColor = '';
      el.style.color = '';
      el.style.borderColor = '';
    });
  };

  const toggleTheme = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);
    
    localStorage.setItem('theme', newDarkState ? 'dark' : 'light');
    
    if (newDarkState) {
      applyDarkMode();
      console.log('MODO ESCURO APLICADO');
    } else {
      applyLightMode();
      console.log('MODO CLARO APLICADO');
    }
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="p-3 rounded-2xl transition-all shadow-sm"
      style={{
        backgroundColor: isDark ? '#374151' : '#f1f5f9',
        color: isDark ? '#d1d5db' : '#374151',
        border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db'
      }}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
