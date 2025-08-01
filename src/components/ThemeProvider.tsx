"use client";
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, ReactNode } from 'react';

interface CustomThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: CustomThemeProviderProps) {
  useEffect(() => {
    // Força a aplicação da classe dark no HTML
    const observer = new MutationObserver(() => {
      const htmlElement = document.documentElement;
      const isDark = htmlElement.classList.contains('dark');
      
      if (isDark) {
        document.body.style.setProperty('background', 'rgb(15 23 42)');
        document.body.style.setProperty('color', 'rgb(248 250 252)');
      } else {
        document.body.style.setProperty('background', 'rgb(255 255 255)');
        document.body.style.setProperty('color', 'rgb(15 23 42)');
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Aplicar tema inicial
    const initialTheme = localStorage.getItem('theme');
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    return () => observer.disconnect();
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
