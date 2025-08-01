'use client';

import { useState } from 'react';
import SupervisaoAtendimentos from '@/components/SupervisaoAtendimentos';
import AgendaTempoReal from '@/components/AgendaTempoReal';

export default function SupervisaoPage() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'supervisao'>('agenda');
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>('');

  // Lista de unidades para o filtro
  const unidades = [
    'Todos',
    'Clínica Foncare - Matriz',
    'Clínica Foncare - Filial Norte',
    'Clínica Foncare - Filial Sul'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                💼 Sistema de Supervisão
              </h1>
              <p className="text-gray-600 mt-1">
                Acompanhe em tempo real os atendimentos e agenda
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
        </div>

        {/* Navegação por Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('agenda')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'agenda'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📅 Agenda Tempo Real
              </button>
              <button
                onClick={() => setActiveTab('supervisao')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'supervisao'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Supervisão de Atendimentos
              </button>
            </nav>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-6">
            {activeTab === 'agenda' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    📅 Agenda em Tempo Real
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Controle o status dos pacientes em tempo real
                  </p>
                </div>
                <AgendaTempoReal unidadeSelecionada={unidadeSelecionada} />
              </div>
            )}

            {activeTab === 'supervisao' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    📊 Supervisão Geral
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Visão completa dos atendimentos por sala e unidade
                  </p>
                </div>
                <SupervisaoAtendimentos unidadeSelecionada={unidadeSelecionada} />
              </div>
            )}
          </div>
        </div>

        {/* Footer com Informações */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="inline-flex items-center">
                ⚡ Atualização automática ativa
              </span>
            </div>
            <div>
              <span>
                Sistema de Supervisão Foncare - Versão 1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
