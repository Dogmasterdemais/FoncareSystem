// Componente de seleção de salas para agendamentos
'use client';

import React, { useState, useEffect } from 'react';
import { useAgendamentoView, SalaParaAgendamento } from '@/hooks/useAgendamentoView';
import { 
  MapPin, 
  Users, 
  Building2, 
  RefreshCw, 
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SeletorSalasAgendamentoProps {
  unidadeId: string;
  onSalaSelecionada: (sala: SalaParaAgendamento) => void;
  salaAtual?: string;
  className?: string;
}

export function SeletorSalasAgendamento({ 
  unidadeId, 
  onSalaSelecionada, 
  salaAtual,
  className = '' 
}: SeletorSalasAgendamentoProps) {
  const { salasDisponiveis, loading, error, carregarSalasDisponiveis } = useAgendamentoView();
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'terapia' | 'consulta'>('todas');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<'todas' | 'disponiveis' | 'ocupadas'>('todas');

  useEffect(() => {
    if (unidadeId) {
      carregarSalasDisponiveis(unidadeId);
    }
  }, [unidadeId, carregarSalasDisponiveis]);

  // Filtrar salas
  const salasFiltradas = salasDisponiveis.filter(sala => {
    const matchBusca = !busca || 
      sala.sala_nome.toLowerCase().includes(busca.toLowerCase()) ||
      sala.sala_numero?.toLowerCase().includes(busca.toLowerCase()) ||
      sala.especialidade_nome.toLowerCase().includes(busca.toLowerCase());
    
    const matchTipo = filtroTipo === 'todas' || sala.sala_tipo === filtroTipo;
    
    const matchDisponibilidade = filtroDisponibilidade === 'todas' ||
      (filtroDisponibilidade === 'disponiveis' && sala.vagas_disponiveis > 0) ||
      (filtroDisponibilidade === 'ocupadas' && sala.vagas_disponiveis === 0);
    
    return matchBusca && matchTipo && matchDisponibilidade;
  });

  const getStatusSala = (sala: SalaParaAgendamento) => {
    if (sala.vagas_disponiveis === 0) {
      return { status: 'lotada', cor: 'bg-red-500', texto: 'Lotada' };
    } else if (sala.vagas_disponiveis <= 1) {
      return { status: 'quase-cheia', cor: 'bg-yellow-500', texto: 'Quase cheia' };
    } else {
      return { status: 'disponivel', cor: 'bg-green-500', texto: 'Disponível' };
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Carregando salas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Erro ao carregar salas: {error}</span>
        </div>
        <button 
          onClick={() => carregarSalasDisponiveis(unidadeId)}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Selecionar Sala
          </h3>
          <button
            onClick={() => carregarSalasDisponiveis(unidadeId)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filtros */}
        <div className="space-y-3">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome, número ou especialidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtros em linha */}
          <div className="flex gap-3">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as 'todas' | 'terapia' | 'consulta')}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todos os tipos</option>
              <option value="terapia">Terapia</option>
              <option value="consulta">Consulta</option>
            </select>

            <select
              value={filtroDisponibilidade}
              onChange={(e) => setFiltroDisponibilidade(e.target.value as 'todas' | 'disponiveis' | 'ocupadas')}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas</option>
              <option value="disponiveis">Disponíveis</option>
              <option value="ocupadas">Ocupadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de salas */}
      <div className="p-6">
        {salasFiltradas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma sala encontrada com os filtros aplicados</p>
          </div>
        ) : (
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {salasFiltradas.map((sala) => {
              const status = getStatusSala(sala);
              const isSelected = salaAtual === sala.sala_id;
              
              return (
                <div
                  key={sala.sala_id}
                  onClick={() => onSalaSelecionada(sala)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: sala.sala_cor }}
                        />
                        <h4 className="font-medium text-gray-900">
                          {sala.sala_nome}
                          {sala.sala_numero && (
                            <span className="text-gray-500 ml-1">
                              #{sala.sala_numero}
                            </span>
                          )}
                        </h4>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{sala.especialidade_nome}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>
                            {sala.profissionais_alocados}/{sala.capacidade_maxima} profissionais
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs text-white ${status.cor}`}>
                            {status.texto}
                          </span>
                        </div>
                      </div>

                      {/* Profissionais disponíveis */}
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Profissionais alocados:</p>
                        <p className="text-sm text-gray-700">
                          {sala.profissionais_disponiveis || 'Nenhum profissional alocado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rodapé com estatísticas */}
      <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{salasFiltradas.length} salas encontradas</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1" />
              <span>Disponível</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1" />
              <span>Quase cheia</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1" />
              <span>Lotada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
