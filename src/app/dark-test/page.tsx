"use client";
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function DarkModeTest() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8 transition-all duration-500">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
          Teste Dark Mode
        </h1>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Status do Tema
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            <strong>Tema atual:</strong> {theme}
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            <strong>Tema resolvido:</strong> {resolvedTheme}
          </p>
          
          <button 
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
          >
            {resolvedTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">Card 1</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Este é um card de teste para verificar se as classes dark: estão funcionando corretamente.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-3">Card 2</h3>
            <p className="text-purple-100 dark:text-purple-200">
              Este card tem gradiente que também deve mudar no modo escuro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
