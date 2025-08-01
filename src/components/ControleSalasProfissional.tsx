'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUnidade } from '@/context/UnidadeContext';
import { 
  Grid3X3, 
  List, 
  Filter, 
  Users, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Calendar,
  ChevronDown,
  Zap
} from 'lucide-react';

// Interfaces
interface PacienteAtivo {
  id: string;
  paciente_nome: string;
  horario_inicio: string;
  horario_fim: string;
  status: string;
  // Automação
  sessao_iniciada_em?: string;
  profissional_ativo?: number;
  tempo_profissional_1: number;
  tempo_profissional_2: number;
  tempo_profissional_3: number;
  // Controle de rotação
  profissionais_concluidos: number[]; // Array dos profissionais já atendidos
  proximo_profissional: number; // Próximo profissional disponível
  // Status de conclusão
  atendimento_completo: boolean;
  codigo_autorizacao: string;
  numero_guia: string;
}

interface SalaAtiva {
  sala_id: string;
  sala_nome: string;
  sala_numero: string;
  sala_cor: string;
  capacidade_maxima: number;
  pacientes_ativos: PacienteAtivo[];
  profissionais: {
    profissional_1: string;
    profissional_2: string;
    profissional_3: string;
  };
  // Estatísticas da sala
  ocupacao_atual: number;
  profissionais_livres: number[];
  profissionais_ocupados: number[];
}

type VisualizacaoTipo = 'grid' | 'lista';
type FiltroSala = 'todas' | string;

