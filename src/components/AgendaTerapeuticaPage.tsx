'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Calendar, Plus, Clock, User, MapPin, Activity, Edit, CheckCircle, XCircle, AlertTriangle, Play, Pause } from 'lucide-react';
import { moduloTerapeuticoService, AgendamentoTerapeutico } from '@/lib/moduloTerapeuticoService';

interface AgendaTerapeuticaProps {
  profissionalId?: string;
}

export default function AgendaTerapeuticaPage({ profissionalId }: AgendaTerapeuticaProps) {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<AgendamentoTerapeutico[]>([]);
  const [filtros, setFiltros] = useState({
    data: new Date().toISOString().split('T')[0],
    profissional: profissionalId || '',
    status: ''
  });

  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    agendados: 0,
    em_atendimento: 0,
    concluidos: 0
  });

  useEffect(() => {
    carregarAgendamentos();
  }, [filtros]);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      const { data } = await moduloTerapeuticoService.buscarAgendamentosTerapeuticos({
        data: filtros.data,
        profissionalId: filtros.profissional || undefined,
        status: filtros.status || undefined
      });

      if (data) {
        setAgendamentos(data);
        
        // Calcula estatísticas
        setEstatisticas({
          total: data.length,
          agendados: data.filter(a => a.status_terapeutico === 'agendado').length,
          em_atendimento: data.filter(a => a.status_terapeutico === 'em_atendimento').length,
          concluidos: data.filter(a => a.status_terapeutico === 'sessao_concluida').length
        });
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (agendamentoId: string, novoStatus: string, observacoes?: string) => {
    try {
      await moduloTerapeuticoService.atualizarStatusTerapeutico(agendamentoId, novoStatus, observacoes);
      await carregarAgendamentos(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'chegou': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'pronto_para_terapia': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'em_atendimento': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'sessao_concluida': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'encerrado_antecipadamente': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'nao_compareceu': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado': return <Calendar className="w-4 h-4" />;
      case 'chegou': return <User className="w-4 h-4" />;
      case 'pronto_para_terapia': return <CheckCircle className="w-4 h-4" />;
      case 'em_atendimento': return <Play className="w-4 h-4" />;
      case 'sessao_concluida': return <CheckCircle className="w-4 h-4" />;
      case 'encerrado_antecipadamente': return <Pause className="w-4 h-4" />;
      case 'nao_compareceu': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getAcoesDisponiveis = (agendamento: AgendamentoTerapeutico) => {
    const acoes = [];
    
    switch (agendamento.status_terapeutico) {
      case 'agendado':
        acoes.push(
          <button 
            key="chegou"
            onClick={() => atualizarStatus(agendamento.id, 'chegou')}
            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
          >
            Chegou
          </button>
        );
        break;
      case 'chegou':
        acoes.push(
          <button 
            key="pronto"
            onClick={() => atualizarStatus(agendamento.id, 'pronto_para_terapia')}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Pronto
          </button>
        );
        break;
      case 'pronto_para_terapia':
        acoes.push(
          <button 
            key="iniciar"
            onClick={() => atualizarStatus(agendamento.id, 'em_atendimento')}
            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
          >
            Iniciar
          </button>
        );
        break;
      case 'em_atendimento':
        acoes.push(
          <button 
            key="concluir"
            onClick={() => atualizarStatus(agendamento.id, 'sessao_concluida')}
            className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
          >
            Concluir
          </button>,
          <button 
            key="encerrar"
            onClick={() => atualizarStatus(agendamento.id, 'encerrado_antecipadamente', 'Encerrado antecipadamente pela recepção')}
            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Encerrar
          </button>
        );
        break;
    }

    return acoes;
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-none">
        {/* Header da página */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agenda Terapêutica</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie agendamentos e sessões terapêuticas em tempo real</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            Novo Agendamento
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hoje</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{estatisticas.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Agendados</p>
                <p className="text-3xl font-bold text-blue-600">{estatisticas.agendados}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Em Atendimento</p>
                <p className="text-3xl font-bold text-orange-600">{estatisticas.em_atendimento}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídos</p>
                <p className="text-3xl font-bold text-green-600">{estatisticas.concluidos}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filtros.data}
                onChange={(e) => setFiltros(prev => ({ ...prev, data: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profissional</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filtros.profissional}
                onChange={(e) => setFiltros(prev => ({ ...prev, profissional: e.target.value }))}
              >
                <option value="">Todos os profissionais</option>
                {/* TODO: Carregar profissionais dinamicamente */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="chegou">Chegou</option>
                <option value="pronto_para_terapia">Pronto para Terapia</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="sessao_concluida">Sessão Concluída</option>
                <option value="encerrado_antecipadamente">Encerrado Antecipadamente</option>
                <option value="nao_compareceu">Não Compareceu</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={carregarAgendamentos}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Agendamentos {filtros.data ? `de ${new Date(filtros.data + 'T00:00:00').toLocaleDateString('pt-BR')}` : 'de Hoje'}
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-4">Carregando agendamentos...</p>
                </div>
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum agendamento encontrado</h3>
                  <p className="text-gray-500 dark:text-gray-400">Não há agendamentos para o período selecionado</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {agendamentos.map((agendamento) => (
                  <div key={agendamento.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <span className="font-semibold text-xl text-gray-900 dark:text-white">{agendamento.paciente?.nome}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agendamento.status_terapeutico)}`}>
                            {getStatusIcon(agendamento.status_terapeutico)}
                            <span className="ml-1">{agendamento.status_terapeutico.replace('_', ' ').toUpperCase()}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{agendamento.horario_inicio} - {agendamento.horario_fim}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{agendamento.sala?.nome}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            <span>{agendamento.profissional?.nome_completo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            <span>{agendamento.especialidade?.nome}</span>
                          </div>
                        </div>
                        
                        {/* Informações Adicionais */}
                        {(agendamento.horario_chegada || agendamento.horario_inicio_real || agendamento.horario_fim_real) && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                              {agendamento.horario_chegada && (
                                <span>Chegada: {new Date(agendamento.horario_chegada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              )}
                              {agendamento.horario_inicio_real && (
                                <span>Início: {new Date(agendamento.horario_inicio_real).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              )}
                              {agendamento.horario_fim_real && (
                                <span>Fim: {new Date(agendamento.horario_fim_real).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Indicadores de Evolução e Supervisão */}
                        {agendamento.status_terapeutico === 'sessao_concluida' && (
                          <div className="mt-3 flex gap-2">
                            {agendamento.evolucao_realizada ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                ✓ Evolução Realizada
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                ⚠ Evolução Pendente
                              </span>
                            )}
                            
                            {agendamento.supervisionado ? (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                ✓ Supervisionado
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                ⏳ Supervisão Pendente
                              </span>
                            )}

                            {agendamento.liberado_pagamento && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                ✓ Pagamento Liberado
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {getAcoesDisponiveis(agendamento)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}