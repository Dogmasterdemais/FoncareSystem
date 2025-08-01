'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from './MainLayout';
import { supabase } from '@/lib/supabaseClient';
import { useUnidade } from '@/context/UnidadeContext';
import { 
  MapPin, 
  Users, 
  RefreshCw,
  Settings,
  AlertTriangle,
  Eye,
  UserPlus,
  X,
  Filter,
  Search,
  Calendar,
  Clock,
  Building2,
  Activity
} from 'lucide-react';

interface Especialidade {
  id: string;
  nome: string;
  cor: string;
}

interface Profissional {
  id: string;
  nome: string;
  especialidades?: Especialidade;
  especialidade_id?: string;
}

interface ProfissionalSala {
  id: string;
  profissional_id: string;
  turno: string;
  data_inicio: string;
  data_fim?: string;
  ativo: boolean;
  profissionais: Profissional;
}

interface Sala {
  id: string;
  nome: string;
  numero?: string;
  cor: string;
  tipo: string;
  capacidade_maxima: number;
  especialidade_id: string;
  unidade_id: string;
  ativo: boolean;
  especialidades?: Especialidade;
  profissionais_salas?: ProfissionalSala[];
  ocupacao_atual?: number;
  ocupacao_maxima?: number;
}

interface FiltrosSalas {
  especialidade: string;
  status: string;
  ocupacao_minima: number;
  mostrar_disponiveis: boolean;
}

interface EstatisticasGerais {
  total_salas: number;
  salas_disponiveis: number;
  ocupacao_media: number;
  profissionais_alocados: number;
}

