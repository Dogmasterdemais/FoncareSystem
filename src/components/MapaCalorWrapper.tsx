import React from 'react';
import MapaCalorGoogleOptimized from './MapaCalorGoogleOptimized';
import { MapPin } from 'lucide-react';

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

interface MapaCalorWrapperProps {
  dados: MapaCalorDados[];
  className?: string;
}

export default function MapaCalorWrapper({ dados, className }: MapaCalorWrapperProps) {
  const [showFallback, setShowFallback] = React.useState(false);

  const handleMapError = () => {
    console.log('🗺️ Erro no mapa TomTom, exibindo fallback');
    setShowFallback(true);
  };

  if (showFallback || !dados || dados.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 ${className}`}>
        <div className="text-center mb-6">
          <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📍 Distribuição Regional de Pacientes
          </h3>
          <p className="text-gray-600 text-sm">
            {dados?.length ? 'Visualização em lista dos pacientes por região' : 'Nenhum dado disponível'}
          </p>
        </div>

        {dados && dados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dados.map((local, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{local.bairro}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {local.quantidade_pacientes} paciente{local.quantidade_pacientes > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center">
                    <span className="w-4 h-4 mr-2">📍</span>
                    {local.cidade}, {local.estado}
                  </p>
                  <p className="flex items-center">
                    <span className="w-4 h-4 mr-2">📮</span>
                    CEP: {local.cep}
                  </p>
                  {local.unidades.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Unidades:</p>
                      {local.unidades.map((unidade, idx) => (
                        <p key={idx} className="text-xs text-gray-600 flex items-center">
                          <span className="w-3 h-3 mr-1">🏢</span>
                          {unidade.nome} ({unidade.quantidade})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Lat: {local.lat.toFixed(4)}</span>
                    <span>Lng: {local.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum dado de localização disponível</p>
              <p className="text-gray-400 text-sm mt-2">
                Aguardando cadastro de pacientes com endereços válidos
              </p>
            </div>
          </div>
        )}

        {!showFallback && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowFallback(false)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              🗺️ Tentar carregar mapa interativo
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapaCalorGoogleOptimized 
        dados={dados}
        className="w-full h-96"
      />
      
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleMapError}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 text-xs px-3 py-1 rounded shadow-sm border"
        >
          📋 Ver lista
        </button>
      </div>
    </div>
  );
}
