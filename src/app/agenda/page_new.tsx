'use client';

import { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import AgendaTempoReal from '../../components/AgendaTempoReal';

export default function AgendaPage() {
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>('');

  // Lista de unidades para o filtro
  const unidades = [
    'Todos',
    'Clínica Foncare - Matriz',
    'Clínica Foncare - Filial Norte',
    'Clínica Foncare - Filial Sul'
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📅 Agenda do Dia
            </h1>
            <p className="text-gray-600 mt-1">
              Controle dos atendimentos em tempo real
            </p>
          </div>

          {/* Filtro de Unidade */}
          <div className="mt-4 md:mt-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Unidade:
            </label>
            <select
              value={unidadeSelecionada}
              onChange={(e) => setUnidadeSelecionada(e.target.value === 'Todos' ? '' : e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {unidades.map((unidade) => (
                <option key={unidade} value={unidade === 'Todos' ? '' : unidade}>
                  {unidade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Componente da Agenda */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <AgendaTempoReal unidadeSelecionada={unidadeSelecionada} />
        </div>

        {/* Footer */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="inline-flex items-center">
                ⚡ Atualização automática a cada 30 segundos
              </span>
            </div>
            <div>
              <span>
                Agenda Foncare - Versão 1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
