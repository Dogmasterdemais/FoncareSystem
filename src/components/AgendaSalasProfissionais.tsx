import React, { useState, useEffect } from 'react';
import { Clock, User, MapPin, Play, CheckCircle, AlertCircle, Users, Timer } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useUnidade } from '../context/UnidadeContext';

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
  // Usa contexto global de unidade
}

export default function AgendaSalasProfissionais({ }: AgendaSalasProfissionaisProps) {
  const { unidadeSelecionada, unidades } = useUnidade();
  const [salas, setSalas] = useState<SalaTerapia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null);
  
  // Estados para as funcionalidades avançadas
  const [salaSelecionada, setSalaSelecionada] = useState<string | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState<PacienteTerapia | null>(null);
  const [visuMode, setVisuMode] = useState<'grid' | 'list'>('grid');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [carregando, setCarregando] = useState(true);
  const [especialidadesProfissionais, setEspecialidadesProfissionais] = useState<{[key: string]: string}>({});

  // Função para buscar especialidades dos profissionais
  const buscarEspecialidadesProfissionais = async (nomesProfissionais: string[]) => {
    try {
      // Filtrar apenas nomes válidos (não vazios e não genéricos)
      const nomesValidos = nomesProfissionais.filter(nome => 
        nome && 
        nome.trim() !== '' && 
        !nome.includes('Profissional') && 
        !nome.includes('Livre') &&
        !nome.includes('Nome não encontrado')
      );

      if (nomesValidos.length === 0) {
        console.log('⚠️ Nenhum nome válido de profissional encontrado');
        return;
      }

      console.log('🔍 Buscando especialidades para profissionais:', nomesValidos);

      // Busca usando o campo correto: cargo e status (não ativo)
      const { data: colaboradoresData, error: colaboradoresError } = await supabase
        .from('colaboradores')
        .select('id, nome_completo, cargo')
        .in('nome_completo', nomesValidos)
        .eq('status', 'ativo');

      if (colaboradoresError) {
        console.error('❌ Erro ao buscar colaboradores:', colaboradoresError);
        return;
      }

      console.log('📋 Colaboradores encontrados:', colaboradoresData);

      if (!colaboradoresData || colaboradoresData.length === 0) {
        console.log('⚠️ Nenhum colaborador ativo encontrado com esses nomes');
        return;
      }

      // Criar mapeamento nome -> cargo (especialidade)
      const novoMapeamento: {[key: string]: string} = {};
      colaboradoresData.forEach((colaborador: any) => {
        if (colaborador.cargo && colaborador.cargo.trim() !== '') {
          novoMapeamento[colaborador.nome_completo] = colaborador.cargo;
        }
      });

      console.log('✅ Mapeamento final especialidades (cargos):', novoMapeamento);
      setEspecialidadesProfissionais(prev => ({ ...prev, ...novoMapeamento }));

    } catch (error) {
      console.error('❌ Erro inesperado ao buscar especialidades:', error);
    }
  };

  // Função para obter nome da unidade selecionada
  const getNomeUnidadeSelecionada = () => {
    if (!unidadeSelecionada) return '';
    const unidade = unidades.find(u => u.id === unidadeSelecionada);
    return unidade?.nome || '';
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

  // Função para obter informações do profissional com especialidade
  const getProfissionalAtivoInfo = (paciente: PacienteTerapia) => {
    const nomeProfissional = getProfissionalAtivo(paciente);
    const especialidade = nomeProfissional ? especialidadesProfissionais[nomeProfissional] || 'Especialidade não definida' : 'Especialidade não definida';
    return {
      nome: nomeProfissional || 'Nome não encontrado',
      especialidade: especialidade
    };
  };

  // Função para formatar tempo
  const formatarTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins.toString().padStart(2, '0')}min` : `${mins.toString().padStart(2, '0')}min`;
  };

  // Função para calcular tempo decorrido da sessão
  const calcularTempoDecorrido = (paciente: PacienteTerapia) => {
    if (!paciente.sessao_iniciada_em || paciente.status !== 'em_atendimento') {
      return 0;
    }
    
    const inicio = new Date(paciente.sessao_iniciada_em);
    const agora = new Date();
    return Math.floor((agora.getTime() - inicio.getTime()) / (1000 * 60));
  };

  // Função para calcular tempo do profissional atual
  const calcularTempoProfissionalAtual = (paciente: PacienteTerapia) => {
    if (paciente.status !== 'em_atendimento') {
      return { tempoAtual: 0, tempoRestante: 0 };
    }

    const tempoDecorrido = calcularTempoDecorrido(paciente);
    
    if (paciente.tipo_sessao === 'individual') {
      return {
        tempoAtual: Math.min(tempoDecorrido, 30),
        tempoRestante: Math.max(0, 30 - tempoDecorrido)
      };
    } else if (paciente.tipo_sessao === 'compartilhada') {
      if (paciente.profissional_ativo === 1) {
        return {
          tempoAtual: Math.min(tempoDecorrido, 30),
          tempoRestante: Math.max(0, 30 - tempoDecorrido)
        };
      } else {
        return {
          tempoAtual: Math.min(tempoDecorrido - 30, 30),
          tempoRestante: Math.max(0, 60 - tempoDecorrido)
        };
      }
    } else if (paciente.tipo_sessao === 'tripla') {
      if (paciente.profissional_ativo === 1) {
        return {
          tempoAtual: Math.min(tempoDecorrido, 30),
          tempoRestante: Math.max(0, 30 - tempoDecorrido)
        };
      } else if (paciente.profissional_ativo === 2) {
        return {
          tempoAtual: Math.min(tempoDecorrido - 30, 30),
          tempoRestante: Math.max(0, 60 - tempoDecorrido)
        };
      } else {
        return {
          tempoAtual: Math.min(tempoDecorrido - 60, 30),
          tempoRestante: Math.max(0, 90 - tempoDecorrido)
        };
      }
    }
    
    return { tempoAtual: 0, tempoRestante: 0 };
  };

  // Função para obter cor do progresso baseada no tempo
  const getCorProgresso = (tempoAtual: number, tempoRestante: number) => {
    const totalTempo = tempoAtual + tempoRestante;
    if (totalTempo === 0) return 'bg-gray-200';
    
    const percentual = (tempoAtual / totalTempo) * 100;
    
    if (percentual < 25) return 'bg-green-500';
    if (percentual < 50) return 'bg-yellow-500';
    if (percentual < 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Função para renderizar conteúdo condicionalmente
  const renderConteudo = () => {
    const salasParaExibir = salaSelecionada 
      ? salas.filter(sala => sala.sala_id === salaSelecionada)
      : salas;

    if (visuMode === 'list') {
      return (
        <div className="grid grid-cols-1 gap-6">
          {salasParaExibir.map((sala) => (
            <div key={sala.sala_id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header da sala em lista */}
              <div 
                className="p-6 border-b border-gray-100"
                style={{ 
                  background: `linear-gradient(135deg, ${sala.sala_cor || '#E5E7EB'}15, ${sala.sala_cor || '#E5E7EB'}05)`,
                  borderLeft: `4px solid ${sala.sala_cor || '#E5E7EB'}`
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      Sala {sala.sala_numero} - {sala.sala_nome}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {sala.pacientes.length} pacientes agendados
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">{sala.ocupacao_atual}/{sala.capacidade_maxima}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profissionais */}
                  <div className="lg:col-span-1">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Profissionais
                    </h4>
                    <div className="space-y-2">
                      <div className={`p-3 rounded-lg ${
                        sala.profissionais_ativos.profissional_1 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}>
                        <div className="font-semibold text-xs">Prof. 1</div>
                        <div className="text-sm">{sala.profissionais_ativos.profissional_1 || 'Livre'}</div>
                        {sala.profissionais_ativos.profissional_1 && especialidadesProfissionais[sala.profissionais_ativos.profissional_1] && (
                          <div className="text-xs text-emerald-600 mt-1">
                            {especialidadesProfissionais[sala.profissionais_ativos.profissional_1]}
                          </div>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        sala.profissionais_ativos.profissional_2 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}>
                        <div className="font-semibold text-xs">Prof. 2</div>
                        <div className="text-sm">{sala.profissionais_ativos.profissional_2 || 'Livre'}</div>
                        {sala.profissionais_ativos.profissional_2 && especialidadesProfissionais[sala.profissionais_ativos.profissional_2] && (
                          <div className="text-xs text-emerald-600 mt-1">
                            {especialidadesProfissionais[sala.profissionais_ativos.profissional_2]}
                          </div>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        sala.profissionais_ativos.profissional_3 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}>
                        <div className="font-semibold text-xs">Prof. 3</div>
                        <div className="text-sm">{sala.profissionais_ativos.profissional_3 || 'Livre'}</div>
                        {sala.profissionais_ativos.profissional_3 && especialidadesProfissionais[sala.profissionais_ativos.profissional_3] && (
                          <div className="text-xs text-emerald-600 mt-1">
                            {especialidadesProfissionais[sala.profissionais_ativos.profissional_3]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pacientes */}
                  <div className="lg:col-span-2">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Pacientes
                    </h4>
                    {sala.pacientes.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                          <User className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-500">Nenhum agendamento hoje</p>
                        <p className="text-xs text-gray-400 mt-1">Sala disponível para uso</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sala.pacientes.map((paciente) => {
                          const profissionalInfo = getProfissionalAtivoInfo(paciente);
                          const { tempoAtual, tempoRestante } = calcularTempoProfissionalAtual(paciente);
                          const totalTempo = tempoAtual + tempoRestante;
                          const percentual = totalTempo > 0 ? (tempoAtual / totalTempo) * 100 : 0;
                          
                          return (
                            <div
                              key={paciente.id}
                              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                                (paciente as any).proximo_do_horario 
                                  ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                                  : 'border-gray-200 bg-white hover:bg-gray-50'
                              }`}
                              onClick={() => setModalDetalhes(paciente)}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 mb-1">
                                    {paciente.paciente_nome}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {paciente.status === 'em_atendimento' 
                                      ? `🎯 ${getProfissionalAtivo(paciente)}`
                                      : `Prof: ${profissionalInfo.nome}`
                                    }
                                  </p>
                                  <p className="text-xs text-blue-600 font-medium">
                                    {profissionalInfo.especialidade}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {paciente.horario_inicio} - {paciente.horario_fim}
                                  </p>
                                </div>
                              </div>

                              {/* Barra de Progresso - apenas se em atendimento */}
                              {paciente.status === 'em_atendimento' && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span className="flex items-center">
                                      <Timer className="h-3 w-3 mr-1" />
                                      {paciente.tipo_sessao} 
                                    </span>
                                    <span className="font-semibold">
                                      Prof. {paciente.profissional_ativo}/
                                      {paciente.tipo_sessao === 'individual' ? '1' : 
                                       paciente.tipo_sessao === 'compartilhada' ? '2' : '3'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-300 ${getCorProgresso(tempoAtual, tempoRestante)}`}
                                      style={{ width: `${Math.min(percentual, 100)}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-green-700">
                                      ✓ {formatarTempo(tempoAtual)}
                                    </span>
                                    <span className="text-blue-700">
                                      ⏳ {formatarTempo(tempoRestante)}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paciente.status)}`}>
                                  {getStatusText(paciente.status)}
                                </span>
                                
                                {paciente.status !== 'em_atendimento' && (
                                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {formatarTempo(paciente.tempo_restante_minutos || 0)} restantes
                                  </p>
                                )}
                                
                                {paciente.status === 'em_atendimento' && (paciente.tipo_sessao === 'compartilhada' || paciente.tipo_sessao === 'tripla') && (
                                  <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                    🔄 Rotação
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`grid gap-6 ${salaSelecionada ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {salasParaExibir.map((sala) => (
          <div key={sala.sala_id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Header da Sala com cor mais discreta */}
            <div 
              className="p-4 border-b border-gray-100 relative"
              style={{ 
                background: `linear-gradient(135deg, ${sala.sala_cor || '#E5E7EB'}20, ${sala.sala_cor || '#E5E7EB'}10)`,
                borderLeft: `4px solid ${sala.sala_cor || '#E5E7EB'}`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Sala {sala.sala_numero}</h3>
                  <p className="text-sm text-gray-600 font-medium">{sala.sala_nome}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{sala.ocupacao_atual}/{sala.capacidade_maxima}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Profissionais com design melhorado */}
            <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Profissionais na Sala
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`p-3 rounded-lg transition-all ${
                  sala.profissionais_ativos.profissional_1 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' 
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}>
                  <div className="font-semibold mb-1">Prof. 1</div>
                  <div className="truncate text-xs leading-tight">
                    {sala.profissionais_ativos.profissional_1 || 'Livre'}
                  </div>
                  {sala.profissionais_ativos.profissional_1 && especialidadesProfissionais[sala.profissionais_ativos.profissional_1] && (
                    <div className="text-xs text-emerald-600 mt-1 font-medium">
                      {especialidadesProfissionais[sala.profissionais_ativos.profissional_1]}
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg transition-all ${
                  sala.profissionais_ativos.profissional_2 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' 
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}>
                  <div className="font-semibold mb-1">Prof. 2</div>
                  <div className="truncate text-xs leading-tight">
                    {sala.profissionais_ativos.profissional_2 || 'Livre'}
                  </div>
                  {sala.profissionais_ativos.profissional_2 && especialidadesProfissionais[sala.profissionais_ativos.profissional_2] && (
                    <div className="text-xs text-emerald-600 mt-1 font-medium">
                      {especialidadesProfissionais[sala.profissionais_ativos.profissional_2]}
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg transition-all ${
                  sala.profissionais_ativos.profissional_3 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' 
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}>
                  <div className="font-semibold mb-1">Prof. 3</div>
                  <div className="truncate text-xs leading-tight">
                    {sala.profissionais_ativos.profissional_3 || 'Livre'}
                  </div>
                  {sala.profissionais_ativos.profissional_3 && especialidadesProfissionais[sala.profissionais_ativos.profissional_3] && (
                    <div className="text-xs text-emerald-600 mt-1 font-medium">
                      {especialidadesProfissionais[sala.profissionais_ativos.profissional_3]}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pacientes na sala com layout melhorado */}
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Pacientes
                </div>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  {sala.pacientes.length}
                </span>
              </h4>
              
              {sala.pacientes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-500">Nenhum agendamento hoje</p>
                  <p className="text-xs text-gray-400 mt-1">Sala disponível para uso</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sala.pacientes.map((paciente) => (
                    <div
                      key={paciente.id}
                      className={`p-4 border rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer group ${
                        (paciente as any).proximo_do_horario 
                          ? 'border-blue-300 bg-blue-50/50 hover:bg-blue-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setModalDetalhes(paciente)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {paciente.paciente_nome}
                        </h5>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{paciente.horario_inicio}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border-2 ${getStatusColor(paciente.status)}`}>
                          {getStatusIcon(paciente.status)}
                          <span className="ml-1">{getStatusText(paciente.status)}</span>
                        </div>
                        
                        {paciente.status === 'pronto_para_terapia' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              atualizarStatusAgendamento(paciente.id, 'em_atendimento');
                            }}
                            disabled={atualizandoStatus === paciente.id}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                          >
                            {atualizandoStatus === paciente.id ? 'Iniciando...' : 'Iniciar'}
                          </button>
                        )}
                        
                        {paciente.status === 'em_atendimento' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              atualizarStatusAgendamento(paciente.id, 'concluido');
                            }}
                            disabled={atualizandoStatus === paciente.id}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                          >
                            {atualizandoStatus === paciente.id ? 'Concluindo...' : 'Concluir'}
                          </button>
                        )}
                      </div>
                      
                      {paciente.profissional_nome && (
                        <div className="mt-2 space-y-2">
                          {/* Informações do Profissional Atual */}
                          <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="font-medium">
                              {paciente.status === 'em_atendimento' 
                                ? `${getProfissionalAtivo(paciente)}`
                                : `Prof: ${paciente.profissional_nome}`
                              }
                            </span>
                            {(() => {
                              const nomeProfAtual = paciente.status === 'em_atendimento' 
                                ? getProfissionalAtivo(paciente) 
                                : paciente.profissional_nome;
                              return nomeProfAtual && especialidadesProfissionais[nomeProfAtual] && (
                                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                  {especialidadesProfissionais[nomeProfAtual]}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Indicador de Progresso da Sessão - apenas se em atendimento */}
                          {paciente.status === 'em_atendimento' && (() => {
                            const { tempoAtual, tempoRestante } = calcularTempoProfissionalAtual(paciente);
                            const totalTempo = tempoAtual + tempoRestante;
                            const percentual = totalTempo > 0 ? (tempoAtual / totalTempo) * 100 : 0;
                            
                            return (
                              <div className="bg-gray-50 p-2 rounded-lg">
                                {/* Barra de Progresso */}
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span className="flex items-center">
                                    <Timer className="h-3 w-3 mr-1" />
                                    Sessão {paciente.tipo_sessao}
                                  </span>
                                  <span className="font-semibold">
                                    Prof. {paciente.profissional_ativo}/
                                    {paciente.tipo_sessao === 'individual' ? '1' : 
                                     paciente.tipo_sessao === 'compartilhada' ? '2' : '3'}
                                  </span>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getCorProgresso(tempoAtual, tempoRestante)}`}
                                    style={{ width: `${Math.min(percentual, 100)}%` }}
                                  ></div>
                                </div>
                                
                                <div className="flex justify-between text-xs">
                                  <span className="text-green-700 font-medium">
                                    ✓ {formatarTempo(tempoAtual)} realizado
                                  </span>
                                  <span className="text-blue-700 font-medium">
                                    ⏳ {formatarTempo(tempoRestante)} restante
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Informações de Rotação para sessões múltiplas - apenas se em atendimento */}
                          {paciente.status === 'em_atendimento' && (paciente.tipo_sessao === 'compartilhada' || paciente.tipo_sessao === 'tripla') && (
                            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                              <div className="text-xs text-blue-800 font-medium mb-1">
                                🔄 Sequência de Profissionais:
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex space-x-1">
                                  <span className={`px-2 py-1 rounded-full ${paciente.profissional_ativo === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    1º {paciente.profissional_nome?.split(' ')[0] || 'Prof1'}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full ${paciente.profissional_ativo === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    2º {paciente.profissional_2_nome?.split(' ')[0] || 'Prof2'}
                                  </span>
                                  {paciente.tipo_sessao === 'tripla' && (
                                    <span className={`px-2 py-1 rounded-full ${paciente.profissional_ativo === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                      3º {paciente.profissional_3_nome?.split(' ')[0] || 'Prof3'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderização do modal de detalhes
  const renderModalDetalhes = () => {
    if (!modalDetalhes) return null;

    const profissionalInfo = getProfissionalAtivoInfo(modalDetalhes);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
          {/* Header do modal */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  📋
                </div>
                Detalhes do Agendamento
              </h3>
              <button
                onClick={() => setModalDetalhes(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Conteúdo do modal */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Paciente
                </label>
                <p className="text-lg font-medium text-gray-900">{modalDetalhes.paciente_nome}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👨‍⚕️ Profissional {modalDetalhes.status === 'em_atendimento' ? 'Ativo' : 'Responsável'}
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {modalDetalhes.status === 'em_atendimento' 
                    ? getProfissionalAtivo(modalDetalhes)
                    : profissionalInfo.nome
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-lg inline-block">
                  {modalDetalhes.status === 'em_atendimento' 
                    ? (() => {
                        const nomeProfAtual = getProfissionalAtivo(modalDetalhes);
                        return (nomeProfAtual && especialidadesProfissionais[nomeProfAtual]) || 'Especialidade não definida';
                      })()
                    : profissionalInfo.especialidade
                  }
                </p>
                
                {/* Informações de Progresso da Sessão */}
                {modalDetalhes.status === 'em_atendimento' && (() => {
                  const { tempoAtual, tempoRestante } = calcularTempoProfissionalAtual(modalDetalhes);
                  const totalTempo = tempoAtual + tempoRestante;
                  const percentual = totalTempo > 0 ? (tempoAtual / totalTempo) * 100 : 0;
                  
                  return (
                    <div className="mt-3 bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                        <span className="flex items-center font-medium">
                          <Timer className="h-4 w-4 mr-1" />
                          Progresso da Sessão
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                          Profissional {modalDetalhes.profissional_ativo} de {
                            modalDetalhes.tipo_sessao === 'individual' ? '1' : 
                            modalDetalhes.tipo_sessao === 'compartilhada' ? '2' : '3'
                          }
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${getCorProgresso(tempoAtual, tempoRestante)}`}
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 font-medium">
                          ✅ {formatarTempo(tempoAtual)} realizado
                        </span>
                        <span className="text-blue-700 font-medium">
                          ⏳ {formatarTempo(tempoRestante)} restante
                        </span>
                      </div>
                      
                      {tempoRestante <= 5 && tempoRestante > 0 && (
                        <div className="mt-2 bg-orange-100 border border-orange-200 p-2 rounded-lg">
                          <p className="text-orange-800 text-xs font-medium">
                            ⚠️ Transição próxima! Menos de 5 minutos restantes
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🕐 Horário
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {modalDetalhes.horario_inicio}
                  </p>
                  <p className="text-sm text-gray-600">
                    até {modalDetalhes.horario_fim}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📊 Status
                  </label>
                  <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(modalDetalhes.status)}`}>
                    {getStatusText(modalDetalhes.status)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⏱️ Tempo Restante
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {formatarTempo(modalDetalhes.tempo_restante_minutos || 0)}
                </p>
              </div>

              {(modalDetalhes as any).tipo_sessao !== 'individual' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-800 mb-3 flex items-center">
                    <div className="bg-blue-200 p-1 rounded-full mr-2">
                      <Users className="h-4 w-4 text-blue-700" />
                    </div>
                    Sessão {(modalDetalhes as any).tipo_sessao.charAt(0).toUpperCase() + (modalDetalhes as any).tipo_sessao.slice(1)}
                  </label>
                  
                  {/* Timeline de Profissionais */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        modalDetalhes.profissional_ativo === 1 
                          ? 'bg-blue-500 text-white' 
                          : modalDetalhes.status === 'em_atendimento' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                      }`}>
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {modalDetalhes.profissional_nome || 'Profissional 1'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {especialidadesProfissionais[modalDetalhes.profissional_nome] || 'Especialidade não definida'}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">0-30 minutos</p>
                      </div>
                      {modalDetalhes.profissional_ativo === 1 && modalDetalhes.status === 'em_atendimento' && (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          🎯 Ativo
                        </span>
                      )}
                      {modalDetalhes.profissional_ativo > 1 && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ✅ Concluído
                        </span>
                      )}
                    </div>

                    {(modalDetalhes as any).profissional_2_nome && (
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          modalDetalhes.profissional_ativo === 2 
                            ? 'bg-blue-500 text-white' 
                            : modalDetalhes.profissional_ativo > 2 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                        }`}>
                          2
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {(modalDetalhes as any).profissional_2_nome}
                          </p>
                          <p className="text-xs text-gray-600">
                            {especialidadesProfissionais[(modalDetalhes as any).profissional_2_nome] || 'Especialidade não definida'}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">30-60 minutos</p>
                        </div>
                        {modalDetalhes.profissional_ativo === 2 && modalDetalhes.status === 'em_atendimento' && (
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            🎯 Ativo
                          </span>
                        )}
                        {modalDetalhes.profissional_ativo > 2 && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            ✅ Concluído
                          </span>
                        )}
                      </div>
                    )}

                    {(modalDetalhes as any).profissional_3_nome && (
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          modalDetalhes.profissional_ativo === 3 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          3
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {(modalDetalhes as any).profissional_3_nome}
                          </p>
                          <p className="text-xs text-gray-600">
                            {especialidadesProfissionais[(modalDetalhes as any).profissional_3_nome] || 'Especialidade não definida'}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">60-90 minutos</p>
                        </div>
                        {modalDetalhes.profissional_ativo === 3 && modalDetalhes.status === 'em_atendimento' && (
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            🎯 Ativo
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Informações sobre Rotação Automática */}
                  {modalDetalhes.status === 'em_atendimento' && (
                    <div className="mt-3 bg-white p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        🔄 Sistema de Rotação Automática Ativo
                      </p>
                      <p className="text-xs text-blue-600">
                        A transição entre profissionais acontece automaticamente a cada 30 minutos.
                        O sistema monitora o progresso e faz a mudança no momento adequado.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer do modal */}
          <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <button
              onClick={() => setModalDetalhes(null)}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-all font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Buscar dados organizados por sala
  const buscarDadosSalas = async () => {
    try {
      console.log('🚀 Iniciando buscarDadosSalas...');
      
      // Primeiro executar processamento automático de transições (opcional)
      try {
        // CORREÇÃO: Implementar lógica de 30 minutos localmente 
        // em vez de depender da função RPC que está com problemas
        console.log('⏰ Implementando verificação de 30 minutos local...');
        
        // Buscar agendamentos em atendimento para verificar rotação
        const { data: agendamentosAtivos, error: errorAtivos } = await supabase
          .from('agendamentos')
          .select('id, sessao_iniciada_em, profissional_ativo, tipo_sessao, profissional_1_id, profissional_2_id, profissional_3_id')
          .eq('status', 'em_atendimento')
          .not('sessao_iniciada_em', 'is', null);
        
        if (!errorAtivos && agendamentosAtivos && agendamentosAtivos.length > 0) {
          console.log(`⏰ Verificando ${agendamentosAtivos.length} sessões ativas para rotação de 30 minutos...`);
          
          const agora = new Date();
          let rotacoesRealizadas = 0;
          
          for (const agendamento of agendamentosAtivos) {
            const inicioSessao = new Date(agendamento.sessao_iniciada_em);
            const minutosDecorridos = Math.floor((agora.getTime() - inicioSessao.getTime()) / (1000 * 60));
            
            console.log(`⏰ Agendamento ${agendamento.id}: ${minutosDecorridos} minutos decorridos`);
            
            // Verificar se precisa rotacionar
            let novoProfissionalAtivo = agendamento.profissional_ativo;
            
            if (agendamento.tipo_sessao === 'compartilhada' && minutosDecorridos >= 30 && agendamento.profissional_ativo === 1) {
              novoProfissionalAtivo = 2;
            } else if (agendamento.tipo_sessao === 'tripla') {
              if (minutosDecorridos >= 60 && agendamento.profissional_ativo !== 3) {
                novoProfissionalAtivo = 3;
              } else if (minutosDecorridos >= 30 && agendamento.profissional_ativo === 1) {
                novoProfissionalAtivo = 2;
              }
            }
            
            // Aplicar rotação se necessário
            if (novoProfissionalAtivo !== agendamento.profissional_ativo) {
              console.log(`🔄 Rotacionando agendamento ${agendamento.id}: Prof ${agendamento.profissional_ativo} → Prof ${novoProfissionalAtivo}`);
              
              const { error: updateError } = await supabase
                .from('agendamentos')
                .update({ 
                  profissional_ativo: novoProfissionalAtivo,
                  updated_at: new Date().toISOString()
                })
                .eq('id', agendamento.id);
              
              if (!updateError) {
                rotacoesRealizadas++;
              } else {
                console.error('❌ Erro ao rotacionar:', updateError);
              }
            }
          }
          
          console.log(`✅ Processamento de 30 minutos concluído: ${rotacoesRealizadas} rotações realizadas`);
        } else {
          console.log('ℹ️ Nenhuma sessão ativa encontrada para rotação');
        }
        
      } catch (rpcError) {
        console.warn('⚠️ Processamento automático de 30 minutos falhou (continuando):', rpcError);
      }
      
      // CORREÇÃO: Buscar agendamentos do dia todo, não apenas do horário próximo
      const agora = new Date();
      const dataHoje = agora.toISOString().split('T')[0]; // YYYY-MM-DD
      const horaAtual = agora.getHours();
      const minutoAtual = agora.getMinutes();
      const horarioAtual = `${horaAtual.toString().padStart(2, '0')}:${minutoAtual.toString().padStart(2, '0')}:00`;

      console.log(`📅 Buscando agendamentos para: ${dataHoje}, unidade: ${unidadeSelecionada || 'TODAS'}`);

      // Tentar buscar agendamentos da view primeiro
      let agendamentosData: any[] = [];
      let agendamentosError: any = null;

      try {
        // Primeira tentativa: usar a view com campos de automação
        let queryAgendamentos = supabase
          .from('vw_agendamentos_completo')
          .select(`
            *,
            sessao_iniciada_em,
            profissional_ativo,
            tipo_sessao,
            tempo_profissional_1,
            tempo_profissional_2,
            tempo_profissional_3,
            profissional_2_nome,
            profissional_3_nome
          `)
          .eq('data_agendamento', dataHoje)
          .in('status', ['agendado', 'pronto_para_terapia', 'em_atendimento']);

        if (unidadeSelecionada && unidadeSelecionada.trim() !== '') {
          queryAgendamentos = queryAgendamentos.eq('unidade_id', unidadeSelecionada);
        }

        const result = await queryAgendamentos.order('sala_numero').order('horario_inicio');
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        agendamentosData = result.data || [];
        console.log('✅ Dados obtidos da view vw_agendamentos_completo');

      } catch (viewError) {
        console.warn('⚠️ View vw_agendamentos_completo falhou, tentando query direta:', viewError);

        // Segunda tentativa: query direta com campos de automação
        let queryDireta = supabase
          .from('agendamentos')
          .select(`
            id,
            paciente_nome,
            horario_inicio,
            horario_fim,
            status,
            data_agendamento,
            sala_id,
            profissional_id,
            sessao_iniciada_em,
            profissional_ativo,
            tipo_sessao,
            tempo_profissional_1,
            tempo_profissional_2,
            tempo_profissional_3,
            profissional_1_id,
            profissional_2_id,
            profissional_3_id,
            salas(
              id,
              numero,
              nome,
              cor,
              unidade_id,
              unidades(
                nome
              )
            ),
            profissionais(
              id,
              nome,
              especialidades(
                nome,
                cor
              )
            ),
            colaboradores!profissional_1_id(nome_completo, cargo),
            colaboradores_2:colaboradores!profissional_2_id(nome_completo, cargo),
            colaboradores_3:colaboradores!profissional_3_id(nome_completo, cargo)
          `)
          .eq('data_agendamento', dataHoje)
          .in('status', ['agendado', 'pronto_para_terapia', 'em_atendimento']);

        if (unidadeSelecionada && unidadeSelecionada.trim() !== '') {
          queryDireta = queryDireta.eq('salas.unidade_id', unidadeSelecionada);
        }

        const resultDireto = await queryDireta.order('salas.numero').order('horario_inicio');
        
        if (resultDireto.error) {
          throw new Error(`Erro na query direta: ${resultDireto.error.message}`);
        }

        agendamentosData = resultDireto.data || [];
        console.log('✅ Dados obtidos da query direta de agendamentos');

        // Transformar dados da query direta para formato da view
        agendamentosData = agendamentosData.map((agendamento: any) => ({
          id: agendamento.id,
          paciente_nome: agendamento.paciente_nome,
          horario_inicio: agendamento.horario_inicio,
          horario_fim: agendamento.horario_fim,
          status: agendamento.status,
          data_agendamento: agendamento.data_agendamento,
          sala_id: agendamento.sala_id,
          sala_numero: agendamento.salas?.numero,
          sala_nome: agendamento.salas?.nome,
          sala_cor: agendamento.salas?.cor,
          unidade_id: agendamento.salas?.unidade_id,
          unidade_nome: agendamento.salas?.unidades?.nome,
          profissional_id: agendamento.profissional_id,
          profissional_nome: agendamento.colaboradores?.nome_completo || agendamento.profissionais?.nome,
          profissional_2_nome: agendamento.colaboradores_2?.nome_completo,
          profissional_3_nome: agendamento.colaboradores_3?.nome_completo,
          especialidade_nome: agendamento.profissionais?.especialidades?.[0]?.nome,
          especialidade_cor: agendamento.profissionais?.especialidades?.[0]?.cor,
          status_dinamico: agendamento.status,
          // CAMPOS DE AUTOMAÇÃO - CRÍTICOS!
          sessao_iniciada_em: agendamento.sessao_iniciada_em,
          profissional_ativo: agendamento.profissional_ativo || 1,
          tipo_sessao: agendamento.tipo_sessao || 'individual',
          tempo_profissional_1: agendamento.tempo_profissional_1 || 0,
          tempo_profissional_2: agendamento.tempo_profissional_2 || 0,
          tempo_profissional_3: agendamento.tempo_profissional_3 || 0,
          profissional_1_id: agendamento.profissional_1_id,
          profissional_2_id: agendamento.profissional_2_id,
          profissional_3_id: agendamento.profissional_3_id,
          // Campos calculados
          tempo_sessao_atual: 0,
          tempo_restante_minutos: 0,
          // NOVA REGRA DE DURAÇÃO: 90 min para terapias, flexível para anamnese/neuropsicologia
          duracao_planejada: (() => {
            const salaNome = agendamento.salas?.nome || '';
            // Para Anamnese e Neuropsicologia: duração flexível
            if (salaNome.toLowerCase().includes('anamnese') || 
                salaNome.toLowerCase().includes('neuropsicolog')) {
              return agendamento.tipo_sessao === 'tripla' ? 90 : 
                     agendamento.tipo_sessao === 'compartilhada' ? 60 : 30;
            }
            // Para todas as outras salas de terapia: 90 minutos fixo
            return 90;
          })(),
          proxima_acao: 'aguardando'
        }));
      }

      console.log(`🔍 Agenda Salas Principal: Encontrados ${agendamentosData?.length || 0} agendamentos relevantes para hoje (${dataHoje})`);
      console.log('📋 Agendamentos encontrados:', agendamentosData);

      // Buscar TODAS as salas da unidade (mesmo sem agendamentos)
      console.log('🏢 Buscando salas...');
      let querySalas = supabase
        .from('salas')
        .select(`
          id,
          numero,
          nome,
          cor,
          unidade_id,
          ativo,
          unidades(
            nome
          )
        `)
        .eq('ativo', true);

      if (unidadeSelecionada && unidadeSelecionada.trim() !== '') {
        querySalas = querySalas.eq('unidade_id', unidadeSelecionada);
      }

      const { data: salasData, error: salasError } = await querySalas.order('numero');

      if (salasError) {
        throw new Error(`Erro ao buscar salas: ${salasError.message}`);
      }

      console.log(`🏢 Encontradas ${salasData?.length || 0} salas`);
      console.log('🏢 Salas encontradas:', salasData);

      // PRIMEIRO: Criar mapa de salas (incluindo vazias)
      const salasMap = new Map<string, SalaTerapia>();
      
      console.log('🏗️ Criando entradas para todas as salas...');
      salasData?.forEach((sala: any) => {
        const salaKey = sala.id;
        salasMap.set(salaKey, {
          sala_id: sala.id,
          sala_nome: sala.nome,
          sala_numero: sala.numero,
          sala_cor: sala.cor || '#E5E7EB',
          unidade_nome: sala.unidades?.nome || 'Unidade não definida',
          pacientes: [],
          profissionais_ativos: {},
          capacidade_maxima: 6,
          ocupacao_atual: 0
        });
      });
      
      console.log(`🏢 Criadas ${salasMap.size} salas (incluindo vazias)`);
      
      // Função auxiliar para processar profissionais
      const processarProfissionaisSalas = (profissionaisSalas: any[]) => {
        console.log(`👨‍⚕️ Processando ${profissionaisSalas?.length || 0} profissionais alocados`);
        console.log('👨‍⚕️ Dados dos profissionais:', profissionaisSalas);
        
        // Agrupar profissionais por sala
        const profissionaisPorSala = new Map<string, any[]>();
        profissionaisSalas?.forEach((ps: any) => {
          if (!profissionaisPorSala.has(ps.sala_id)) {
            profissionaisPorSala.set(ps.sala_id, []);
          }
          profissionaisPorSala.get(ps.sala_id)?.push(ps);
        });
        
        console.log(`👨‍⚕️ Profissionais agrupados por ${profissionaisPorSala.size} salas`);
        
        // Aplicar profissionais às salas
        profissionaisPorSala.forEach((profissionais, salaId) => {
          const sala = salasMap.get(salaId);
          if (sala) {
            console.log(`👨‍⚕️ Processando sala ${sala.sala_numero} com ${profissionais.length} profissionais`);
            
            // Alocar até 3 profissionais por sala
            profissionais.slice(0, 3).forEach((ps: any, index: number) => {
              const posicaoProf = `profissional_${index + 1}` as keyof typeof sala.profissionais_ativos;
              
              // CORREÇÃO: Buscar nome em diferentes estruturas
              let nomeProfissional = 'Nome não encontrado';
              if (ps.nome) {
                nomeProfissional = ps.nome;
              } else if (ps.profissional_nome) {
                nomeProfissional = ps.profissional_nome;
              } else if (ps.profissionais?.nome) {
                nomeProfissional = ps.profissionais.nome;
              }
              
              console.log(`👨‍⚕️ DEBUG: Estrutura do profissional:`, JSON.stringify(ps, null, 2));
              console.log(`👨‍⚕️ DEBUG: Propriedades disponíveis:`, Object.keys(ps));
              console.log(`👨‍⚕️ Nome extraído: ${nomeProfissional}`);
              
              sala.profissionais_ativos[posicaoProf] = nomeProfissional;
              
              console.log(`👨‍⚕️ Sala ${sala.sala_numero}: ${nomeProfissional} alocado como Prof. ${index + 1}`);
            });
          } else {
            console.warn(`⚠️ Sala ${salaId} não encontrada no mapa de salas`);
          }
        });
        
        console.log(`✅ Profissionais aplicados às salas:`);
        salasMap.forEach((sala, salaId) => {
          const profs = Object.values(sala.profissionais_ativos).filter(p => p).length;
          if (profs > 0) {
            console.log(`  Sala ${sala.sala_numero}: ${profs} profissionais alocados`);
          }
        });
      };
      
      // BUSCAR PROFISSIONAIS ALOCADOS NAS SALAS
      console.log('👨‍⚕️ Buscando profissionais alocados nas salas...');
      console.log(`📅 Data de referência: ${dataHoje}`);
      console.log(`🏢 Unidade selecionada: ${unidadeSelecionada || 'TODAS'}`);
      
      try {
        // CORREÇÃO: Usar busca direta em colaboradores em vez de profissionais
        // pois identificamos que a tabela profissionais não tem os dados corretos
        
        console.log('� Buscando profissionais alocados via colaboradores...');
        const { data: profissionaisSalasSimples, error: errorSimples } = await supabase
          .from('profissionais_salas')
          .select('sala_id, profissional_id, turno')
          .eq('ativo', true)
          .lte('data_inicio', dataHoje)
          .or(`data_fim.is.null,data_fim.gte.${dataHoje}`);
        
        if (errorSimples) {
          console.error('❌ Erro ao buscar profissionais_salas:', errorSimples);
        } else {
          console.log(`👨‍⚕️ Encontrados ${profissionaisSalasSimples?.length || 0} registros de alocação`);
          
          if (profissionaisSalasSimples && profissionaisSalasSimples.length > 0) {
            // CORREÇÃO: Buscar em colaboradores em vez de profissionais
            const profissionalIds = profissionaisSalasSimples.map(ps => ps.profissional_id);
            console.log(`👨‍⚕️ IDs para buscar em colaboradores:`, profissionalIds);
            
            const { data: colaboradores, error: colaboradoresError } = await supabase
              .from('colaboradores')
              .select('id, nome_completo, cargo')
              .in('id', profissionalIds)
              .eq('status', 'ativo');
            
            if (colaboradoresError) {
              console.error('❌ Erro ao buscar colaboradores:', colaboradoresError);
            } else {
              console.log(`👨‍⚕️ Colaboradores encontrados: ${colaboradores?.length || 0}`);
              console.log('👨‍⚕️ Dados dos colaboradores:', colaboradores);
            }
            
            // Combinar dados usando colaboradores
            const profissionaisCombinados = profissionaisSalasSimples.map(ps => {
              const colaborador = colaboradores?.find(c => c.id === ps.profissional_id);
              return {
                ...ps,
                nome: colaborador?.nome_completo || 'Nome não encontrado',
                profissional_nome: colaborador?.nome_completo || 'Nome não encontrado',
                cargo: colaborador?.cargo || 'Cargo não definido'
              };
            });
            
            console.log(`👨‍⚕️ Dados combinados finais (colaboradores):`, profissionaisCombinados);
            processarProfissionaisSalas(profissionaisCombinados);
          } else {
            console.log('⚠️ Nenhum profissional alocado encontrado na tabela profissionais_salas');
          }
        }
      } catch (error) {
        console.error('❌ Erro inesperado ao buscar profissionais:', error);
      }
      
      // DEPOIS: Adicionar agendamentos às salas correspondentes
      console.log('📅 Adicionando agendamentos às salas...');
      agendamentosData?.forEach((agendamento: any) => {
        const salaKey = agendamento.sala_id;
        
        // Calcular se está próximo do horário atual (para destacar visualmente)
        const horarioAgendamento = agendamento.horario_inicio;
        const horaAgendamento = parseInt(horarioAgendamento.split(':')[0]);
        const minutoAgendamento = parseInt(horarioAgendamento.split(':')[1]);
        
        const agendamentoMinutos = horaAgendamento * 60 + minutoAgendamento;
        const atualMinutos = horaAtual * 60 + minutoAtual;
        const diferencaMinutos = Math.abs(agendamentoMinutos - atualMinutos);
        
        // Marcar se está próximo do horário (para destacar na UI)
        const proximoDoHorario = diferencaMinutos <= 30;
        
        // Buscar a sala (que já foi criada)
        const sala = salasMap.get(salaKey);
        if (sala) {
          // Adicionar informação se está próximo do horário
          const agendamentoComProximidade = {
            ...agendamento,
            proximo_do_horario: proximoDoHorario
          };
          
          console.log(`➕ Adicionando agendamento: ${agendamento.paciente_nome} - Sala ${agendamento.sala_numero} - ${agendamento.horario_inicio} - Prof: ${agendamento.profissional_nome || 'SEM PROF'}`);
          
          sala.pacientes.push(agendamentoComProximidade);
            
          // Contar ocupação atual (pacientes em atendimento)
          if (agendamento.status === 'em_atendimento') {
            sala.ocupacao_atual += 1;
          }

          // CORREÇÃO: NÃO sobrescrever profissionais_ativos vindos de profissionais_salas
          // Os profissionais alocados já foram definidos na função processarProfissionaisSalas
          // e não devem ser alterados pelos agendamentos individuais
          console.log(`📌 Mantendo profissionais alocados da sala ${sala.sala_numero}: ${Object.values(sala.profissionais_ativos).filter(p => p).length} profissionais`);
        } else {
          console.warn(`⚠️ Agendamento para sala inexistente: ${salaKey}`);
        }
      });

      const salasArray = Array.from(salasMap.values());
      console.log(`🏢 Total de salas na agenda: ${salasArray.length}`);
      salasArray.forEach(sala => {
        const status = sala.pacientes.length > 0 ? `${sala.pacientes.length} pacientes` : 'VAZIA';
        console.log(`  Sala ${sala.sala_numero}: ${status}`);
      });

      setSalas(salasArray);
      setLoading(false);
      console.log('✅ buscarDadosSalas concluída com sucesso');

    } catch (error: any) {
      console.error('❌ Erro em buscarDadosSalas:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Atualizar status do agendamento
  const atualizarStatusAgendamento = async (agendamentoId: string, novoStatus: string) => {
    try {
      setAtualizandoStatus(agendamentoId);
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', agendamentoId);

      if (error) {
        throw error;
      }

      // Recarregar dados após atualização
      await buscarDadosSalas();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do agendamento');
    } finally {
      setAtualizandoStatus(null);
    }
  };

  // useEffect para carregar dados e configurar auto-refresh
  useEffect(() => {
    console.log('🔄 AgendaSalasProfissionais: useEffect executado - buscando dados...');
    buscarDadosSalas();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Recarregamento automático (30s)');
      buscarDadosSalas();
    }, 30000);

    return () => clearInterval(interval);
  }, [unidadeSelecionada]);

  // useEffect para buscar especialidades quando salas são carregadas
  useEffect(() => {
    if (salas.length > 0) {
      console.log('🔄 Salas carregadas, buscando especialidades dos profissionais...');
      
      // Extrair todos os nomes de profissionais únicos de DUAS fontes:
      // 1. Profissionais dos agendamentos
      // 2. Profissionais alocados nas salas
      const nomesProfissionais = new Set<string>();
      
      // Fonte 1: Profissionais dos agendamentos
      salas.forEach(sala => {
        sala.pacientes.forEach(paciente => {
          const nomeProfissional = getProfissionalAtivo(paciente);
          if (nomeProfissional && nomeProfissional.trim() !== '') {
            nomesProfissionais.add(nomeProfissional);
          }
        });
      });

      // Fonte 2: Profissionais alocados nas salas
      salas.forEach(sala => {
        Object.values(sala.profissionais_ativos).forEach(nomeProfissional => {
          if (nomeProfissional && 
              nomeProfissional.trim() !== '' && 
              !nomeProfissional.includes('Nome não encontrado') &&
              !nomeProfissional.includes('Livre')) {
            nomesProfissionais.add(nomeProfissional);
          }
        });
      });

      const nomesArray = Array.from(nomesProfissionais);
      console.log('👨‍⚕️ Profissionais encontrados para buscar especialidades:', nomesArray);
      
      if (nomesArray.length > 0) {
        buscarEspecialidadesProfissionais(nomesArray);
      } else {
        console.log('⚠️ Nenhum nome de profissional válido encontrado para buscar especialidades');
      }
    }
  }, [salas]);

  // Função para obter cor do status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pronto_para_terapia':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'em_atendimento':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'concluido':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'pronto_para_terapia':
        return 'Pronto';
      case 'em_atendimento':
        return 'Em Atendimento';
      case 'concluido':
        return 'Concluído';
      default:
        return 'Status Desconhecido';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Clock className="h-4 w-4" />;
      case 'pronto_para_terapia':
        return <AlertCircle className="h-4 w-4" />;
      case 'em_atendimento':
        return <Play className="h-4 w-4" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agenda das salas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar agenda</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={buscarDadosSalas}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-6">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Header aprimorado */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    📅
                  </div>
                  Agenda de Salas e Profissionais
                </h1>
                <p className="text-blue-100 mt-2 text-lg">
                  {getNomeUnidadeSelecionada() || 'Todas as unidades'} • {salas.length} salas • Atualização automática
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={buscarDadosSalas}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-lg flex items-center space-x-2"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Atualizar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Controles de filtro melhorados */}
          <div className="p-6 bg-gray-50/50">
            <div className="flex flex-wrap gap-6 items-end">
              {/* Filtro de sala */}
              <div className="min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filtrar por Sala
                </label>
                <select
                  value={salaSelecionada || ''}
                  onChange={(e) => setSalaSelecionada(e.target.value || null)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                >
                  <option value="">Todas as salas</option>
                  {salas.map((sala) => (
                    <option key={sala.sala_id} value={sala.sala_id}>
                      Sala {sala.sala_numero} - {sala.sala_nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modo de visualização */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Visualização
                </label>
                <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setVisuMode('grid')}
                    className={`px-4 py-2.5 text-sm font-medium transition-all ${
                      visuMode === 'grid' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setVisuMode('list')}
                    className={`px-4 py-2.5 text-sm font-medium transition-all ${
                      visuMode === 'list' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Lista
                  </button>
                </div>
              </div>

              {/* Filtro de status */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filtrar por Status
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                >
                  <option value="todos">Todos os status</option>
                  <option value="agendado">Agendado</option>
                  <option value="pronto_para_terapia">Pronto</option>
                  <option value="em_atendimento">Em Atendimento</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        {renderConteudo()}

        {/* Footer com estatísticas melhorado */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Estatísticas em Tempo Real</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">{salas.length}</div>
              <div className="text-sm font-medium text-blue-700">Total de Salas</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {salas.reduce((acc, sala) => acc + sala.pacientes.filter(p => p.status === 'em_atendimento').length, 0)}
              </div>
              <div className="text-sm font-medium text-emerald-700">Em Atendimento</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {salas.reduce((acc, sala) => acc + sala.pacientes.filter(p => p.status === 'pronto_para_terapia').length, 0)}
              </div>
              <div className="text-sm font-medium text-amber-700">Aguardando</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {salas.reduce((acc, sala) => acc + Object.values(sala.profissionais_ativos).filter(p => p).length, 0)}
              </div>
              <div className="text-sm font-medium text-purple-700">Profissionais Alocados</div>
            </div>
          </div>
        </div>

        {/* Modal de detalhes */}
        {renderModalDetalhes()}
      </div>
    </div>
  );
}
