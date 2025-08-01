import React, { useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Loader2, Users, Building2 } from 'lucide-react';

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

interface MapaCalorGoogleOptimizedProps {
  dados: MapaCalorDados[];
  className?: string;
}

const libraries: ("places")[] = ["places"];

export default function MapaCalorGoogleOptimized({ dados, className }: MapaCalorGoogleOptimizedProps) {
  const [selectedMarker, setSelectedMarker] = React.useState<MapaCalorDados | null>(null);

  // Carregar Google Maps API uma única vez
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBsEYe05izIGga0Brfdg3RdHuyzxOd-gUo',
    libraries,
  });

  // Configurações do mapa otimizadas
  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [{"weight": "2.00"}]
      },
      {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [{"color": "#9c9c9c"}]
      },
      {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [{"visibility": "on"}]
      },
      {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{"color": "#f2f2f2"}]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#ffffff"}]
      },
      {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#ffffff"}]
      },
      {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{"visibility": "off"}]
      },
      {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{"saturation": -100}, {"lightness": 45}]
      },
      {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#eeeeee"}]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#7b7b7b"}]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [{"color": "#ffffff"}]
      },
      {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{"visibility": "simplified"}]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [{"visibility": "off"}]
      },
      {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{"visibility": "off"}]
      },
      {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#c8d7d4"}]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#070707"}]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [{"color": "#ffffff"}]
      }
    ]
  }), []);

  // Centro do mapa baseado nos dados
  const center = useMemo(() => {
    if (!dados || dados.length === 0) {
      return { lat: -23.5505, lng: -46.6333 }; // São Paulo como fallback
    }

    if (dados.length === 1) {
      return { lat: dados[0].lat, lng: dados[0].lng };
    }

    // Calcular centro baseado em todos os pontos
    const latSum = dados.reduce((sum, item) => sum + item.lat, 0);
    const lngSum = dados.reduce((sum, item) => sum + item.lng, 0);
    
    return {
      lat: latSum / dados.length,
      lng: lngSum / dados.length
    };
  }, [dados]);

  // Callback para carregar o mapa
  const onLoad = useCallback((map: google.maps.Map) => {
    if (dados && dados.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      dados.forEach(item => {
        bounds.extend(new window.google.maps.LatLng(item.lat, item.lng));
      });
      map.fitBounds(bounds);
    }
  }, [dados]);

  // Callback para descarregar o mapa
  const onUnmount = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // Função para obter a cor do marcador baseada na quantidade de pacientes
  const getMarkerColor = (quantidade: number) => {
    if (quantidade >= 50) return '#ef4444'; // Vermelho para alta concentração
    if (quantidade >= 20) return '#f97316'; // Laranja para média concentração
    if (quantidade >= 10) return '#eab308'; // Amarelo para baixa concentração
    return '#22c55e'; // Verde para muito baixa
  };

  // Função para obter o tamanho do marcador
  const getMarkerSize = (quantidade: number) => {
    if (quantidade >= 50) return 40;
    if (quantidade >= 20) return 35;
    if (quantidade >= 10) return 30;
    return 25;
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className={`bg-white rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🗺️ Carregando Mapa
          </h3>
          <p className="text-gray-600 text-sm">
            Inicializando Google Maps...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            ❌ Erro no Mapa
          </h3>
          <p className="text-red-700 text-sm">
            Não foi possível carregar o Google Maps. Verifique sua conexão.
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!dados || dados.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📍 Mapa de Calor de Pacientes
          </h3>
          <p className="text-gray-600 text-sm">
            Nenhum dado de localização disponível
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-lg overflow-hidden ${className}`}>
      {/* Título do mapa */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Distribuição de Pacientes</span>
        </div>
        <p className="text-sm text-gray-600">
          {dados.length} regiões mapeadas
        </p>
      </div>

      {/* Mapa */}
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '400px'
        }}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Marcadores */}
        {dados.map((item, index) => (
          <Marker
            key={index}
            position={{ lat: item.lat, lng: item.lng }}
            onClick={() => setSelectedMarker(item)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: getMarkerColor(item.quantidade_pacientes),
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: getMarkerSize(item.quantidade_pacientes) / 4,
            }}
          />
        ))}

        {/* InfoWindow para mostrar detalhes */}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-3 min-w-[200px]">
              <h4 className="font-semibold text-gray-900 mb-2">
                📍 {selectedMarker.cidade}, {selectedMarker.estado}
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {selectedMarker.bairro} - {selectedMarker.cep}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-700">
                    {selectedMarker.quantidade_pacientes} pacientes
                  </span>
                </div>

                {selectedMarker.unidades && selectedMarker.unidades.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700 font-medium">Unidades:</span>
                    </div>
                    {selectedMarker.unidades.map((unidade, idx) => (
                      <div key={idx} className="ml-6 text-gray-600">
                        • {unidade.nome} ({unidade.quantidade})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legenda */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
        <h5 className="font-semibold text-gray-900 mb-2">Legenda</h5>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>50+ pacientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>20-49 pacientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>10-19 pacientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Menos de 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
