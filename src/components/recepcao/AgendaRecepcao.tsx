// Componente de agenda para recepção com dados completos
'use client';

import React, { useState, useEffect } from 'react';
import { useAgendamentoView, AgendamentoCompleto } from '@/hooks/useAgendamentoView';
import { useUnidade } from '@/context/UnidadeContext';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  Phone,
  Building2,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  Eye,
  Edit3,
  MoreVertical
} from 'lucide-react';

interface AgendaRecepcaoProps {
  className?: string;
}

export function AgendaRecepcao({ className = '' }: AgendaRecepcaoProps) {
  const { unidadeSelecionada } = useUnidade();
  const { agendamentos, loading, error, carregarAgendamentos } = useAgendamentoView();
  
  const [dataInicio, setDataInicio] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  });
  
  const [dataFim, setDataFim] = useState(() => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 7); // Próximos 7 dias
    return amanha.toISOString().split('T')[0];
  });
  
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'agendado' | 'confirmado' | 'cancelado' | 'realizado'>('todos');
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<string | null>(null);

  useEffect(() => {
    if (unidadeSelecionada) {
      carregarAgendamentos(unidadeSelecionada, dataInicio, dataFim);
    }
  }, [unidadeSelecionada, dataInicio, dataFim, carregarAgendamentos]);

  // Filtrar agendamentos
  const agendamentosFiltrados = agendamentos.filter(ag => {
    const matchBusca = !busca || 
      ag.paciente_nome.toLowerCase().includes(busca.toLowerCase()) ||
      ag.profissional_nome.toLowerCase().includes(busca.toLowerCase()) ||
      ag.sala_nome.toLowerCase().includes(busca.toLowerCase()) ||
      ag.numero_guia?.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || ag.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  // Agrupar por data
  const agendamentosPorData = agendamentosFiltrados.reduce((acc, ag) => {
    const data = ag.data_agendamento;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(ag);
    return acc;
  }, {} as Record<string, AgendamentoCompleto[]>);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'agendado':
        return { icon: Calendar, color: 'text-blue-600 bg-blue-100', label: 'Agendado' };
      case 'confirmado':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Confirmado' };
      case 'cancelado':
        return { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Cancelado' };
      case 'realizado':
        return { icon: Activity, color: 'text-purple-600 bg-purple-100', label: 'Realizado' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600 bg-gray-100', label: status };
    }
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + 'T00:00:00');
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === amanha.toDateString()) {
      return 'Amanhã';
    } else {
      return data.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  const formatarHorario = (horario: string) => {
    return horario.substring(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Carregando agenda...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Erro ao carregar agenda: {error}</span>
        </div>
        <button 
          onClick={() => carregarAgendamentos(unidadeSelecionada, dataInicio, dataFim)}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Cabeçalho */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Agenda da Recepção
          </h2>
          <button
            onClick={() => carregarAgendamentos(unidadeSelecionada, dataInicio, dataFim)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="space-y-3">
          {/* Período */}
          <div className="flex gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Busca e Status */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por paciente, profissional, sala ou número da guia..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
              <option value="realizado">Realizado</option>
            </select>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          {['agendado', 'confirmado', 'cancelado', 'realizado'].map(status => {
            const count = agendamentosFiltrados.filter(ag => ag.status === status).length;
            const config = getStatusConfig(status);
            return (
              <div key={status} className="text-center p-2 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full ${config.color} mx-auto mb-1 flex items-center justify-center`}>
                  <config.icon className="w-4 h-4" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">{config.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de agendamentos */}
      <div className="p-6">
        {Object.keys(agendamentosPorData).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum agendamento encontrado no período selecionado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(agendamentosPorData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([data, agendamentosData]) => (
                <div key={data}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    {formatarData(data)}
                    <span className="ml-2 text-sm text-gray-500">
                      ({agendamentosData.length} agendamento{agendamentosData.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  
                  <div className="space-y-2">
                    {agendamentosData
                      .sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio))
                      .map((agendamento) => {
                        const statusConfig = getStatusConfig(agendamento.status);
                        const isSelected = agendamentoSelecionado === agendamento.id;
                        
                        return (
                          <div
                            key={agendamento.id}
                            className={`
                              p-4 border rounded-lg transition-all cursor-pointer
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }
                            `}
                            onClick={() => setAgendamentoSelecionado(
                              isSelected ? null : agendamento.id
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <div className={`p-1 rounded-full ${statusConfig.color} mr-3`}>
                                      <statusConfig.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {agendamento.paciente_nome}
                                      </h4>
                                      <div className="flex items-center text-sm text-gray-600 mt-1">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>
                                          {formatarHorario(agendamento.horario_inicio)} - {formatarHorario(agendamento.horario_fim)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <div className="flex items-center text-gray-600">
                                      <User className="w-4 h-4 mr-2" />
                                      <span className="font-medium">Profissional:</span>
                                    </div>
                                    <p className="text-gray-900 ml-6">
                                      {agendamento.profissional_nome}
                                      <span className="text-gray-500 ml-1">
                                        ({agendamento.profissional_especialidade})
                                      </span>
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center text-gray-600">
                                      <MapPin className="w-4 h-4 mr-2" />
                                      <span className="font-medium">Sala:</span>
                                    </div>
                                    <div className="flex items-center ml-6">
                                      <div 
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: agendamento.sala_cor }}
                                      />
                                      <span className="text-gray-900">
                                        {agendamento.sala_nome}
                                        {agendamento.sala_numero && ` #${agendamento.sala_numero}`}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Informações expandidas */}
                                {isSelected && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      {agendamento.paciente_telefone && (
                                        <div className="space-y-1">
                                          <div className="flex items-center text-gray-600">
                                            <Phone className="w-4 h-4 mr-2" />
                                            <span className="font-medium">Telefone:</span>
                                          </div>
                                          <p className="text-gray-900 ml-6">{agendamento.paciente_telefone}</p>
                                        </div>
                                      )}

                                      {agendamento.convenio_nome && (
                                        <div className="space-y-1">
                                          <div className="flex items-center text-gray-600">
                                            <Building2 className="w-4 h-4 mr-2" />
                                            <span className="font-medium">Convênio:</span>
                                          </div>
                                          <p className="text-gray-900 ml-6">{agendamento.convenio_nome}</p>
                                        </div>
                                      )}

                                      {agendamento.numero_guia && (
                                        <div className="space-y-1">
                                          <div className="flex items-center text-gray-600">
                                            <Activity className="w-4 h-4 mr-2" />
                                            <span className="font-medium">Nº Guia:</span>
                                          </div>
                                          <p className="text-gray-900 ml-6">{agendamento.numero_guia}</p>
                                        </div>
                                      )}

                                      <div className="space-y-1">
                                        <div className="flex items-center text-gray-600">
                                          <Users className="w-4 h-4 mr-2" />
                                          <span className="font-medium">Equipe da sala:</span>
                                        </div>
                                        <p className="text-gray-900 ml-6">{agendamento.profissionais_sala}</p>
                                      </div>
                                    </div>

                                    {agendamento.observacoes && (
                                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                        <h5 className="font-medium text-yellow-800 mb-1">Observações:</h5>
                                        <p className="text-yellow-700 text-sm">{agendamento.observacoes}</p>
                                      </div>
                                    )}

                                    {/* Ações */}
                                    <div className="flex gap-2 mt-4">
                                      <button className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                        <Eye className="w-4 h-4 mr-1" />
                                        Visualizar
                                      </button>
                                      <button className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        <Edit3 className="w-4 h-4 mr-1" />
                                        Editar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {agendamentosFiltrados.length} agendamento{agendamentosFiltrados.length !== 1 ? 's' : ''} encontrado{agendamentosFiltrados.length !== 1 ? 's' : ''}
          </span>
          <span>Período: {dataInicio} a {dataFim}</span>
        </div>
      </div>
    </div>
  );
}
