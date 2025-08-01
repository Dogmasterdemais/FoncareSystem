// Singleton para gerenciar o carregamento do Google Maps
class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private isLoading = false;
  private isLoaded = false;
  private callbacks: (() => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  
  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Se já está carregado, resolver imediatamente
      if (this.isLoaded && window.google && window.google.maps) {
        resolve();
        return;
      }

      // Adicionar callbacks para quando carregar
      this.callbacks.push(resolve);
      this.errorCallbacks.push(reject);

      // Se já está carregando, não fazer nada
      if (this.isLoading) {
        return;
      }

      // Verificar se já existe script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.warn('🗺️ Google Maps: Script já existe, aguardando carregamento...');
        this.isLoading = true;
        this.waitForLoad();
        return;
      }

      // Começar carregamento
      this.isLoading = true;
      this.loadScript();
    });
  }

  private loadScript(): void {
    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBsEYe05izIGga0Brfdg3RdHuyzxOd-gUo';
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps API carregado com sucesso');
      this.handleLoad();
    };
    
    script.onerror = () => {
      console.error('❌ Erro ao carregar Google Maps API');
      this.handleError('Erro ao carregar Google Maps API');
    };

    document.head.appendChild(script);
  }

  private waitForLoad(): void {
    const checkInterval = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkInterval);
        console.log('✅ Google Maps API detectado (script existente)');
        this.handleLoad();
      }
    }, 100);

    // Timeout após 10 segundos
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this.isLoaded) {
        this.handleError('Timeout ao aguardar Google Maps API');
      }
    }, 10000);
  }

  private handleLoad(): void {
    this.isLoaded = true;
    this.isLoading = false;
    
    // Executar todos os callbacks de sucesso
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Erro no callback do Google Maps:', error);
      }
    });
    
    // Limpar arrays
    this.callbacks = [];
    this.errorCallbacks = [];
  }

  private handleError(error: string): void {
    this.isLoading = false;
    
    // Executar todos os callbacks de erro
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('Erro no callback de erro do Google Maps:', err);
      }
    });
    
    // Limpar arrays
    this.callbacks = [];
    this.errorCallbacks = [];
  }

  // Verificar se está carregado
  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google && !!window.google.maps;
  }

  // Verificar se está carregando
  isGoogleMapsLoading(): boolean {
    return this.isLoading;
  }
}

// Export da instância singleton
export const googleMapsLoader = GoogleMapsLoader.getInstance();

// Hook personalizado para usar no React
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = React.useState(googleMapsLoader.isGoogleMapsLoaded());
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (googleMapsLoader.isGoogleMapsLoaded()) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    googleMapsLoader
      .load()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { isLoaded, isLoading, error };
};

// Para compatibilidade com imports diretos
import React from 'react';
