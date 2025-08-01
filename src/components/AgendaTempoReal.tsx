import React, { useState, useEffect } from 'react';
import { Clock, User, MapPin, Play, Pause, Square, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AgendamentoTempo {
  id: string;
  paciente_nome: string;
  sala_nome: string;
  sala_numero: string;
  sala_cor: string;
  especialidade_nome: string;
  especialidade_cor?: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  status_dinamico: string;
  tempo_sessao_atual: number;
  tempo_restante_minutos: number;
  duracao_planejada: number;
  tipo_sessao: string;
  profissional_nome: string;
  profissional_1_nome?: string;
  profissional_2_nome?: string;
  profissional_3_nome?: string; // NOVO: Terceiro profissional
  profissional_ativo: number;
  proxima_acao: string;
  sessao_iniciada_em?: string;
  unidade_nome: string;
}

interface AgendaTempoRealProps {
  unidadeSelecionada?: string;
}

export default function AgendaTempoReal({ unidadeSelecionada }: AgendaTempoRealProps) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoTempo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null);

  // Buscar agendamentos em tempo real
  const buscarAgendamentos = async () => {
    try {
      let query = supabase
        .from('vw_agenda_tempo_real')
        .select('*');

      if (unidadeSelecionada) {
        query = query.eq('unidade_id', unidadeSelecionada);
      }

      const { data, error } = await query.order('horario_inicio');

      if (error) throw error;

      setAgendamentos(data || []);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status do agendamento
  const atualizarStatus = async (agendamentoId: string, novoStatus: string, observacoes?: string) => {
    setAtualizandoStatus(agendamentoId);
    
    try {
      const { error } = await supabase.rpc('atualizar_status_agendamento', {
        p_agendamento_id: agendamentoId,
        p_novo_status: novoStatus,
        p_observacoes: observacoes
      });

      if (error) throw error;

      // Recarregar dados
      await buscarAgendamentos();
      
      console.log(`✅ Status atualizado para: ${novoStatus}`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status do paciente');
    } finally {
      setAtualizandoStatus(null);
    }
  };

  // Trocar profissional em sessão compartilhada/tripla
  const trocarProfissional = async (agendamentoId: string, agendamento: AgendamentoTempo) => {
    setAtualizandoStatus(agendamentoId);
    
    try {
      let updateData: any = {};
      let observacao = '';

      if (agendamento.tipo_sessao === 'tripla') {
        if (agendamento.profissional_ativo === 1) {
          // Trocar para o segundo profissional
          updateData = { 
            profissional_ativo: 2,
            tempo_profissional_1: 30 // Fixar 30min para o primeiro profissional
          };
          observacao = 'Troca de profissional - Segundo profissional iniciado (30min)';
        } else if (agendamento.profissional_ativo === 2) {
          // Trocar para o terceiro profissional
          updateData = { 
            profissional_ativo: 3,
            tempo_profissional_2: 30 // Fixar 30min para o segundo profissional
          };
          observacao = 'Troca de profissional - Terceiro profissional iniciado (60min)';
        }
      } else if (agendamento.tipo_sessao === 'compartilhada') {
        // Sessão compartilhada (2 profissionais)
        updateData = { 
          profissional_ativo: 2,
          tempo_profissional_1: 30 // Fixar 30min para o primeiro profissional
        };
        observacao = 'Troca de profissional - Segundo profissional iniciado';
      }

      const { error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', agendamentoId);

      if (error) throw error;

      // Registrar log da troca
      await supabase.rpc('atualizar_status_agendamento', {
        p_agendamento_id: agendamentoId,
        p_novo_status: 'em_atendimento',
        p_observacoes: observacao
      });

      await buscarAgendamentos();
      console.log('✅ Profissional trocado com sucesso');
    } catch (err) {
      console.error('Erro ao trocar profissional:', err);
      setError('Erro ao trocar profissional');
    } finally {
      setAtualizandoStatus(null);
    }
  };

  // Atualizar automaticamente a cada 30 segundos
  useEffect(() => {
    buscarAgendamentos();
    
    const interval = setInterval(buscarAgendamentos, 30000);
    return () => clearInterval(interval);
  }, [unidadeSelecionada]);

  // Função para obter a cor do card (especialidade ou sala)
  const getCardColor = (agendamento: AgendamentoTempo) => {
    return agendamento.especialidade_cor || agendamento.sala_cor || '#6B7280';
  };

  // Função para obter cor do status
  const getStatusColor = (status: string, statusDinamico: string) => {
    switch (statusDinamico) {
      case 'troca_para_profissional_2': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'troca_para_profissional_3': return 'bg-amber-100 border-amber-500 text-amber-800';
      case 'sessao_completa': return 'bg-green-100 border-green-500 text-green-800';
      case 'em_andamento': return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        switch (status) {
          case 'agendado': return 'bg-gray-100 border-gray-400 text-gray-700';
          case 'chegou': return 'bg-orange-100 border-orange-500 text-orange-800';
          case 'pronto_para_terapia': return 'bg-purple-100 border-purple-500 text-purple-800';
          case 'em_atendimento': return 'bg-blue-100 border-blue-500 text-blue-800';
          case 'concluido': return 'bg-green-100 border-green-500 text-green-800';
          default: return 'bg-gray-100 border-gray-400 text-gray-700';
        }
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string, statusDinamico: string) => {
    switch (statusDinamico) {
      case 'troca_para_profissional_2': return <Users className="h-4 w-4" />;
      case 'troca_para_profissional_3': return <Users className="h-4 w-4" />;
      case 'sessao_completa': return <CheckCircle className="h-4 w-4" />;
      case 'em_andamento': return <Play className="h-4 w-4" />;
      default:
        switch (status) {
          case 'agendado': return <Clock className="h-4 w-4" />;
          case 'chegou': return <User className="h-4 w-4" />;
          case 'pronto_para_terapia': return <AlertCircle className="h-4 w-4" />;
          case 'em_atendimento': return <Play className="h-4 w-4" />;
          case 'concluido': return <CheckCircle className="h-4 w-4" />;
          default: return <Clock className="h-4 w-4" />;
        }
    }
  };

  // Função para formatar tempo
  const formatarTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
  };

  // Função para renderizar botões de ação
  const renderizarBotaoAcao = (agendamento: AgendamentoTempo) => {
    const isLoading = atualizandoStatus === agendamento.id;
    
    switch (agendamento.status) {
      case 'chegou':
        return (
          <button
            onClick={() => atualizarStatus(agendamento.id, 'pronto_para_terapia', 'Guia tabulada pela recepção')}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? '...' : '📋 Tabular Guia'}
          </button>
        );
        
      case 'pronto_para_terapia':
        return (
          <button
            onClick={() => atualizarStatus(agendamento.id, 'em_atendimento', 'Sessão iniciada')}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? '...' : '▶️ Iniciar Sessão'}
          </button>
        );
        
      case 'em_atendimento':
        if (agendamento.status_dinamico === 'troca_para_profissional_2' || agendamento.status_dinamico === 'troca_para_profissional_3') {
          return (
            <button
              onClick={() => trocarProfissional(agendamento.id, agendamento)}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? '...' : agendamento.status_dinamico === 'troca_para_profissional_3' ? '🔄 Para Prof. 3' : '🔄 Para Prof. 2'}
            </button>
          );
        } else if (agendamento.status_dinamico === 'sessao_completa') {
          return (
            <button
              onClick={() => atualizarStatus(agendamento.id, 'concluido', 'Sessão finalizada')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? '...' : '✅ Finalizar'}
            </button>
          );
        } else {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => atualizarStatus(agendamento.id, 'sessao_pausada', 'Sessão pausada')}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
              >
                ⏸️ Pausar
              </button>
              <button
                onClick={() => atualizarStatus(agendamento.id, 'concluido', 'Sessão finalizada')}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
              >
                ✅ Finalizar
              </button>
            </div>
          );
        }
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando agenda...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={() => {
            setError(null);
            buscarAgendamentos();
          }}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          📅 Agenda em Tempo Real
        </h2>
        <div className="text-sm text-gray-600">
          {agendamentos.length} agendamentos hoje
        </div>
      </div>

      {/* Contadores rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-gray-700">
            {agendamentos.filter(a => a.status === 'agendado').length}
          </div>
          <div className="text-sm text-gray-600">Agendados</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-700">
            {agendamentos.filter(a => a.status === 'chegou').length}
          </div>
          <div className="text-sm text-orange-600">Chegaram</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">
            {agendamentos.filter(a => a.status === 'em_atendimento').length}
          </div>
          <div className="text-sm text-blue-600">Em atendimento</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            {agendamentos.filter(a => a.status === 'concluido').length}
          </div>
          <div className="text-sm text-green-600">Concluídos</div>
        </div>
      </div>

      {/* Lista de agendamentos */}
      <div className="space-y-3">
        {agendamentos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum agendamento para hoje</p>
          </div>
        ) : (
          agendamentos.map((agendamento) => (
            <div
              key={agendamento.id}
              className={`border-l-4 rounded-lg p-4 ${getStatusColor(agendamento.status, agendamento.status_dinamico)}`}
              style={{ borderLeftColor: getCardColor(agendamento) }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Informações do paciente */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(agendamento.status, agendamento.status_dinamico)}
                    <h3 className="font-semibold text-lg">{agendamento.paciente_nome}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {agendamento.horario_inicio} - {agendamento.horario_fim}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {agendamento.sala_nome} ({agendamento.sala_numero})
                    </div>
                  </div>

                  {/* Profissionais */}
                  <div className="mt-2 text-sm">
                    {agendamento.tipo_sessao === 'compartilhada' ? (
                      <div>
                        <div className={`${agendamento.profissional_ativo === 1 ? 'font-bold' : ''}`}>
                          👨‍⚕️ {agendamento.profissional_nome} {agendamento.profissional_ativo === 1 ? '(ATIVO)' : ''}
                        </div>
                        <div className={`${agendamento.profissional_ativo === 2 ? 'font-bold' : ''}`}>
                          👩‍⚕️ {agendamento.profissional_2_nome} {agendamento.profissional_ativo === 2 ? '(ATIVO)' : ''}
                        </div>
                      </div>
                    ) : agendamento.tipo_sessao === 'tripla' ? (
                      <div>
                        <div className={`${agendamento.profissional_ativo === 1 ? 'font-bold' : ''}`}>
                          👨‍⚕️ {agendamento.profissional_nome} {agendamento.profissional_ativo === 1 ? '(ATIVO)' : ''}
                        </div>
                        <div className={`${agendamento.profissional_ativo === 2 ? 'font-bold' : ''}`}>
                          👩‍⚕️ {agendamento.profissional_2_nome} {agendamento.profissional_ativo === 2 ? '(ATIVO)' : ''}
                        </div>
                        <div className={`${agendamento.profissional_ativo === 3 ? 'font-bold' : ''}`}>
                          👨‍⚕️ {agendamento.profissional_3_nome} {agendamento.profissional_ativo === 3 ? '(ATIVO)' : ''}
                        </div>
                      </div>
                    ) : (
                      <div>👨‍⚕️ {agendamento.profissional_nome}</div>
                    )}
                  </div>
                </div>

                {/* Timer e progresso */}
                <div className="text-center">
                  {agendamento.status === 'em_atendimento' && (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {formatarTempo(agendamento.tempo_sessao_atual)}
                      </div>
                      <div className="text-sm text-gray-600">
                        de {formatarTempo(agendamento.duracao_planejada)}
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min((agendamento.tempo_sessao_atual / agendamento.duracao_planejada) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      
                      {agendamento.tempo_restante_minutos > 0 && (
                        <div className="text-xs text-gray-500">
                          {formatarTempo(agendamento.tempo_restante_minutos)} restantes
                        </div>
                      )}
                    </div>
                  )}
                  
                  {agendamento.status !== 'em_atendimento' && (
                    <div className="text-sm text-gray-600">
                      {agendamento.proxima_acao}
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="text-right">
                  {renderizarBotaoAcao(agendamento)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
