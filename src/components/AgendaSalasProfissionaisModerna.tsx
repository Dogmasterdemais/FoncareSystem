import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Timer, 
  ArrowRight,
  RotateCcw,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useUnidade } from '../context/UnidadeContext';

interface PacienteTerapia {
  id: string;
  paciente_nome: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  sala_id: string;
  sala_nome: string;
  sala_numero: string;
  sala_cor: string;
  // Campos de automação
  sessao_iniciada_em?: string;
  profissional_ativo: number;
  tipo_sessao: string;
  tempo_profissional_1: number;
  tempo_profissional_2: number;
  tempo_profissional_3: number;
  profissional_1_id?: number;
  profissional_2_id?: number;
  profissional_3_id?: number;
  profissional_1_nome?: string;
  profissional_2_nome?: string;
  profissional_3_nome?: string;
  status_automacao: string;
  proxima_acao: string;
  tempo_sessao_atual: number;
  duracao_planejada: number;
}

interface SalaTerapia {
  sala_id: string;
  sala_nome: string;
  sala_numero: string;
  sala_cor: string;
  pacientes: PacienteTerapia[];
  profissionais: {
    profissional_1?: string;
    profissional_2?: string;
    profissional_3?: string;
  };
  capacidade_maxima: number;
}

export default function AgendaSalasProfissionaisModerna() {
  const { unidadeSelecionada } = useUnidade();
  const [salas, setSalas] = useState<SalaTerapia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState<string | null>(null);
  const [alertasAnteriores, setAlertasAnteriores] = useState<Set<string>>(new Set());

  // Função para reproduzir som de alerta
  const reproduzirAlerta = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Som de alerta não suportado neste navegador');
    }
  };

  // Atualização automática a cada 5 segundos para mostrar progresso em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        buscarDados();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, unidadeSelecionada]);

  // Buscar dados iniciais
  useEffect(() => {
    buscarDados();
  }, [unidadeSelecionada]);

  // Detectar novos alertas e reproduzir som
  useEffect(() => {
    const alertasIds = new Set<string>();
    
    salas.forEach(sala => {
      sala.pacientes.forEach(paciente => {
        if (paciente.status === 'em_atendimento') {
          const profAtivo = paciente.profissional_ativo;
          const tempoAtual = (paciente as any)[`tempo_profissional_${profAtivo}`] || 0;
          const tempoRestante = 30 - tempoAtual;
          
          // Alerta para rotação iminente ou atrasada
          if (tempoRestante <= 2) {
            const alertaId = `rotacao_${paciente.id}_${profAtivo}`;
            alertasIds.add(alertaId);
          }
        }
        
        // Alerta para sessões não iniciadas
        if (paciente.status === 'aguardando' && !paciente.sessao_iniciada_em) {
          // Simular tempo de espera baseado no horário
          const horarioInicio = new Date(paciente.horario_inicio);
          const agora = new Date();
          const tempoEspera = Math.floor((agora.getTime() - horarioInicio.getTime()) / (1000 * 60));
          
          if (tempoEspera > 10) {
            const alertaId = `sessao_nao_iniciada_${paciente.id}`;
            alertasIds.add(alertaId);
          }
        }
      });
    });
    
    const novosAlertas = Array.from(alertasIds).filter(id => !alertasAnteriores.has(id));
    if (novosAlertas.length > 0) {
      reproduzirAlerta();
      setAlertasAnteriores(alertasIds);
    }
  }, [salas, alertasAnteriores]);

  const buscarDados = async () => {
    if (!unidadeSelecionada) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Buscar dados da view completa com automação
      const { data: agendamentosData, error: agendamentosError } = await supabase
        .from('vw_agendamentos_completo')
        .select(`
          id, paciente_nome, horario_inicio, horario_fim, status,
          sala_id, sala_nome, sala_numero, sala_cor, unidade_id,
          sessao_iniciada_em, profissional_ativo, tipo_sessao,
          tempo_profissional_1, tempo_profissional_2, tempo_profissional_3,
          profissional_1_id, profissional_2_id, profissional_3_id,
          profissional_1_nome, profissional_2_nome, profissional_3_nome,
          status_automacao, proxima_acao, tempo_sessao_atual, duracao_planejada
        `)
        .eq('unidade_id', unidadeSelecionada)
        .eq('data_agendamento', new Date().toISOString().split('T')[0])
        .order('horario_inicio');

      if (agendamentosError) {
        throw agendamentosError;
      }

      // Agrupar por sala
      const salasMap = new Map<string, SalaTerapia>();
      
      agendamentosData?.forEach((agendamento: any) => {
        if (!salasMap.has(agendamento.sala_id)) {
          salasMap.set(agendamento.sala_id, {
            sala_id: agendamento.sala_id,
            sala_nome: agendamento.sala_nome,
            sala_numero: agendamento.sala_numero,
            sala_cor: agendamento.sala_cor,
            pacientes: [],
            profissionais: {},
            capacidade_maxima: 6
          });
        }
        
        const sala = salasMap.get(agendamento.sala_id)!;
        sala.pacientes.push(agendamento);
        
        // Coletar profissionais únicos da sala
        if (agendamento.profissional_1_nome && !sala.profissionais.profissional_1) {
          sala.profissionais.profissional_1 = agendamento.profissional_1_nome;
        }
        if (agendamento.profissional_2_nome && !sala.profissionais.profissional_2) {
          sala.profissionais.profissional_2 = agendamento.profissional_2_nome;
        }
        if (agendamento.profissional_3_nome && !sala.profissionais.profissional_3) {
          sala.profissionais.profissional_3 = agendamento.profissional_3_nome;
        }
      });

      setSalas(Array.from(salasMap.values()));
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados das salas');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sessão
  const iniciarSessao = async (agendamentoId: string) => {
    try {
      setProcessandoAcao(agendamentoId);
      
      const { data, error } = await supabase
        .rpc('iniciar_sessao_agendamento', { agendamento_id_param: parseInt(agendamentoId) });

      if (error) throw error;
      
      // Atualizar dados
      await buscarDados();
      
    } catch (err) {
      console.error('Erro ao iniciar sessão:', err);
      setError('Erro ao iniciar sessão');
    } finally {
      setProcessandoAcao(null);
    }
  };

  // Executar rotação automática
  const executarRotacao = async (agendamentoId: string) => {
    try {
      setProcessandoAcao(agendamentoId);
      
      const { data, error } = await supabase
        .rpc('executar_rotacao_automatica', { agendamento_id_param: parseInt(agendamentoId) });

      if (error) throw error;
      
      // Atualizar dados
      await buscarDados();
      
    } catch (err) {
      console.error('Erro ao executar rotação:', err);
      setError('Erro ao executar rotação');
    } finally {
      setProcessandoAcao(null);
    }
  };

  // Finalizar sessão
  const finalizarSessao = async (agendamentoId: string) => {
    try {
      setProcessandoAcao(agendamentoId);
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          status: 'finalizado',
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamentoId);

      if (error) throw error;
      
      // Atualizar dados
      await buscarDados();
      
    } catch (err) {
      console.error('Erro ao finalizar sessão:', err);
      setError('Erro ao finalizar sessão');
    } finally {
      setProcessandoAcao(null);
    }
  };

  // Calcular progresso atual
  const calcularProgresso = (paciente: PacienteTerapia) => {
    if (paciente.status !== 'em_atendimento' || !paciente.sessao_iniciada_em) {
      return { progresso: 0, tempoAtual: 0, tempoTotal: paciente.duracao_planejada };
    }

    const tempoTotal = paciente.duracao_planejada; // 30, 60 ou 90 minutos
    const tempoAtual = paciente.tempo_sessao_atual;
    const progresso = Math.min((tempoAtual / tempoTotal) * 100, 100);

    return { progresso, tempoAtual, tempoTotal };
  };

  // Calcular progresso por profissional
  const calcularProgressoProfissional = (paciente: PacienteTerapia, numProfissional: number) => {
    const tempoMap = {
      1: paciente.tempo_profissional_1,
      2: paciente.tempo_profissional_2,
      3: paciente.tempo_profissional_3
    };

    const tempo = tempoMap[numProfissional as keyof typeof tempoMap] || 0;
    const progresso = Math.min((tempo / 30) * 100, 100);
    const isAtivo = paciente.profissional_ativo === numProfissional;
    const foiConcluido = tempo >= 30;

    return { tempo, progresso, isAtivo, foiConcluido };
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em_atendimento':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Renderizar botão de ação
  const renderBotaoAcao = (paciente: PacienteTerapia) => {
    const isProcessando = processandoAcao === paciente.id;

    if (paciente.status === 'agendado') {
      return (
        <button
          onClick={() => iniciarSessao(paciente.id)}
          disabled={isProcessando}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          <span>{isProcessando ? 'Iniciando...' : 'Iniciar Sessão'}</span>
        </button>
      );
    }

    if (paciente.status === 'em_atendimento') {
      if (paciente.proxima_acao === 'trocar_para_profissional_2' || 
          paciente.proxima_acao === 'trocar_para_profissional_3') {
        return (
          <button
            onClick={() => executarRotacao(paciente.id)}
            disabled={isProcessando}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{isProcessando ? 'Rotacionando...' : 'Próximo Prof.'}</span>
          </button>
        );
      }

      if (paciente.proxima_acao === 'finalizar_sessao') {
        return (
          <button
            onClick={() => finalizarSessao(paciente.id)}
            disabled={isProcessando}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{isProcessando ? 'Finalizando...' : 'Finalizar'}</span>
          </button>
        );
      }

      return (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg font-medium flex items-center space-x-2">
          <Timer className="h-4 w-4" />
          <span>Em andamento...</span>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando salas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={buscarDados}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Automação - 30 Minutos</h1>
            <p className="text-gray-600 mt-1">Controle automático de rotação entre profissionais</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              {salas.length} salas ativas
            </div>
            <button 
              onClick={buscarDados}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Atualizar
            </button>
          </div>
        </div>
        
        {/* Painel de Status Global */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {(() => {
            let totalPacientes = 0;
            let totalEmAtendimento = 0;
            let totalProfissionaisAtivos = 0;
            let totalProfissionaisLivres = 0;
            
            salas.forEach(sala => {
              totalPacientes += sala.pacientes.length;
              const emAtendimento = sala.pacientes.filter(p => p.status === 'em_atendimento').length;
              totalEmAtendimento += emAtendimento;
              totalProfissionaisAtivos += emAtendimento;
              totalProfissionaisLivres += (3 - emAtendimento);
            });
            
            return (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{totalPacientes}</div>
                  <div className="text-sm text-blue-600">Total Pacientes</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{totalEmAtendimento}</div>
                  <div className="text-sm text-green-600">Em Atendimento</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-700">{totalProfissionaisAtivos}</div>
                  <div className="text-sm text-orange-600">Prof. Ativos</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-700">{totalProfissionaisLivres}</div>
                  <div className="text-sm text-gray-600">Prof. Livres</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Alertas e Notificações */}
      {(() => {
        const alertas: any[] = [];
        const alertasIds = new Set<string>();
        
        salas.forEach(sala => {
          sala.pacientes.forEach(paciente => {
            if (paciente.status === 'em_atendimento') {
              const profAtivo = paciente.profissional_ativo;
              const tempoAtual = (paciente as any)[`tempo_profissional_${profAtivo}`] || 0;
              const tempoRestante = 30 - tempoAtual;
              const nomeProfissional = sala.profissionais[`profissional_${profAtivo}` as keyof typeof sala.profissionais];
              
              // Alerta para rotação iminente (2 minutos ou menos)
              if (tempoRestante <= 2 && tempoRestante > 0) {
                const alertaId = `rotacao_iminente_${paciente.id}_${profAtivo}`;
                alertasIds.add(alertaId);
                alertas.push({
                  id: alertaId,
                  tipo: 'rotacao_iminente',
                  mensagem: `Rotação em ${tempoRestante}min`,
                  detalhes: `${paciente.paciente_nome} - Sala ${sala.sala_numero} - ${nomeProfissional}`,
                  cor: 'orange',
                  icone: '⚠️'
                });
              }
              
              // Alerta para rotação atrasada (tempo excedido)
              if (tempoRestante <= 0) {
                const alertaId = `rotacao_atrasada_${paciente.id}_${profAtivo}`;
                alertasIds.add(alertaId);
                alertas.push({
                  id: alertaId,
                  tipo: 'rotacao_atrasada',
                  mensagem: `Rotação ATRASADA por ${Math.abs(tempoRestante)}min`,
                  detalhes: `${paciente.paciente_nome} - Sala ${sala.sala_numero} - ${nomeProfissional}`,
                  cor: 'red',
                  icone: '🚨'
                });
              }
            }
            
            // Alerta para sessões não iniciadas (pacientes aguardando muito tempo)
            if (paciente.status === 'aguardando' && !paciente.sessao_iniciada_em) {
              // Simular tempo de espera baseado no horário
              const horarioInicio = new Date(paciente.horario_inicio);
              const agora = new Date();
              const tempoEspera = Math.floor((agora.getTime() - horarioInicio.getTime()) / (1000 * 60));
              
              if (tempoEspera > 10) { // Aguardando mais de 10 minutos
                const alertaId = `sessao_nao_iniciada_${paciente.id}`;
                alertasIds.add(alertaId);
                alertas.push({
                  id: alertaId,
                  tipo: 'sessao_nao_iniciada',
                  mensagem: `Aguardando há ${tempoEspera}min`,
                  detalhes: `${paciente.paciente_nome} - Sala ${sala.sala_numero}`,
                  cor: 'yellow',
                  icone: '⏰'
                });
              }
            }
          });
        });
        
        if (alertas.length === 0) return null;
        
        return (
          <div className="mb-6 space-y-2">
            {alertas.map((alerta, index) => {
              const corClasses = {
                red: 'bg-red-50 border-red-200 text-red-800',
                orange: 'bg-orange-50 border-orange-200 text-orange-800',
                yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
              };
              
              return (
                <div key={index} className={`border rounded-lg p-3 ${corClasses[alerta.cor as keyof typeof corClasses]} animate-pulse`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{alerta.icone}</span>
                      <div>
                        <div className="font-semibold">{alerta.mensagem}</div>
                        <div className="text-sm opacity-75">{alerta.detalhes}</div>
                      </div>
                    </div>
                    {alerta.tipo === 'rotacao_iminente' && (
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                        Preparar Rotação
                      </button>
                    )}
                    {alerta.tipo === 'rotacao_atrasada' && (
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700">
                        Executar Agora!
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Painel de Monitoramento de Profissionais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Monitoramento de Profissionais Ativos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            // Agrupar profissionais por tipo
            const profissionais1: any[] = [];
            const profissionais2: any[] = [];
            const profissionais3: any[] = [];
            
            salas.forEach(sala => {
              sala.pacientes.forEach(paciente => {
                if (paciente.status === 'em_atendimento') {
                  const profAtivo = paciente.profissional_ativo;
                  const nomeProfissional = sala.profissionais[`profissional_${profAtivo}` as keyof typeof sala.profissionais];
                  const tempoAtual = (paciente as any)[`tempo_profissional_${profAtivo}`] || 0;
                  const tempoRestante = 30 - tempoAtual;
                  
                  const dadosProfissional = {
                    nome: nomeProfissional,
                    paciente: paciente.paciente_nome,
                    sala: sala.sala_numero,
                    tempoAtual,
                    tempoRestante,
                    profissionalNum: profAtivo
                  };
                  
                  if (profAtivo === 1) profissionais1.push(dadosProfissional);
                  else if (profAtivo === 2) profissionais2.push(dadosProfissional);
                  else if (profAtivo === 3) profissionais3.push(dadosProfissional);
                }
              });
            });
            
            const tiposProfissionais = [
              { tipo: 1, titulo: 'Profissionais Tipo 1', lista: profissionais1, cor: 'green' },
              { tipo: 2, titulo: 'Profissionais Tipo 2', lista: profissionais2, cor: 'blue' },
              { tipo: 3, titulo: 'Profissionais Tipo 3', lista: profissionais3, cor: 'purple' }
            ];
            
            return tiposProfissionais.map(({ tipo, titulo, lista, cor }) => (
              <div key={tipo} className={`bg-${cor}-50 border border-${cor}-200 rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium text-${cor}-800`}>{titulo}</h4>
                  <span className={`bg-${cor}-100 text-${cor}-800 px-2 py-1 rounded-full text-xs font-bold`}>
                    {lista.length} ativo{lista.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {lista.length === 0 ? (
                  <div className={`text-${cor}-600 text-sm text-center py-4`}>
                    Nenhum profissional ativo
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lista.map((prof, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{prof.nome}</div>
                            <div className="text-xs text-gray-600">
                              Sala {prof.sala} • {prof.paciente}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold text-${cor}-700`}>
                              {prof.tempoRestante}min
                            </div>
                            <div className="text-xs text-gray-500">restantes</div>
                          </div>
                        </div>
                        
                        {/* Barra de progresso individual */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`bg-${cor}-500 h-1.5 rounded-full transition-all duration-300 ${prof.tempoRestante <= 2 ? 'animate-pulse' : ''}`}
                              style={{ width: `${(prof.tempoAtual / 30) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Alerta quando está quase no fim */}
                        {prof.tempoRestante <= 2 && (
                          <div className="mt-2 bg-orange-100 border border-orange-200 rounded p-1">
                            <div className="text-xs text-orange-700 font-medium text-center">
                              ⚠️ Preparar para rotação!
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Salas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {salas.map((sala) => (
          <div key={sala.sala_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header da Sala */}
            <div 
              className="p-6 border-b border-gray-100"
              style={{ 
                background: `linear-gradient(135deg, ${sala.sala_cor || '#E5E7EB'}20, ${sala.sala_cor || '#E5E7EB'}10)`,
                borderLeft: `4px solid ${sala.sala_cor || '#E5E7EB'}`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Sala {sala.sala_numero} - {sala.sala_nome}
                  </h3>
                  <p className="text-gray-600">{sala.pacientes.length} paciente(s)</p>
                  {/* Indicador de Profissionais Ativos */}
                  {(() => {
                    const profissionaisAtivos = sala.pacientes.filter(p => p.status === 'em_atendimento').length;
                    const profissionaisLivres = 3 - profissionaisAtivos;
                    
                    return (
                      <div className="flex items-center gap-2 mt-1">
                        {profissionaisAtivos > 0 && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            🔴 {profissionaisAtivos} prof. ativos
                          </span>
                        )}
                        {profissionaisLivres > 0 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            ⚪ {profissionaisLivres} prof. livres
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 font-medium">{sala.pacientes.length}/{sala.capacidade_maxima}</span>
                </div>
              </div>
            </div>

            {/* Profissionais */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Profissionais da Sala</h4>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((num) => {
                  const nomeProfissional = sala.profissionais[`profissional_${num}` as keyof typeof sala.profissionais];
                  
                  // Verificar se algum paciente está com este profissional
                  const pacienteComProfissional = sala.pacientes.find(p => 
                    p.status === 'em_atendimento' && p.profissional_ativo === num
                  );
                  
                  const isAtivo = !!pacienteComProfissional;
                  
                  return (
                    <div 
                      key={num}
                      className={`p-3 rounded-lg text-center transition-all duration-300 ${
                        nomeProfissional 
                          ? isAtivo 
                            ? 'bg-green-100 text-green-800 border-2 border-green-400 shadow-lg animate-pulse' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-sm flex items-center justify-center gap-1">
                        Prof. {num}
                        {isAtivo && <span className="text-green-600">🔴</span>}
                      </div>
                      <div className="text-xs mt-1 truncate">
                        {nomeProfissional || 'Livre'}
                      </div>
                      {isAtivo && (
                        <div className="text-xs mt-1 font-bold text-green-700">
                          ▶️ ATIVO
                        </div>
                      )}
                      {pacienteComProfissional && (
                        <div className="text-xs mt-1 text-green-600 truncate">
                          {pacienteComProfissional.paciente_nome}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pacientes */}
            <div className="p-6">
              {sala.pacientes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Nenhum paciente agendado</p>
                  <p className="text-sm">Sala disponível</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sala.pacientes.map((paciente) => {
                    const { progresso, tempoAtual, tempoTotal } = calcularProgresso(paciente);
                    
                    return (
                      <div key={paciente.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                        {/* Header do Paciente */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="font-semibold text-gray-900 text-lg">{paciente.paciente_nome}</h5>
                            <p className="text-sm text-gray-600">{paciente.horario_inicio} - {paciente.horario_fim}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paciente.status)}`}>
                            {paciente.status === 'agendado' && 'Agendado'}
                            {paciente.status === 'em_atendimento' && 'Em Atendimento'}
                            {paciente.status === 'finalizado' && 'Finalizado'}
                          </div>
                        </div>

                        {/* Indicador do Profissional Ativo */}
                        {paciente.status === 'em_atendimento' && (
                          <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                            <div className="flex items-center gap-2">
                              <Zap className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-blue-800">
                                Atualmente com: Profissional {paciente.profissional_ativo}
                              </span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                🔴 ATIVO
                              </span>
                            </div>
                            <div className="text-sm text-blue-700 mt-1">
                              {sala.profissionais[`profissional_${paciente.profissional_ativo}` as keyof typeof sala.profissionais] || 'Nome não encontrado'}
                            </div>
                          </div>
                        )}

                        {/* Progresso Geral */}
                        {paciente.status === 'em_atendimento' && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span className="font-medium">Progresso Geral</span>
                              <span className="font-medium">{Math.round(progresso)}% • {tempoAtual}/{tempoTotal} min</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${progresso}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Progresso por Profissional */}
                        {paciente.status === 'em_atendimento' && (
                          <div className="mb-4">
                            <h6 className="text-sm font-medium text-gray-700 mb-3">Sequência de Rotação (30 min cada)</h6>
                            <div className="space-y-2">
                              {[1, 2, 3].map((num) => {
                                const { tempo, progresso: progProf, isAtivo, foiConcluido } = calcularProgressoProfissional(paciente, num);
                                const nomeProfissional = sala.profissionais[`profissional_${num}` as keyof typeof sala.profissionais];
                                
                                if (!nomeProfissional) return null;
                                
                                // Determinar o status visual
                                let statusIcon = '';
                                let statusText = '';
                                let statusColor = '';
                                
                                if (isAtivo) {
                                  statusIcon = '🔴';
                                  statusText = 'ATENDENDO AGORA';
                                  statusColor = 'text-green-700 bg-green-100 border-green-300';
                                } else if (foiConcluido) {
                                  statusIcon = '✅';
                                  statusText = 'CONCLUÍDO';
                                  statusColor = 'text-blue-700 bg-blue-100 border-blue-300';
                                } else if (paciente.profissional_ativo < num) {
                                  statusIcon = '⏳';
                                  statusText = 'AGUARDANDO';
                                  statusColor = 'text-gray-600 bg-gray-100 border-gray-300';
                                } else {
                                  statusIcon = '⏸️';
                                  statusText = 'PAUSADO';
                                  statusColor = 'text-yellow-700 bg-yellow-100 border-yellow-300';
                                }
                                
                                return (
                                  <div key={num} className={`flex items-center space-x-3 p-2 rounded-lg border ${statusColor}`}>
                                    <div className="w-24 text-xs font-medium">
                                      Prof. {num}
                                      <span className="ml-1">{statusIcon}</span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">{nomeProfissional}</span>
                                        <span className="text-xs font-bold">{statusText}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all duration-300 ${
                                            isAtivo ? 'bg-green-500 animate-pulse' : foiConcluido ? 'bg-blue-500' : 'bg-gray-400'
                                          }`}
                                          style={{ width: `${progProf}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div className="text-xs font-medium text-right w-16">
                                      {tempo}/30 min
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Próxima Ação */}
                            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="text-sm font-medium text-amber-800">
                                📋 Próxima ação: {
                                  paciente.proxima_acao === 'trocar_para_profissional_2' ? '🔄 Rotacionar para Profissional 2' :
                                  paciente.proxima_acao === 'trocar_para_profissional_3' ? '🔄 Rotacionar para Profissional 3' :
                                  paciente.proxima_acao === 'finalizar_sessao' ? '🏁 Finalizar sessão' :
                                  '⏰ Continuar com profissional atual'
                                }
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {paciente.status === 'em_atendimento' && (
                              <span className="flex items-center space-x-1">
                                <Zap className="h-4 w-4 text-green-500" />
                                <span>Profissional {paciente.profissional_ativo} ativo</span>
                              </span>
                            )}
                          </div>
                          {renderBotaoAcao(paciente)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
