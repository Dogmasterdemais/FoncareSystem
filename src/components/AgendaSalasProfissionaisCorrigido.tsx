import React, { useState, useEffect } from 'react';
import { Clock, User, MapPin, Play, CheckCircle, AlertCircle, Users, Timer } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface PacienteTerapia {
  id: string;
  paciente_nome: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  status_dinamico: string;
  tempo_sessao_atual: number;
  tempo_restante_minutos: number;
  duracao_planejada: number;
  tipo_sessao: string;
  profissional_ativo: number;
  profissional_nome: string;
  profissional_2_nome?: string;
  profissional_3_nome?: string;
  especialidade_nome: string;
  especialidade_cor?: string;
  sessao_iniciada_em?: string;
  proxima_acao: string;
}

interface SalaTerapia {
  sala_id: string;
  sala_nome: string;
  sala_numero: string;
  sala_cor: string;
  unidade_nome: string;
  pacientes: PacienteTerapia[];
  profissionais_ativos: {
    profissional_1?: string;
    profissional_2?: string;
    profissional_3?: string;
  };
  capacidade_maxima: number;
  ocupacao_atual: number;
}

interface AgendaSalasProfissionaisProps {
  unidadeSelecionada?: string;
}

export default function AgendaSalasProfissionais({ unidadeSelecionada }: AgendaSalasProfissionaisProps) {
  const [salas, setSalas] = useState<SalaTerapia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null);

  // Buscar dados organizados por sala
  const buscarDadosSalas = async () => {
    try {
      // Primeiro executar processamento automático de transições
      await supabase.rpc('executar_processamento_automatico');
      
      // CORREÇÃO: Filtrar apenas agendamentos do horário atual ou próximos
      const agora = new Date();
      const dataHoje = agora.toISOString().split('T')[0]; // YYYY-MM-DD
      const horaAtual = agora.getHours();
      const minutoAtual = agora.getMinutes();
      const horarioAtual = `${horaAtual.toString().padStart(2, '0')}:${minutoAtual.toString().padStart(2, '0')}:00`;
      
      // Buscar apenas agendamentos relevantes para o momento:
      // 1. Data de hoje
      // 2. Status ativos (não finalizados)
      // 3. Horário próximo (1 hora antes até 2 horas depois)
      const umaHoraAntes = new Date(agora.getTime() - 60 * 60 * 1000);
      const duasHorasDepois = new Date(agora.getTime() + 2 * 60 * 60 * 1000);
      
      const horarioInicio = `${umaHoraAntes.getHours().toString().padStart(2, '0')}:${umaHoraAntes.getMinutes().toString().padStart(2, '0')}:00`;
      const horarioFim = `${duasHorasDepois.getHours().toString().padStart(2, '0')}:${duasHorasDepois.getMinutes().toString().padStart(2, '0')}:00`;

      let query = supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .eq('data_agendamento', dataHoje) // Apenas hoje
        .gte('horario_inicio', horarioInicio) // Pelo menos 1h antes
        .lte('horario_inicio', horarioFim) // Até 2h depois
        .in('status', ['agendado', 'pronto_para_terapia', 'em_atendimento']); // Apenas ativos

      // Filtrar por unidade se especificada
      if (unidadeSelecionada && unidadeSelecionada.trim() !== '') {
        query = query.eq('unidade_nome', unidadeSelecionada);
      }

      const { data, error } = await query
        .order('sala_numero')
        .order('horario_inicio');

      if (error) throw error;

      console.log(`🔍 Agenda Salas: Encontrados ${data?.length || 0} agendamentos relevantes para o horário atual (${horarioAtual})`);

      // Agrupar por sala E horário (sessões distintas)
      const salasMap = new Map<string, SalaTerapia>();
      
      data?.forEach((agendamento: any) => {
        const salaKey = `${agendamento.sala_id}`;
        
        if (!salasMap.has(salaKey)) {
          salasMap.set(salaKey, {
            sala_id: agendamento.sala_id,
            sala_nome: agendamento.sala_nome,
            sala_numero: agendamento.sala_numero,
            sala_cor: agendamento.sala_cor,
            unidade_nome: agendamento.unidade_nome,
            pacientes: [],
            profissionais_ativos: {},
            capacidade_maxima: 6, // 2 pacientes por profissional * 3 profissionais
            ocupacao_atual: 0
          });
        }

        const sala = salasMap.get(salaKey)!;
        
        // IMPORTANTE: Verificar se o agendamento é da sessão atual/próxima
        const horarioAgendamento = agendamento.horario_inicio;
        const horaAgendamento = parseInt(horarioAgendamento.split(':')[0]);
        const minutoAgendamento = parseInt(horarioAgendamento.split(':')[1]);
        
        // Calcular diferença em minutos
        const agendamentoMinutos = horaAgendamento * 60 + minutoAgendamento;
        const atualMinutos = horaAtual * 60 + minutoAtual;
        const diferencaMinutos = Math.abs(agendamentoMinutos - atualMinutos);
        
        // Mostrar apenas se:
        // 1. Está em atendimento OU
        // 2. Está próximo do horário (30 min antes/depois) OU
        // 3. Está pronto para terapia
        const mostrarAgendamento = 
          agendamento.status === 'em_atendimento' ||
          agendamento.status === 'pronto_para_terapia' ||
          diferencaMinutos <= 30;
        
        if (mostrarAgendamento) {
          sala.pacientes.push(agendamento);
          
          // Contar ocupação atual
          if (agendamento.status === 'em_atendimento' || agendamento.status === 'pronto_para_terapia') {
            sala.ocupacao_atual++;
          }

          // Identificar profissionais ativos
          if (agendamento.status === 'em_atendimento') {
            if (agendamento.profissional_ativo === 1) {
              sala.profissionais_ativos.profissional_1 = agendamento.profissional_nome;
            } else if (agendamento.profissional_ativo === 2 && agendamento.profissional_2_nome) {
              sala.profissionais_ativos.profissional_2 = agendamento.profissional_2_nome;
            } else if (agendamento.profissional_ativo === 3 && agendamento.profissional_3_nome) {
              sala.profissionais_ativos.profissional_3 = agendamento.profissional_3_nome;
            }
          }
        }
      });

      // Filtrar salas que têm pacientes relevantes
      const salasComPacientes = Array.from(salasMap.values()).filter(sala => sala.pacientes.length > 0);
      
      console.log(`📊 Agenda Salas: ${salasComPacientes.length} salas com agendamentos ativos`);
      
      setSalas(salasComPacientes);
    } catch (err) {
      console.error('Erro ao buscar dados das salas:', err);
      setError('Erro ao carregar dados das salas');
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

      await buscarDadosSalas();
      console.log(`✅ Status atualizado para: ${novoStatus}`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status do paciente');
    } finally {
      setAtualizandoStatus(null);
    }
  };

  // Atualizar automaticamente a cada 30 segundos
  useEffect(() => {
    buscarDadosSalas();
    
    const interval = setInterval(buscarDadosSalas, 30000);
    return () => clearInterval(interval);
  }, [unidadeSelecionada]);

  // Função para formatar tempo
  const formatarTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
  };

  // Função para obter cor do status
  const getStatusColor = (status: string, statusDinamico: string) => {
    switch (statusDinamico) {
      case 'troca_para_profissional_2': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'troca_para_profissional_3': return 'bg-amber-100 border-amber-400 text-amber-800';
      case 'sessao_completa': return 'bg-green-100 border-green-400 text-green-800';
      case 'em_andamento': return 'bg-blue-100 border-blue-400 text-blue-800';
      default:
        switch (status) {
          case 'agendado': return 'bg-gray-100 border-gray-300 text-gray-700';
          case 'chegou': return 'bg-orange-100 border-orange-400 text-orange-800';
          case 'pronto_para_terapia': return 'bg-purple-100 border-purple-400 text-purple-800';
          case 'em_atendimento': return 'bg-blue-100 border-blue-400 text-blue-800';
          case 'concluido': return 'bg-green-100 border-green-400 text-green-800';
          default: return 'bg-gray-100 border-gray-300 text-gray-700';
        }
    }
  };

  // Função para renderizar botão de ação simples
  const renderizarBotaoAcao = (paciente: PacienteTerapia) => {
    const isLoading = atualizandoStatus === paciente.id;
    
    switch (paciente.status) {
      case 'chegou':
        return (
          <button
            onClick={() => atualizarStatus(paciente.id, 'pronto_para_terapia', 'Pronto para terapia')}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
          >
            {isLoading ? '...' : '📋 Pronto'}
          </button>
        );
        
      case 'pronto_para_terapia':
        return (
          <button
            onClick={() => atualizarStatus(paciente.id, 'em_atendimento', 'Sessão iniciada automaticamente')}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
          >
            {isLoading ? '...' : '▶️ Iniciar'}
          </button>
        );
        
      case 'em_atendimento':
        if (paciente.status_dinamico === 'sessao_completa') {
          return (
            <button
              onClick={() => atualizarStatus(paciente.id, 'concluido', 'Sessão finalizada')}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
            >
              {isLoading ? '...' : '✅ Finalizar'}
            </button>
          );
        } else {
          return (
            <button
              onClick={() => atualizarStatus(paciente.id, 'concluido', 'Sessão finalizada manualmente')}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
            >
              {isLoading ? '...' : '✅ Finalizar'}
            </button>
          );
        }
        
      default:
        return null;
    }
  };

  // Função para obter profissional ativo atual
  const getProfissionalAtivo = (paciente: PacienteTerapia) => {
    if (paciente.tipo_sessao === 'individual') {
      return paciente.profissional_nome;
    } else if (paciente.tipo_sessao === 'compartilhada') {
      return paciente.profissional_ativo === 2 ? paciente.profissional_2_nome : paciente.profissional_nome;
    } else if (paciente.tipo_sessao === 'tripla') {
      if (paciente.profissional_ativo === 3) return paciente.profissional_3_nome;
      if (paciente.profissional_ativo === 2) return paciente.profissional_2_nome;
      return paciente.profissional_nome;
    }
    return paciente.profissional_nome;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando salas...</span>
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
            buscarDadosSalas();
          }}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          🏥 Controle de Salas - Tempo Real
        </h2>
        <div className="text-sm text-gray-600">
          {salas.length} salas {unidadeSelecionada && `- ${unidadeSelecionada}`}
        </div>
      </div>

      {/* Grid de salas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {salas.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>
              {unidadeSelecionada 
                ? `Nenhuma sala com agendamentos hoje na unidade ${unidadeSelecionada}` 
                : 'Nenhuma sala com agendamentos hoje'
              }
            </p>
          </div>
        ) : (
          salas.map((sala) => (
            <div
              key={sala.sala_id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
              style={{ borderTopColor: sala.sala_cor, borderTopWidth: '4px' }}
            >
              {/* Header da sala */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{sala.sala_nome}</h3>
                    <p className="text-sm text-gray-600">Sala {sala.sala_numero}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {sala.ocupacao_atual}/{sala.capacidade_maxima}
                    </div>
                    <div className="text-xs text-gray-500">Ocupação</div>
                  </div>
                </div>
              </div>

              {/* Profissionais da sala */}
              <div className="p-4 bg-blue-50 border-b">
                <h4 className="text-sm font-medium text-gray-700 mb-2">👨‍⚕️ Profissionais na Sala</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`p-2 rounded ${sala.profissionais_ativos.profissional_1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    <div className="font-medium">Prof. 1</div>
                    <div className="truncate">{sala.profissionais_ativos.profissional_1 || 'Livre'}</div>
                  </div>
                  <div className={`p-2 rounded ${sala.profissionais_ativos.profissional_2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    <div className="font-medium">Prof. 2</div>
                    <div className="truncate">{sala.profissionais_ativos.profissional_2 || 'Livre'}</div>
                  </div>
                  <div className={`p-2 rounded ${sala.profissionais_ativos.profissional_3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    <div className="font-medium">Prof. 3</div>
                    <div className="truncate">{sala.profissionais_ativos.profissional_3 || 'Livre'}</div>
                  </div>
                </div>
              </div>

              {/* Pacientes na sala */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">👶 Pacientes ({sala.pacientes.length})</h4>
                
                {sala.pacientes.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    Nenhum paciente agendado
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sala.pacientes.map((paciente) => (
                      <div
                        key={paciente.id}
                        className={`border rounded-lg p-3 ${getStatusColor(paciente.status, paciente.status_dinamico)}`}
                      >
                        {/* Nome e horário */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{paciente.paciente_nome}</div>
                          <div className="text-xs text-gray-600">
                            {paciente.horario_inicio} - {paciente.horario_fim}
                          </div>
                        </div>

                        {/* Profissional atual e timer */}
                        {paciente.status === 'em_atendimento' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs">
                                <span className="text-gray-600">Com:</span>{' '}
                                <span className="font-medium">{getProfissionalAtivo(paciente)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Timer className="h-3 w-3" />
                                <span className="font-bold">{formatarTempo(paciente.tempo_sessao_atual)}</span>
                                <span className="text-gray-500">/ {formatarTempo(paciente.duracao_planejada)}</span>
                              </div>
                            </div>

                            {/* Barra de progresso */}
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                                style={{
                                  width: `${Math.min((paciente.tempo_sessao_atual / paciente.duracao_planejada) * 100, 100)}%`
                                }}
                              ></div>
                            </div>

                            {/* Status dinâmico */}
                            {paciente.status_dinamico && (
                              <div className="text-xs font-medium">
                                {paciente.status_dinamico === 'troca_para_profissional_2' && '🔄 Mudando para Prof. 2'}
                                {paciente.status_dinamico === 'troca_para_profissional_3' && '🔄 Mudando para Prof. 3'}
                                {paciente.status_dinamico === 'sessao_completa' && '✅ Sessão Completa'}
                                {paciente.status_dinamico === 'em_andamento' && '▶️ Em Andamento'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Próxima ação para outros status */}
                        {paciente.status !== 'em_atendimento' && (
                          <div className="text-xs text-gray-600 mb-2">
                            {paciente.proxima_acao}
                          </div>
                        )}

                        {/* Botão de ação */}
                        <div className="flex justify-end">
                          {renderizarBotaoAcao(paciente)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
