'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from './MainLayout';
import { moduloTerapeuticoService } from '../lib/moduloTerapeuticoService';
import { 
  MapPin, 
  Users, 
  Clock, 
  Activity, 
  Plus, 
  Edit, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw,
  Settings,
  UserCheck,
  Zap
} from 'lucide-react';

interface Sala {
  id: string;
  nome: string;
  capacidade_maxima: number;
  ativa: boolean;
  observacoes?: string;
  especialidades: { id: string; nome: string }[];
  ocupacao_atual: number;
  ocupacao_maxima: number;
  profissionais_ativos: number;
  sessoes_ativas: Array<{
    id: string;
    paciente_nome: string;
    profissional_nome: string;
    horario_inicio: string;
    horario_fim: string;
    status: string;
  }>;
}

interface OcupacaoTempoReal {
  sala_id: string;
  total_pessoas: number;
  total_terapeutas: number;
  total_criancas: number;
  capacidade_disponivel: number;
  ultima_atualizacao: string;
}

interface FiltrosGestao {
  apenas_ativas: boolean;
  especialidade: string;
  ocupacao_minima: number;
  mostrar_disponiveis: boolean;
}

export function GestaoSalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [ocupacaoTempoReal, setOcupacaoTempoReal] = useState<OcupacaoTempoReal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosGestao>({
    apenas_ativas: true,
    especialidade: '',
    ocupacao_minima: 0,
    mostrar_disponiveis: false
  });
  const [modalSala, setModalSala] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [estatisticas, setEstatisticas] = useState({
    total_salas: 0,
    salas_ativas: 0,
    ocupacao_media: 0,
    salas_disponiveis: 0
  });

  useEffect(() => {
    carregarSalas();
    carregarOcupacaoTempoReal();
    
    // Atualizar ocupação a cada 30 segundos
    const interval = setInterval(carregarOcupacaoTempoReal, 30000);
    return () => clearInterval(interval);
  }, [filtros]);

  const carregarSalas = async () => {
    try {
      setLoading(true);
      
      const salasList = await moduloTerapeuticoService.buscarSalasComEspecialidades();
      
      // Aplicar filtros
      let salasFiltradas = salasList;
      
      if (filtros.apenas_ativas) {
        salasFiltradas = salasFiltradas.filter(sala => sala.ativa);
      }
      
      if (filtros.especialidade) {
        salasFiltradas = salasFiltradas.filter(sala => 
          sala.especialidades.some(esp => esp.id === filtros.especialidade)
        );
      }
      
      if (filtros.ocupacao_minima > 0) {
        salasFiltradas = salasFiltradas.filter(sala => 
          sala.ocupacao_atual >= filtros.ocupacao_minima
        );
      }
      
      if (filtros.mostrar_disponiveis) {
        salasFiltradas = salasFiltradas.filter(sala => 
          sala.ocupacao_atual < sala.ocupacao_maxima
        );
      }

      setSalas(salasFiltradas);
      calcularEstatisticas(salasList);
    } catch (error) {
      console.error('Erro ao carregar salas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarOcupacaoTempoReal = async () => {
    try {
      const ocupacao = await moduloTerapeuticoService.buscarOcupacaoTempoReal();
      setOcupacaoTempoReal(ocupacao);
    } catch (error) {
      console.error('Erro ao carregar ocupação em tempo real:', error);
    }
  };

  const calcularEstatisticas = (salasList: Sala[]) => {
    const total = salasList.length;
    const ativas = salasList.filter(s => s.ativa).length;
    const ocupacaoTotal = salasList.reduce((acc, sala) => acc + sala.ocupacao_atual, 0);
    const ocupacaoMedia = total > 0 ? Math.round((ocupacaoTotal / total) * 100) / 100 : 0;
    const disponiveis = salasList.filter(s => s.ativa && s.ocupacao_atual < s.ocupacao_maxima).length;

    setEstatisticas({
      total_salas: total,
      salas_ativas: ativas,
      ocupacao_media: ocupacaoMedia,
      salas_disponiveis: disponiveis
    });
  };

  const abrirModalSala = (sala?: Sala) => {
    setSalaSelecionada(sala || null);
    setModoEdicao(!!sala);
    setModalSala(true);
  };

  const fecharModalSala = () => {
    setModalSala(false);
    setSalaSelecionada(null);
    setModoEdicao(false);
  };

  const getOcupacaoSala = (salaId: string): OcupacaoTempoReal | undefined => {
    return ocupacaoTempoReal.find(ocp => ocp.sala_id === salaId);
  };

  const getStatusOcupacao = (sala: Sala) => {
    const ocupacao = sala.ocupacao_atual / sala.ocupacao_maxima;
    
    if (ocupacao >= 1) {
      return { color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', status: 'LOTADA' };
    } else if (ocupacao >= 0.8) {
      return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', status: 'QUASE CHEIA' };
    } else if (ocupacao >= 0.5) {
      return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', status: 'MODERADA' };
    } else {
      return { color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', status: 'DISPONÍVEL' };
    }
  };

  const calcularPorcentagemOcupacao = (atual: number, maxima: number): number => {
    return maxima > 0 ? Math.round((atual / maxima) * 100) : 0;
  };

  const verificarDisponibilidade = async (salaId: string, horario: string) => {
    try {
      const disponivel = await moduloTerapeuticoService.verificarDisponibilidadeSala(
        salaId,
        new Date().toISOString().split('T')[0],
        horario
      );
      
      alert(disponivel ? 'Sala disponível!' : 'Sala indisponível no horário selecionado.');
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-none">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Salas</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitore ocupação e gerencie salas terapêuticas em tempo real</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={carregarOcupacaoTempoReal}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Atualizar
            </button>
            <button 
              onClick={() => abrirModalSala()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Sala
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Salas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{estatisticas.total_salas}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salas Ativas</p>
                <p className="text-3xl font-bold text-green-600">{estatisticas.salas_ativas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupação Média</p>
                <p className="text-3xl font-bold text-orange-600">{estatisticas.ocupacao_media}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponíveis</p>
                <p className="text-3xl font-bold text-blue-600">{estatisticas.salas_disponiveis}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="apenas_ativas"
                checked={filtros.apenas_ativas}
                onChange={(e) => setFiltros(prev => ({ ...prev, apenas_ativas: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="apenas_ativas" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Apenas salas ativas
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Especialidade</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filtros.especialidade}
                onChange={(e) => setFiltros(prev => ({ ...prev, especialidade: e.target.value }))}
              >
                <option value="">Todas as especialidades</option>
                {/* TODO: Carregar especialidades dinamicamente */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ocupação Mínima</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filtros.ocupacao_minima}
                onChange={(e) => setFiltros(prev => ({ ...prev, ocupacao_minima: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="mostrar_disponiveis"
                checked={filtros.mostrar_disponiveis}
                onChange={(e) => setFiltros(prev => ({ ...prev, mostrar_disponiveis: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="mostrar_disponiveis" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Só salas disponíveis
              </label>
            </div>
          </div>
        </div>

        {/* Grid de Salas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Carregando salas...</p>
              </div>
            </div>
          ) : salas.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma sala encontrada</h3>
                <p className="text-gray-500 dark:text-gray-400">Ajuste os filtros ou adicione novas salas</p>
              </div>
            </div>
          ) : (
            salas.map((sala) => {
              const ocupacaoRealTime = getOcupacaoSala(sala.id);
              const statusOcupacao = getStatusOcupacao(sala);
              const porcentagemOcupacao = calcularPorcentagemOcupacao(sala.ocupacao_atual, sala.ocupacao_maxima);

              return (
                <div key={sala.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sala.nome}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Capacidade: {sala.capacidade_maxima} pessoas
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOcupacao.color}`}>
                        {statusOcupacao.status}
                      </span>
                    </div>

                    {/* Barra de Ocupação */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ocupação</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{porcentagemOcupacao}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            porcentagemOcupacao >= 100 ? 'bg-red-500' :
                            porcentagemOcupacao >= 80 ? 'bg-yellow-500' :
                            porcentagemOcupacao >= 50 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(porcentagemOcupacao, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{sala.ocupacao_atual} atual</span>
                        <span>{sala.ocupacao_maxima} máximo</span>
                      </div>
                    </div>

                    {/* Ocupação em Tempo Real */}
                    {ocupacaoRealTime && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tempo Real</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-blue-500" />
                            <span className="text-gray-700 dark:text-gray-300">{ocupacaoRealTime.total_terapeutas} terapeutas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">{ocupacaoRealTime.total_criancas} crianças</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Atualizado: {new Date(ocupacaoRealTime.ultima_atualizacao).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    )}

                    {/* Especialidades */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Especialidades</h4>
                      <div className="flex flex-wrap gap-1">
                        {sala.especialidades.slice(0, 3).map((esp) => (
                          <span key={esp.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                            {esp.nome}
                          </span>
                        ))}
                        {sala.especialidades.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                            +{sala.especialidades.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sessões Ativas */}
                    {sala.sessoes_ativas && sala.sessoes_ativas.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sessões Ativas</h4>
                        <div className="space-y-1">
                          {sala.sessoes_ativas.slice(0, 2).map((sessao) => (
                            <div key={sessao.id} className="text-xs bg-orange-50 dark:bg-orange-900/20 rounded p-2">
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">{sessao.paciente_nome}</span>
                                <span className="text-gray-600 dark:text-gray-400">{sessao.horario_inicio} - {sessao.horario_fim}</span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400">{sessao.profissional_nome}</span>
                            </div>
                          ))}
                          {sala.sessoes_ativas.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              +{sala.sessoes_ativas.length - 2} sessões...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => abrirModalSala(sala)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Detalhes
                      </button>
                      <button 
                        onClick={() => verificarDisponibilidade(sala.id, '14:00')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        <Clock className="w-3 h-3" />
                        Verificar
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Settings className="w-3 h-3" />
                        Config
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