export function GestaoSalasNovaPage() {
  const { unidadeSelecionada, unidades } = useUnidade();
  
  const [salas, setSalas] = useState<Sala[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<FiltrosSalas>({
    especialidade: '',
    status: 'todas',
    ocupacao_minima: 0,
    mostrar_disponiveis: false
  });

  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais>({
    total_salas: 0,
    salas_disponiveis: 0,
    ocupacao_media: 0,
    profissionais_alocados: 0
  });

  const [modalAlocacao, setModalAlocacao] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('');
  const [turnoSelecionado, setTurnoSelecionado] = useState('');

  const carregarSalas = useCallback(async () => {
    if (!unidadeSelecionada) return;

    const { data: salasData, error } = await supabase
      .from('salas')
      .select(`
        *,
        especialidades(
          id,
          nome,
          cor
        ),
        profissionais_salas(
          id,
          profissional_id,
          turno,
          data_inicio,
          data_fim,
          ativo,
          profissionais:profissional_id(
            id,
            nome,
            especialidades(nome, cor)
          )
        )
      `)
      .eq('unidade_id', unidadeSelecionada)
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar salas:', error);
      return;
    }

    const salasProcessadas = salasData?.map(sala => ({
      ...sala,
      profissionais_salas: sala.profissionais_salas?.filter((ps: ProfissionalSala) => ps.ativo) || [],
      ocupacao_atual: sala.profissionais_salas?.filter((ps: ProfissionalSala) => ps.ativo).length || 0,
      ocupacao_maxima: sala.capacidade_maxima || 6
    })) || [];

    // Aplicar filtros
    let salasFiltradas = salasProcessadas;

    if (filtros.especialidade) {
      salasFiltradas = salasFiltradas.filter(sala => 
        sala.especialidade_id === filtros.especialidade
      );
    }

    if (filtros.status === 'disponivel') {
      salasFiltradas = salasFiltradas.filter(sala => 
        (sala.ocupacao_atual || 0) < (sala.ocupacao_maxima || 6)
      );
    } else if (filtros.status === 'ocupada') {
      salasFiltradas = salasFiltradas.filter(sala => 
        (sala.ocupacao_atual || 0) >= (sala.ocupacao_maxima || 6)
      );
    }

    // Aplicar filtro de busca
    if (searchTerm) {
      salasFiltradas = salasFiltradas.filter(sala =>
        sala.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sala.numero && sala.numero.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setSalas(salasFiltradas);
    calcularEstatisticas(salasProcessadas);
  }, [unidadeSelecionada, filtros, searchTerm]);

  const carregarEspecialidades = useCallback(async () => {
    const { data, error } = await supabase
      .from('especialidades')
      .select('id, nome, cor')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar especialidades:', error);
      return;
    }

    setEspecialidades(data || []);
  }, []);

  const carregarProfissionais = useCallback(async () => {
    if (!unidadeSelecionada) return;

    const { data, error } = await supabase
      .from('profissionais')
      .select(`
        id,
        nome,
        especialidade_id
      `)
      .eq('unidade_id', unidadeSelecionada)
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar profissionais:', error);
      return;
    }

    setProfissionais(data || []);
  }, [unidadeSelecionada]);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarSalas(),
        carregarEspecialidades(),
        carregarProfissionais()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados das salas');
    } finally {
      setLoading(false);
    }
  }, [carregarSalas, carregarEspecialidades, carregarProfissionais]);

  useEffect(() => {
    if (unidadeSelecionada) {
      carregarDados();
    }
  }, [unidadeSelecionada, carregarDados]);

  const calcularEstatisticas = (todasSalas: Sala[]) => {
    const total = todasSalas.length;
    const disponiveis = todasSalas.filter(s => (s.ocupacao_atual || 0) < (s.ocupacao_maxima || 6)).length;
    const totalOcupacao = todasSalas.reduce((acc, s) => acc + (s.ocupacao_atual || 0), 0);
    const totalCapacidade = todasSalas.reduce((acc, s) => acc + (s.ocupacao_maxima || 6), 0);
    const ocupacaoMedia = totalCapacidade > 0 ? (totalOcupacao / totalCapacidade) * 100 : 0;
    const profissionaisAlocados = todasSalas.reduce((acc, s) => acc + (s.profissionais_salas?.length || 0), 0);

    setEstatisticas({
      total_salas: total,
      salas_disponiveis: disponiveis,
      ocupacao_media: ocupacaoMedia,
      profissionais_alocados: profissionaisAlocados
    });
  };

  const alocarProfissional = async () => {
    if (!salaSelecionada || !profissionalSelecionado || !turnoSelecionado) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      const { error } = await supabase
        .from('profissionais_salas')
        .insert({
          profissional_id: profissionalSelecionado,
          sala_id: salaSelecionada.id,
          turno: turnoSelecionado,
          data_inicio: new Date().toISOString().split('T')[0],
          ativo: true
        });

      if (error) {
        console.error('Erro ao alocar profissional:', error);
        alert('Erro ao alocar profissional na sala');
        return;
      }

      alert('Profissional alocado com sucesso!');
      setModalAlocacao(false);
      setProfissionalSelecionado('');
      setTurnoSelecionado('');
      setSalaSelecionada(null);
      carregarSalas();
    } catch (error) {
      console.error('Erro ao alocar profissional:', error);
      alert('Erro inesperado ao alocar profissional');
    }
  };

  const removerProfissionalDaSala = async (profissionalSalaId: string) => {
    try {
      const { error } = await supabase
        .from('profissionais_salas')
        .update({ 
          ativo: false,
          data_fim: new Date().toISOString().split('T')[0]
        })
        .eq('id', profissionalSalaId);

      if (error) {
        console.error('Erro ao remover profissional:', error);
        alert('Erro ao remover profissional da sala');
        return;
      }

      alert('Profissional removido da sala');
      carregarSalas();
    } catch (error) {
      console.error('Erro ao remover profissional:', error);
      alert('Erro inesperado ao remover profissional');
    }
  };

  const agruparSalasPorEspecialidade = () => {
    const grupos: { [key: string]: { especialidade: Especialidade; salas: Sala[] } } = {};

    salas.forEach(sala => {
      const especialidade = especialidades.find(e => e.id === sala.especialidade_id);
      if (especialidade) {
        if (!grupos[especialidade.id]) {
          grupos[especialidade.id] = {
            especialidade,
            salas: []
          };
        }
        grupos[especialidade.id].salas.push(sala);
      }
    });

    return Object.values(grupos);
  };

  if (!unidadeSelecionada) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Unidade não selecionada
            </h2>
            <p className="text-yellow-600 dark:text-yellow-300">
              Por favor, selecione uma unidade para visualizar as salas.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Carregando salas...</p>
        </div>
      </MainLayout>
    );
  }

  const gruposPorEspecialidade = agruparSalasPorEspecialidade();

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestão de Salas - {unidadeSelecionada.nome}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Alocação de profissionais e controle de ocupação
            </p>
          </div>
          <button 
            onClick={() => carregarDados()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total de Salas
            </div>
            <div className="text-2xl font-bold">{estatisticas.total_salas}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Salas Disponíveis
            </div>
            <div className="text-2xl font-bold text-green-600">
              {estatisticas.salas_disponiveis}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Ocupação Média
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {estatisticas.ocupacao_media.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Profissionais Alocados
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {estatisticas.profissionais_alocados}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Especialidade</label>
              <select
                value={filtros.especialidade}
                onChange={(e) => setFiltros(prev => ({ ...prev, especialidade: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todas as especialidades</option>
                {especialidades.map(esp => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todas">Todas as salas</option>
                <option value="disponivel">Disponíveis</option>
                <option value="ocupada">Ocupadas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ocupação Mínima</label>
              <input
                type="number"
                min="0"
                value={filtros.ocupacao_minima}
                onChange={(e) => setFiltros(prev => ({ 
                  ...prev, 
                  ocupacao_minima: parseInt(e.target.value) || 0 
                }))}
                placeholder="0"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => setFiltros({
                  especialidade: '',
                  status: 'todas',
                  ocupacao_minima: 0,
                  mostrar_disponiveis: false
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Salas por Especialidade */}
        <div className="space-y-6">
          {gruposPorEspecialidade.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border dark:border-gray-700 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma sala encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Não há salas cadastradas para os filtros selecionados.
              </p>
            </div>
          ) : (
            gruposPorEspecialidade.map(grupo => (
              <div key={grupo.especialidade.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: grupo.especialidade.cor }}
                  />
                  <h3 className="text-lg font-semibold">{grupo.especialidade.nome}</h3>
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {grupo.salas.length} salas
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grupo.salas.map(sala => (
                    <div key={sala.id} className="border-l-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg" style={{ borderLeftColor: sala.cor }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold">{sala.nome}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          (sala.ocupacao_atual || 0) >= (sala.ocupacao_maxima || 6) 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {sala.ocupacao_atual || 0}/{sala.ocupacao_maxima || 6}
                        </span>
                      </div>
                      {sala.numero && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Sala {sala.numero}
                        </p>
                      )}

                      {/* Profissionais Alocados */}
                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Profissionais Alocados ({sala.profissionais_salas?.length || 0})
                        </h5>
                        {sala.profissionais_salas && sala.profissionais_salas.length > 0 ? (
                          <div className="space-y-2">
                            {sala.profissionais_salas.map(ps => (
                              <div key={ps.id} className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded">
                                <div>
                                  <p className="text-sm font-medium">{ps.profissionais.nome}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Turno: {ps.turno}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removerProfissionalDaSala(ps.id)}
                                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nenhum profissional alocado
                          </p>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSalaSelecionada(sala);
                            setModalAlocacao(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <UserPlus className="h-4 w-4" />
                          Alocar
                        </button>
                        <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Alocação de Profissional */}
        {modalAlocacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Alocar Profissional - {salaSelecionada?.nome}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Profissional</label>
                  <select 
                    value={profissionalSelecionado} 
                    onChange={(e) => setProfissionalSelecionado(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione um profissional</option>
                    {profissionais.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Turno</label>
                  <select 
                    value={turnoSelecionado} 
                    onChange={(e) => setTurnoSelecionado(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione o turno</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="integral">Integral</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      setModalAlocacao(false);
                      setProfissionalSelecionado('');
                      setTurnoSelecionado('');
                      setSalaSelecionada(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={alocarProfissional}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Alocar Profissional
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
