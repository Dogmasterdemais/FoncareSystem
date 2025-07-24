import { useEffect, useRef, useState } from 'react';

interface MapaCalorDados {
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  quantidade_pacientes: number;
  lat: number;
  lng: number;
  unidades: Array<{
    id: string;
    nome: string;
    quantidade: number;
  }>;
}

interface MapaCalorProps {
  dados: MapaCalorDados[];
  className?: string;
}

declare global {
  interface Window {
    tt: any;
  }
}

export default function MapaCalorTomTom({ dados, className = '' }: MapaCalorProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para geocodificar endereços usando TomTom
  const geocodificarEndereco = async (endereco: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(endereco)}.json?key=QAxPf9B41cyForN6G7nP6ZRzQYAknBZ4&countrySet=BR&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Erro na geocodificação');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.position.lat,
          lng: result.position.lon
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
      return null;
    }
  };

  // Inicializar mapa
  useEffect(() => {
    const loadTomTomMap = async () => {
      try {
        // Carregar SDK do TomTom se não estiver carregado
        if (!window.tt) {
          const script = document.createElement('script');
          script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.23.0/maps/maps-web.min.js';
          script.async = true;
          
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.23.0/maps/maps.css';
          
          document.head.appendChild(link);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (mapElement.current && window.tt) {
          // Inicializar mapa centrado em São Paulo
          const mapInstance = window.tt.map({
            key: 'QAxPf9B41cyForN6G7nP6ZRzQYAknBZ4',
            container: mapElement.current,
            center: [-46.6333, -23.5505], // São Paulo
            zoom: 10,
            style: 'night' // Estilo noturno para melhor contraste
          });

          setMap(mapInstance);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar mapa TomTom:', error);
        setError('Erro ao carregar o mapa');
        setIsLoading(false);
      }
    };

    loadTomTomMap();

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Adicionar marcadores quando dados ou mapa mudam
  useEffect(() => {
    if (!map || !dados || dados.length === 0) return;

    const adicionarMarcadores = async () => {
      console.log('🗺️ Adicionando marcadores ao mapa...', dados);

      // Limpar marcadores existentes
      const markers = map.getLayer('markers');
      if (markers) {
        map.removeLayer('markers');
        map.removeSource('markers');
      }

      const markersData = [];

      for (const item of dados) {
        let coordenadas = { lat: item.lat, lng: item.lng };

        // Se as coordenadas são padrão, tentar geocodificar o endereço real
        if (item.lat === -23.5489 || Math.abs(item.lat + 23.5489) < 0.01) {
          const endereco = `${item.bairro}, ${item.cidade}, ${item.estado}, ${item.cep}`;
          console.log('Geocodificando:', endereco);
          
          const coordenadasReais = await geocodificarEndereco(endereco);
          if (coordenadasReais) {
            coordenadas = coordenadasReais;
            console.log('Coordenadas encontradas:', coordenadas);
          }
        }

        // Criar marcador com círculo proporcional ao número de pacientes
        const raio = Math.max(15, Math.min(60, item.quantidade_pacientes * 5));
        const cor = item.quantidade_pacientes > 5 ? '#dc2626' : 
                   item.quantidade_pacientes > 3 ? '#ea580c' : 
                   item.quantidade_pacientes > 1 ? '#d97706' : '#059669';

        markersData.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [coordenadas.lng, coordenadas.lat]
          },
          properties: {
            quantidade: item.quantidade_pacientes,
            bairro: item.bairro,
            cidade: item.cidade,
            cep: item.cep,
            unidades: item.unidades,
            raio,
            cor
          }
        });

        // Adicionar marcador individual
        const marker = new window.tt.Marker({
          element: criarElementoMarcador(item.quantidade_pacientes, cor, raio)
        })
          .setLngLat([coordenadas.lng, coordenadas.lat])
          .addTo(map);

        // Adicionar popup
        const popup = new window.tt.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
              📍 ${item.bairro}
            </h3>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
              📬 ${item.cep} - ${item.cidade}, ${item.estado}
            </p>
            <p style="margin: 8px 0 4px 0; font-weight: bold; color: #059669;">
              👥 ${item.quantidade_pacientes} paciente${item.quantidade_pacientes > 1 ? 's' : ''}
            </p>
            ${item.unidades.map((u: any) => `
              <p style="margin: 2px 0; color: #4b5563; font-size: 13px;">
                🏢 ${u.nome}: ${u.quantidade} paciente${u.quantidade > 1 ? 's' : ''}
              </p>
            `).join('')}
          </div>
        `);

        marker.setPopup(popup);
      }

      // Ajustar vista para mostrar todos os marcadores
      if (markersData.length > 0) {
        const bounds = new window.tt.LngLatBounds();
        markersData.forEach(marker => {
          bounds.extend(marker.geometry.coordinates);
        });
        
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 13
        });
      }
    };

    adicionarMarcadores();
  }, [map, dados]);

  // Função para criar elemento visual do marcador
  const criarElementoMarcador = (quantidade: number, cor: string, raio: number) => {
    const el = document.createElement('div');
    el.style.width = `${raio}px`;
    el.style.height = `${raio}px`;
    el.style.backgroundColor = cor;
    el.style.border = '4px solid #ffffff';
    el.style.borderRadius = '50%';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontWeight = 'bold';
    el.style.fontSize = `${Math.max(10, raio / 4)}px`;
    el.style.color = 'white';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)';
    el.style.transition = 'all 0.2s ease';
    el.style.zIndex = '1000';
    el.textContent = quantidade.toString();
    
    // Efeito hover
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.3)';
      el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.4)';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)';
    });
    
    return el;
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 font-medium">❌ {error}</p>
          <p className="text-red-500 text-sm mt-2">
            Verifique sua conexão com a internet e a chave da API TomTom
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Carregando mapa...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapElement} 
        className="w-full h-full min-h-[400px] rounded-lg border-2 border-gray-300 overflow-hidden"
        style={{ 
          minHeight: '400px',
          backgroundColor: '#f0f0f0',
          filter: 'contrast(1.15) brightness(1.1) saturate(1.2)'
        }}
      />
      
      {dados && dados.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 border border-gray-200">
          <h4 className="font-semibold text-sm mb-2">📊 Distribuição de Pacientes</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-600 rounded-full mr-2 border border-white shadow-sm"></div>
              <span>1 paciente</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-600 rounded-full mr-2 border border-white shadow-sm"></div>
              <span>2-3 pacientes</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-600 rounded-full mr-2 border border-white shadow-sm"></div>
              <span>4-5 pacientes</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded-full mr-2 border border-white shadow-sm"></div>
              <span>6+ pacientes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
