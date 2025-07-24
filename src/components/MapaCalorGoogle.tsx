import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

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

interface MapaCalorGoogleProps {
  dados: MapaCalorDados[];
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export default function MapaCalorGoogle({ dados, className }: MapaCalorGoogleProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyBsEYe05izIGga0Brfdg3RdHuyzxOd-gUo';

  // Função para geocodificar endereços usando Google Geocoding API
  const geocodificarEndereco = async (endereco: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      }
      return null;
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  };

  // Carregar Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Verificar se já está carregado
        if (window.google && window.google.maps) {
          initializeMap();
          return;
        }

        // Carregar o script do Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initializeMap();
        };
        
        script.onerror = () => {
          setError('Erro ao carregar Google Maps');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Erro ao carregar Google Maps:', error);
        setError('Erro ao inicializar o mapa');
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Inicializar o mapa
  const initializeMap = () => {
    if (!mapElement.current || !window.google) return;

    try {
      const mapInstance = new window.google.maps.Map(mapElement.current, {
        center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
        zoom: 10,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{"color": "#242f3e"}]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#242f3e"}]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#746855"}]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#d59563"}]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#d59563"}]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{"color": "#263c3f"}]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#6b9a76"}]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{"color": "#38414e"}]
          },
          {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#212a37"}]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#9ca5b3"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{"color": "#746855"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#1f2835"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#f3d19c"}]
          },
          {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{"color": "#2f3948"}]
          },
          {
            "featureType": "transit.station",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#d59563"}]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"color": "#17263c"}]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#515c6d"}]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#17263c"}]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      });

      setMap(mapInstance);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      setError('Erro ao criar o mapa');
      setIsLoading(false);
    }
  };

  // Adicionar marcadores quando o mapa e dados estiverem prontos
  useEffect(() => {
    if (!map || !dados || dados.length === 0) return;

    const adicionarMarcadores = async () => {
      console.log('🗺️ Adicionando marcadores Google Maps...', dados);

      // Limpar marcadores existentes
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();

      for (const item of dados) {
        let coordenadas = { lat: item.lat, lng: item.lng };

        // Se as coordenadas são padrão, tentar geocodificar o endereço real
        if (item.lat === -23.5489 || Math.abs(item.lat + 23.5489) < 0.01) {
          const endereco = `${item.bairro}, ${item.cidade}, ${item.estado}, Brasil`;
          console.log('Geocodificando:', endereco);
          
          const coordenadasReais = await geocodificarEndereco(endereco);
          if (coordenadasReais) {
            coordenadas = coordenadasReais;
            console.log('Coordenadas encontradas:', coordenadas);
          }
        }

        // Determinar cor e tamanho baseado na quantidade
        const cor = item.quantidade_pacientes > 5 ? '#dc2626' : 
                   item.quantidade_pacientes > 3 ? '#ea580c' : 
                   item.quantidade_pacientes > 1 ? '#d97706' : '#059669';
        
        const scale = Math.max(20, Math.min(60, item.quantidade_pacientes * 8));

        // Criar ícone customizado
        const icon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: cor,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 4,
          strokeOpacity: 1
        };

        // Criar marcador
        const marker = new window.google.maps.Marker({
          position: coordenadas,
          map: map,
          icon: icon,
          title: `${item.bairro} - ${item.quantidade_pacientes} paciente${item.quantidade_pacientes > 1 ? 's' : ''}`
        });

        // Adicionar label com número
        const label = new window.google.maps.Marker({
          position: coordenadas,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 0,
            strokeColor: 'transparent'
          },
          label: {
            text: item.quantidade_pacientes.toString(),
            color: 'white',
            fontWeight: 'bold',
            fontSize: `${Math.max(12, scale / 3)}px`
          }
        });

        // Criar InfoWindow
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; font-family: Arial, sans-serif; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937; font-size: 16px;">
                📍 ${item.bairro}
              </h3>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                📬 ${item.cep} - ${item.cidade}, ${item.estado}
              </p>
              <p style="margin: 8px 0 4px 0; font-weight: bold; color: #059669; font-size: 15px;">
                👥 ${item.quantidade_pacientes} paciente${item.quantidade_pacientes > 1 ? 's' : ''}
              </p>
              ${item.unidades.map((u: any) => `
                <p style="margin: 2px 0; color: #4b5563; font-size: 13px;">
                  🏢 ${u.nome}: ${u.quantidade} paciente${u.quantidade > 1 ? 's' : ''}
                </p>
              `).join('')}
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
                Lat: ${coordenadas.lat.toFixed(4)}, Lng: ${coordenadas.lng.toFixed(4)}
              </div>
            </div>
          `
        });

        // Adicionar evento de clique
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker, label);
        bounds.extend(coordenadas);
      }

      // Ajustar o mapa para mostrar todos os marcadores
      if (markersRef.current.length > 0) {
        map.fitBounds(bounds);
        
        // Limitar o zoom máximo
        const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom() > 15) {
            map.setZoom(15);
          }
        });
      }
    };

    adicionarMarcadores();
  }, [map, dados]);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">❌ {error}</p>
          <p className="text-red-500 text-sm mt-2">Verifique sua conexão com a internet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Carregando Google Maps...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapElement} 
        className="w-full h-full min-h-[400px] rounded-lg border-2 border-gray-300 overflow-hidden"
        style={{ 
          minHeight: '400px',
          backgroundColor: '#f0f0f0'
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