export default function ControleSalasProfissional() {
  const { unidadeSelecionada } = useUnidade();
  const [salas, setSalas] = useState<SalaAtiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de interface
  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('grid');
  const [filtroSala, setFiltroSala] = useState<FiltroSala>('todas');
  const [salaExpandida, setSalaExpandida] = useState<string | null>(null);
  
  // Estados de controle
  const [processandoAcao, setProcessandoAcao] = useState<string | null>(null);

  // Atualização automática
  useEffect(() => {
    buscarDadosAtivos();
    const interval = setInterval(buscarDadosAtivos, 10000); // A cada 10 segundos
    return () => clearInterval(interval);
  }, [unidadeSelecionada]);

  const buscarDadosAtivos = async () => {
    if (!unidadeSelecionada) return;

    try {
      setError(null);
      
      // Buscar apenas pacientes com guias tabuladas e não concluídos
      const { data, error } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .eq('unidade_id', unidadeSelecionada)
        .eq('data_agendamento', new Date().toISOString().split('T')[0])
        .not('codigo_autorizacao', 'is', null) // Apenas guias tabuladas
        .neq('status', 'concluido') // Não mostrar concluídos
        .in('status', ['aguardando', 'em_atendimento']);

      if (error) throw error;

      // Agrupar por salas e processar dados
      const salasAgrupadas = agruparPorSalas(data || []);
      setSalas(salasAgrupadas);
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados das salas');
    } finally {
      setLoading(false);
    }
  };

  const agruparPorSalas = (agendamentos: any[]): SalaAtiva[] => {
    const salasMap = new Map<string, SalaAtiva>();

    agendamentos.forEach(agendamento => {
      const salaId = agendamento.sala_id;
      
      if (!salasMap.has(salaId)) {
        salasMap.set(salaId, {
          sala_id: salaId,
          sala_nome: agendamento.sala_nome,
          sala_numero: agendamento.sala_numero,
          sala_cor: agendamento.sala_cor,
          capacidade_maxima: agendamento.capacidade_maxima,
          pacientes_ativos: [],
          profissionais: {
            profissional_1: agendamento.profissional_1_nome || 'Não definido',
            profissional_2: agendamento.profissional_2_nome || 'Não definido',
            profissional_3: agendamento.profissional_3_nome || 'Não definido'
          },
          ocupacao_atual: 0,
          profissionais_livres: [],
          profissionais_ocupados: []
        });
      }

      const sala = salasMap.get(salaId)!;
      
      // Processar paciente
      const paciente: PacienteAtivo = {
        id: agendamento.id,
        paciente_nome: agendamento.paciente_nome,
        horario_inicio: agendamento.horario_inicio,
        horario_fim: agendamento.horario_fim,
        status: agendamento.status,
        sessao_iniciada_em: agendamento.sessao_iniciada_em,
        profissional_ativo: agendamento.profissional_ativo,
        tempo_profissional_1: agendamento.tempo_profissional_1 || 0,
        tempo_profissional_2: agendamento.tempo_profissional_2 || 0,
        tempo_profissional_3: agendamento.tempo_profissional_3 || 0,
        profissionais_concluidos: calcularProfissionaisConcluidos(agendamento),
        proximo_profissional: calcularProximoProfissional(agendamento, sala),
        atendimento_completo: verificarAtendimentoCompleto(agendamento),
        codigo_autorizacao: agendamento.codigo_autorizacao,
        numero_guia: agendamento.numero_guia
      };

      sala.pacientes_ativos.push(paciente);
    });

    // Calcular estatísticas das salas
    return Array.from(salasMap.values()).map(sala => {
      const { profissionais_livres, profissionais_ocupados } = calcularDisponibilidadeProfissionais(sala);
      
      return {
        ...sala,
        ocupacao_atual: sala.pacientes_ativos.length,
        profissionais_livres,
        profissionais_ocupados
      };
    });
  };

  const calcularProfissionaisConcluidos = (agendamento: any): number[] => {
    const concluidos: number[] = [];
    if (agendamento.tempo_profissional_1 >= 30) concluidos.push(1);
    if (agendamento.tempo_profissional_2 >= 30) concluidos.push(2);
    if (agendamento.tempo_profissional_3 >= 30) concluidos.push(3);
    return concluidos;
  };

  const calcularProximoProfissional = (agendamento: any, sala: SalaAtiva): number => {
    const concluidos = calcularProfissionaisConcluidos(agendamento);
    
    // Se está em atendimento, retorna o profissional ativo
    if (agendamento.status === 'em_atendimento' && agendamento.profissional_ativo) {
      return agendamento.profissional_ativo;
    }
    
    // Encontrar próximo profissional disponível que ainda não atendeu
    for (let prof = 1; prof <= 3; prof++) {
      if (!concluidos.includes(prof)) {
        // Verificar se profissional está livre (será implementado na lógica de disponibilidade)
        return prof;
      }
    }
    
    return 1; // Fallback
  };

  const verificarAtendimentoCompleto = (agendamento: any): boolean => {
    return agendamento.tempo_profissional_1 >= 30 && 
           agendamento.tempo_profissional_2 >= 30 && 
           agendamento.tempo_profissional_3 >= 30;
  };

  const calcularDisponibilidadeProfissionais = (sala: SalaAtiva) => {
    const ocupados: number[] = [];
    const livres: number[] = [];
    
    // Verificar quais profissionais estão atendendo
    sala.pacientes_ativos.forEach(paciente => {
      if (paciente.status === 'em_atendimento' && paciente.profissional_ativo) {
        if (!ocupados.includes(paciente.profissional_ativo)) {
          ocupados.push(paciente.profissional_ativo);
        }
      }
    });
    
    // Profissionais livres são os que não estão ocupados
    [1, 2, 3].forEach(prof => {
      if (!ocupados.includes(prof)) {
        livres.push(prof);
      }
    });
    
    return { profissionais_livres: livres, profissionais_ocupados: ocupados };
  };

  const iniciarAtendimento = async (pacienteId: string, salaId: string) => {
    setProcessandoAcao(pacienteId);
    
    try {
      const sala = salas.find(s => s.sala_id === salaId);
      if (!sala) throw new Error('Sala não encontrada');
      
      const paciente = sala.pacientes_ativos.find(p => p.id === pacienteId);
      if (!paciente) throw new Error('Paciente não encontrado');
      
      // Encontrar próximo profissional livre
      const proximoProfissional = encontrarProximoProfissionalLivre(paciente, sala);
      
      if (!proximoProfissional) {
        alert('Todos os profissionais estão ocupados. Aguarde.');
        return;
      }
      
      // Chamar função do banco para iniciar sessão
      const { error } = await supabase.rpc('iniciar_sessao_agendamento', {
        p_agendamento_id: pacienteId,
        p_profissional_numero: proximoProfissional
      });
      
      if (error) throw error;
      
      await buscarDadosAtivos(); // Atualizar dados
      
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      alert('Erro ao iniciar atendimento');
    } finally {
      setProcessandoAcao(null);
    }
  };

  const encontrarProximoProfissionalLivre = (paciente: PacienteAtivo, sala: SalaAtiva): number | null => {
    const { profissionais_livres } = sala;
    const { profissionais_concluidos } = paciente;
    
    // Encontrar primeiro profissional livre que ainda não atendeu este paciente
    for (const prof of profissionais_livres) {
      if (!profissionais_concluidos.includes(prof)) {
        return prof;
      }
    }
    
    return null;
  };

  const executarRotacao = async (pacienteId: string) => {
    setProcessandoAcao(pacienteId);
    
    try {
      const { error } = await supabase.rpc('executar_rotacao_automatica', {
        p_agendamento_id: pacienteId
      });
      
      if (error) throw error;
      
      await buscarDadosAtivos();
      
    } catch (error) {
      console.error('Erro ao executar rotação:', error);
      alert('Erro ao executar rotação');
    } finally {
      setProcessandoAcao(null);
    }
  };

  const finalizarAtendimento = async (pacienteId: string) => {
    setProcessandoAcao(pacienteId);
    
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          status: 'concluido',
          profissional_ativo: null
        })
        .eq('id', pacienteId);
      
      if (error) throw error;
      
      await buscarDadosAtivos();
      
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      alert('Erro ao finalizar atendimento');
    } finally {
      setProcessandoAcao(null);
    }
  };

  // Filtrar salas
  const salasFiltradas = filtroSala === 'todas' 
    ? salas 
    : salas.filter(sala => sala.sala_id === filtroSala);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando controle de salas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de Controle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Controle de Salas - Terapia
            </h1>
            <p className="text-gray-600 mt-1">
              Monitoramento em tempo real • Apenas pacientes com guias tabuladas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Toggle Agenda Completa */}
            <a
              href="/agenda/completa"
              className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Ver Agenda Completa
            </a>
            
            {/* Visualização */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVisualizacao('grid')}
                className={`px-3 py-1 rounded ${
                  visualizacao === 'grid'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setVisualizacao('lista')}
                className={`px-3 py-1 rounded ${
                  visualizacao === 'lista'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            {/* Filtro de Sala */}
            <select
              value={filtroSala}
              onChange={(e) => setFiltroSala(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as Salas</option>
              {salas.map(sala => (
                <option key={sala.sala_id} value={sala.sala_id}>
                  Sala {sala.sala_numero} - {sala.sala_nome}
                </option>
              ))}
            </select>
            
            <button
              onClick={buscarDadosAtivos}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Atualizar
            </button>
          </div>
        </div>
        
        {/* Estatísticas Globais */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {salasFiltradas.reduce((acc, sala) => acc + sala.pacientes_ativos.length, 0)}
            </div>
            <div className="text-sm text-blue-600">Pacientes Ativos</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">
              {salasFiltradas.reduce((acc, sala) => 
                acc + sala.pacientes_ativos.filter(p => p.status === 'em_atendimento').length, 0
              )}
            </div>
            <div className="text-sm text-green-600">Em Atendimento</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-700">
              {salasFiltradas.reduce((acc, sala) => acc + sala.profissionais_ocupados.length, 0)}
            </div>
            <div className="text-sm text-orange-600">Prof. Ocupados</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">
              {salasFiltradas.reduce((acc, sala) => acc + sala.profissionais_livres.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Prof. Livres</div>
          </div>
        </div>
      </div>

      {/* Alertas Críticos */}
      {(() => {
        const alertasCriticos = salasFiltradas.flatMap(sala =>
          sala.pacientes_ativos.filter(paciente => {
            if (paciente.status === 'em_atendimento' && paciente.profissional_ativo) {
              const tempoAtual = (paciente as any)[`tempo_profissional_${paciente.profissional_ativo}`] || 0;
              return tempoAtual >= 32; // Mais de 32 minutos = rotação atrasada
            }
            return false;
          })
        );

        if (alertasCriticos.length === 0) return null;

        return (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-red-800 font-medium">
                  ⚠️ Rotações Atrasadas ({alertasCriticos.length})
                </h3>
                <div className="mt-2 space-y-1">
                  {alertasCriticos.map(paciente => (
                    <div key={paciente.id} className="text-sm text-red-700">
                      {paciente.paciente_nome} - Profissional {paciente.profissional_ativo} (&gt;30min)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lista/Grid de Salas */}
      {visualizacao === 'grid' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {salasFiltradas.map(sala => (
            <SalaCard 
              key={sala.sala_id} 
              sala={sala}
              expandida={salaExpandida === sala.sala_id}
              onToggleExpansao={() => 
                setSalaExpandida(salaExpandida === sala.sala_id ? null : sala.sala_id)
              }
              onIniciarAtendimento={iniciarAtendimento}
              onExecutarRotacao={executarRotacao}
              onFinalizarAtendimento={finalizarAtendimento}
              processando={processandoAcao}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {salasFiltradas.map(sala => (
            <SalaLista 
              key={sala.sala_id} 
              sala={sala}
              onIniciarAtendimento={iniciarAtendimento}
              onExecutarRotacao={executarRotacao}
              onFinalizarAtendimento={finalizarAtendimento}
              processando={processandoAcao}
            />
          ))}
        </div>
      )}

      {salasFiltradas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma sala ativa encontrada
          </h3>
          <p className="text-gray-600">
            Não há pacientes com guias tabuladas nas salas no momento.
          </p>
        </div>
      )}
    </div>
  );
}

// Componente SalaCard será implementado na sequência...
function SalaCard({ 
  sala, 
  expandida, 
  onToggleExpansao, 
  onIniciarAtendimento, 
  onExecutarRotacao, 
  onFinalizarAtendimento, 
  processando 
}: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header da Sala */}
      <div 
        className="p-4 border-b border-gray-100 cursor-pointer"
        style={{ 
          background: `linear-gradient(135deg, ${sala.sala_cor}20, ${sala.sala_cor}10)`,
          borderLeft: `4px solid ${sala.sala_cor}`
        }}
        onClick={onToggleExpansao}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Sala {sala.sala_numero} - {sala.sala_nome}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">
                {sala.ocupacao_atual}/{sala.capacidade_maxima} pacientes
              </span>
              {sala.profissionais_ocupados.length > 0 && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                  {sala.profissionais_ocupados.length} prof. ativos
                </span>
              )}
              {sala.profissionais_livres.length > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {sala.profissionais_livres.length} prof. livres
                </span>
              )}
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandida ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Conteúdo da Sala */}
      <div className="p-4">
        {/* Profissionais da Sala */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Profissionais</h4>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(num => {
              const isOcupado = sala.profissionais_ocupados.includes(num);
              const nomeProfissional = sala.profissionais[`profissional_${num}` as keyof typeof sala.profissionais];
              
              return (
                <div 
                  key={num}
                  className={`p-2 rounded text-center text-xs transition-all ${
                    isOcupado 
                      ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse' 
                      : 'bg-green-100 text-green-800 border border-green-300'
                  }`}
                >
                  <div className="font-medium">Prof. {num}</div>
                  <div className="truncate">{nomeProfissional}</div>
                  <div className="font-bold">
                    {isOcupado ? '🔴 OCUPADO' : '🟢 LIVRE'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Pacientes */}
        <div className="space-y-3">
          {sala.pacientes_ativos.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              Nenhum paciente ativo
            </div>
          ) : (
            sala.pacientes_ativos.map((paciente: PacienteAtivo) => (
              <PacienteCard
                key={paciente.id}
                paciente={paciente}
                sala={sala}
                onIniciarAtendimento={onIniciarAtendimento}
                onExecutarRotacao={onExecutarRotacao}
                onFinalizarAtendimento={onFinalizarAtendimento}
                processando={processando}
                expandida={expandida}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Componente SalaLista (mais compacto para visualização em lista)
function SalaLista({ sala, onIniciarAtendimento, onExecutarRotacao, onFinalizarAtendimento, processando }: any) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Sala {sala.sala_numero} - {sala.sala_nome}
          </h3>
          <div className="text-sm text-gray-600">
            {sala.ocupacao_atual} pacientes • {sala.profissionais_ocupados.length} prof. ativos
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sala.profissionais_ocupados.map((prof: number) => (
            <span key={prof} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
              Prof. {prof} 🔴
            </span>
          ))}
          {sala.profissionais_livres.map((prof: number) => (
            <span key={prof} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              Prof. {prof} 🟢
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sala.pacientes_ativos.map((paciente: PacienteAtivo) => (
          <div key={paciente.id} className="border border-gray-200 rounded-lg p-3">
            <div className="font-medium text-sm">{paciente.paciente_nome}</div>
            <div className="text-xs text-gray-600 mb-2">
              {paciente.horario_inicio} - {paciente.horario_fim}
            </div>
            <PacienteStatus paciente={paciente} sala={sala} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente PacienteCard será implementado na sequência...
function PacienteCard({ paciente, sala, onIniciarAtendimento, onExecutarRotacao, onFinalizarAtendimento, processando, expandida }: any) {
  const tempoAtualProfissional = paciente.profissional_ativo 
    ? (paciente as any)[`tempo_profissional_${paciente.profissional_ativo}`] || 0
    : 0;
  
  const tempoRestante = 30 - tempoAtualProfissional;
  const progressoAtual = (tempoAtualProfissional / 30) * 100;

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      {/* Header do Paciente */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h5 className="font-medium text-gray-900">{paciente.paciente_nome}</h5>
          <div className="text-xs text-gray-600">
            {paciente.horario_inicio} - {paciente.horario_fim}
          </div>
        </div>
        <div className="text-right">
          <PacienteStatus paciente={paciente} sala={sala} />
        </div>
      </div>

      {/* Progresso dos Profissionais */}
      {expandida && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Progresso por Profissional:</div>
          <div className="space-y-1">
            {[1, 2, 3].map(prof => {
              const tempo = (paciente as any)[`tempo_profissional_${prof}`] || 0;
              const progresso = (tempo / 30) * 100;
              const isConcluido = paciente.profissionais_concluidos.includes(prof);
              const isAtivo = paciente.profissional_ativo === prof && paciente.status === 'em_atendimento';
              
              return (
                <div key={prof} className="flex items-center gap-2">
                  <div className="w-16 text-xs">Prof. {prof}:</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isAtivo ? 'bg-blue-500 animate-pulse' : 
                        isConcluido ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(progresso, 100)}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-xs text-right">
                    {tempo}/30min
                  </div>
                  {isAtivo && (
                    <Zap className="h-3 w-3 text-blue-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Profissional Ativo */}
      {paciente.status === 'em_atendimento' && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded p-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-800">
              🔴 Profissional {paciente.profissional_ativo} ativo
            </div>
            <div className="text-sm text-blue-700">
              {tempoRestante > 0 ? `${tempoRestante}min restantes` : `${Math.abs(tempoRestante)}min excedido`}
            </div>
          </div>
          {expandida && (
            <div className="mt-2">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    tempoRestante <= 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(progressoAtual, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-2">
        {paciente.status === 'aguardando' && (
          <button
            onClick={() => onIniciarAtendimento(paciente.id, sala.sala_id)}
            disabled={processando === paciente.id || sala.profissionais_livres.length === 0}
            className="flex-1 bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 disabled:bg-gray-400 transition-all"
          >
            {processando === paciente.id ? '...' : (
              <>
                <Play className="h-3 w-3 inline mr-1" />
                Iniciar
              </>
            )}
          </button>
        )}
        
        {paciente.status === 'em_atendimento' && tempoRestante <= 0 && (
          <button
            onClick={() => onExecutarRotacao(paciente.id)}
            disabled={processando === paciente.id}
            className="flex-1 bg-orange-600 text-white text-xs px-2 py-1 rounded hover:bg-orange-700 disabled:bg-gray-400 transition-all"
          >
            {processando === paciente.id ? '...' : (
              <>
                <RotateCcw className="h-3 w-3 inline mr-1" />
                Rotacionar
              </>
            )}
          </button>
        )}
        
        {paciente.atendimento_completo && (
          <button
            onClick={() => onFinalizarAtendimento(paciente.id)}
            disabled={processando === paciente.id}
            className="flex-1 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-all"
          >
            {processando === paciente.id ? '...' : (
              <>
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Finalizar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Componente PacienteStatus
function PacienteStatus({ paciente, sala, compact = false }: any) {
  const getStatusInfo = () => {
    if (paciente.atendimento_completo) {
      return { text: 'Completo', color: 'bg-green-100 text-green-800', icon: '✅' };
    }
    
    if (paciente.status === 'em_atendimento') {
      const tempoAtual = (paciente as any)[`tempo_profissional_${paciente.profissional_ativo}`] || 0;
      const tempoRestante = 30 - tempoAtual;
      
      if (tempoRestante <= 0) {
        return { text: 'Rotação!', color: 'bg-red-100 text-red-800 animate-pulse', icon: '🚨' };
      }
      
      return { text: `Prof. ${paciente.profissional_ativo}`, color: 'bg-blue-100 text-blue-800', icon: '🔴' };
    }
    
    if (paciente.status === 'aguardando') {
      if (sala.profissionais_livres.length === 0) {
        return { text: 'Aguardando', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      }
      return { text: 'Pronto', color: 'bg-green-100 text-green-800', icon: '▶️' };
    }
    
    return { text: paciente.status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
  };

  const statusInfo = getStatusInfo();
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
      {statusInfo.icon} {statusInfo.text}
    </span>
  );
}
