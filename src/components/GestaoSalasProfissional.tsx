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
  Activity,
  ChevronDown,
  MoreVertical,
  PlusCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Especialidade {
  id: string;
  nome: string;
  cor: string;
}

interface Profissional {
  id: string;
  nome_completo: string;
  cargo: string;
  regime_contratacao?: string;
  especialidade_id?: string;
  especialidades?: {
    nome: string;
    cor: string;
  };
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
  busca: string;
  tipo: string;
  sala_especifica: string;
}

interface EstatisticasGerais {
  total_salas: number;
  salas_disponiveis: number;
  ocupacao_media: number;
  profissionais_alocados: number;
  taxa_ocupacao: number;
}

export function GestaoSalasProfissional() {
  const { unidadeSelecionada, unidades } = useUnidade();
  
  console.log('🚀 DEBUG: Componente iniciado');
  console.log('🏢 DEBUG: Unidades disponíveis:', unidades?.length || 0);
  console.log('🏢 DEBUG: Unidade selecionada:', unidadeSelecionada);
  console.log('🏢 DEBUG: Estado completo unidades:', unidades);
  console.log('🏢 DEBUG: Timestamp render:', Date.now());
  
  const [salas, setSalas] = useState<Sala[]>([]);
  const [salasOriginais, setSalasOriginais] = useState<Sala[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosSalas>({
    especialidade: '',
    status: 'todas',
    busca: '',
    tipo: 'todas',
    sala_especifica: 'todas'
  });

  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais>({
    total_salas: 0,
    salas_disponiveis: 0,
    ocupacao_media: 0,
    profissionais_alocados: 0,
    taxa_ocupacao: 0
  });

  const [modalAlocacao, setModalAlocacao] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('');
  const [turnoSelecionado, setTurnoSelecionado] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Estados para busca de profissional
  const [buscaProfissional, setBuscaProfissional] = useState('');
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [profissionaisFiltrados, setProfissionaisFiltrados] = useState<Profissional[]>([]);

  // Buscar unidade selecionada pelo nome
  const unidadeAtual = unidades.find(u => u.id === unidadeSelecionada);

  const carregarSalas = useCallback(async () => {
    if (!unidadeSelecionada) {
      console.log('🔍 DEBUG: Unidade não selecionada:', unidadeSelecionada);
      return;
    }

    console.log('🔍 DEBUG: Carregando salas para unidade:', unidadeSelecionada);

    try {
      // Query simplificada - especialidade vem do nome da sala
      const { data: salasData, error } = await supabase
        .from('salas')
        .select(`
          id,
          nome,
          numero,
          cor,
          tipo,
          capacidade_maxima,
          especialidade_id,
          unidade_id,
          ativo
        `)
        .eq('unidade_id', unidadeSelecionada)
        .eq('ativo', true)
        .order('nome');

      console.log('🔍 DEBUG: Resposta do Supabase salas:', { salasData, error });

      if (error) {
        console.error('❌ Erro ao buscar salas:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      if (!salasData || salasData.length === 0) {
        console.log('⚠️ DEBUG: Nenhuma sala encontrada para a unidade:', unidadeSelecionada);
        setSalasOriginais([]);
        calcularEstatisticas([]);
        return;
      }

      // Buscar colaboradores das salas separadamente
      const salaIds = salasData.map(sala => sala.id);
      const { data: profissionaisSalasData, error: errorProfSalas } = await supabase
        .from('profissionais_salas')
        .select(`
          id,
          profissional_id,
          sala_id,
          turno,
          data_inicio,
          data_fim,
          ativo
        `)
        .in('sala_id', salaIds)
        .eq('ativo', true);

      // Buscar os dados dos colaboradores separadamente
      let colaboradoresData: { id: string; nome_completo: string; cargo: string }[] = [];
      if (profissionaisSalasData && profissionaisSalasData.length > 0) {
        const profissionalIds = profissionaisSalasData.map(ps => ps.profissional_id);
        const { data: colaboradores, error: errorColaboradores } = await supabase
          .from('colaboradores')
          .select('id, nome_completo, cargo')
          .in('id', profissionalIds);
        
        if (errorColaboradores) {
          console.warn('⚠️ Erro ao buscar dados dos colaboradores:', errorColaboradores);
        } else {
          colaboradoresData = colaboradores || [];
        }
      }

      if (errorProfSalas) {
        console.warn('⚠️ Erro ao buscar profissionais das salas:', errorProfSalas);
      }

      console.log('📊 DEBUG: Salas encontradas:', salasData?.length || 0);
      console.log('👥 DEBUG: Profissionais encontrados:', profissionaisSalasData?.length || 0);
      console.log('👥 DEBUG: Colaboradores encontrados:', colaboradoresData?.length || 0);

      // Combinar dados das salas com profissionais e colaboradores
      const salasProcessadas = salasData.map(sala => {
        const profissionaisDaSala = profissionaisSalasData?.filter(ps => ps.sala_id === sala.id) || [];
        
        // Adicionar dados dos colaboradores aos profissionais da sala
        const profissionaisComDados = profissionaisDaSala.map(ps => {
          const colaborador = colaboradoresData.find(c => c.id === ps.profissional_id);
          return {
            ...ps,
            profissionais: colaborador || { id: '', nome_completo: 'Não encontrado', cargo: 'Não informado' }
          };
        });
        
        return {
          ...sala,
          profissionais_salas: profissionaisComDados,
          ocupacao_atual: profissionaisDaSala.length,
          ocupacao_maxima: sala.capacidade_maxima || 3
        };
      });

      console.log('🔧 DEBUG: Salas processadas:', salasProcessadas.length);

      setSalasOriginais(salasProcessadas);
      calcularEstatisticas(salasProcessadas);

    } catch (error) {
      console.error('💥 Erro ao carregar salas:', error);
    }
  }, [unidadeSelecionada]);

  const carregarEspecialidades = useCallback(async () => {
    try {
      // Buscar nomes únicos das salas como especialidades
      const { data, error } = await supabase
        .from('salas')
        .select('nome')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar especialidades das salas:', error);
        return;
      }

      // Criar array de especialidades únicas baseado nos nomes das salas
      const especialidadesUnicas = [...new Set(data?.map(sala => sala.nome) || [])];
      const especialidadesFormatadas = especialidadesUnicas.map((nome, index) => ({
        id: (index + 1).toString(),
        nome,
        cor: '#' + Math.floor(Math.random()*16777215).toString(16) // cor aleatória
      }));

      setEspecialidades(especialidadesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
    }
  }, []);

  const carregarProfissionais = useCallback(async () => {
    if (!unidadeSelecionada) return;

    try {
      console.log('🔍 DEBUG: Carregando colaboradores para unidade:', unidadeSelecionada);
      
      // Simplificar query - buscar apenas campos básicos
      const { data, error } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          cargo,
          regime_contratacao
        `)
        .eq('status', 'ativo')
        .eq('regime_contratacao', 'pj')
        .order('nome_completo');

      console.log('🔍 DEBUG: Resposta colaboradores:', { data, error });

      if (error) {
        console.error('Erro ao buscar colaboradores:', error);
        return;
      }

      // Processar dados dos colaboradores
      const processedData = data || [];
      setProfissionais(processedData);
      setProfissionaisFiltrados(processedData);

    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  }, [unidadeSelecionada]);

  // Filtrar profissionais conforme a busca
  useEffect(() => {
    if (!buscaProfissional.trim()) {
      setProfissionaisFiltrados(profissionais);
    } else {
      const filtrados = profissionais.filter(prof => 
        prof.nome_completo.toLowerCase().includes(buscaProfissional.toLowerCase()) ||
        prof.cargo.toLowerCase().includes(buscaProfissional.toLowerCase())
      );
      setProfissionaisFiltrados(filtrados);
    }
  }, [buscaProfissional, profissionais]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const fecharDropdown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-profissional')) {
        setDropdownAberto(false);
      }
    };

    if (dropdownAberto) {
      document.addEventListener('mousedown', fecharDropdown);
      return () => document.removeEventListener('mousedown', fecharDropdown);
    }
  }, [dropdownAberto]);

  const aplicarFiltros = useCallback((salasData: Sala[]) => {
    let salasFiltradas = [...salasData];

    // Filtro por especialidade
    if (filtros.especialidade) {
      salasFiltradas = salasFiltradas.filter(sala => 
        sala.especialidade_id === filtros.especialidade
      );
    }

    // Filtro por status
    if (filtros.status === 'disponivel') {
      salasFiltradas = salasFiltradas.filter(sala => 
        (sala.ocupacao_atual || 0) < (sala.ocupacao_maxima || 3)
      );
    } else if (filtros.status === 'ocupada') {
      salasFiltradas = salasFiltradas.filter(sala => 
        (sala.ocupacao_atual || 0) >= (sala.ocupacao_maxima || 3)
      );
    }

    // Filtro por tipo
    if (filtros.tipo !== 'todas') {
      salasFiltradas = salasFiltradas.filter(sala => 
        sala.tipo === filtros.tipo
      );
    }

    // Filtro por sala específica
    if (filtros.sala_especifica !== 'todas') {
      salasFiltradas = salasFiltradas.filter(sala => 
        sala.id === filtros.sala_especifica
      );
    }

    // Filtro de busca
    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      salasFiltradas = salasFiltradas.filter(sala =>
        sala.nome.toLowerCase().includes(termoBusca) ||
        (sala.numero && sala.numero.toLowerCase().includes(termoBusca)) ||
        (sala.especialidades?.nome.toLowerCase().includes(termoBusca))
      );
    }

    setSalas(salasFiltradas);
  }, [filtros]);

  const calcularEstatisticas = (todasSalas: Sala[]) => {
    const total = todasSalas.length;
    const disponiveis = todasSalas.filter(s => (s.ocupacao_atual || 0) < (s.ocupacao_maxima || 3)).length;
    const totalOcupacao = todasSalas.reduce((acc, s) => acc + (s.ocupacao_atual || 0), 0);
    const totalCapacidade = todasSalas.reduce((acc, s) => acc + (s.ocupacao_maxima || 3), 0);
    const ocupacaoMedia = totalCapacidade > 0 ? (totalOcupacao / totalCapacidade) * 100 : 0;
    const profissionaisAlocados = todasSalas.reduce((acc, s) => acc + (s.profissionais_salas?.length || 0), 0);
    const taxaOcupacao = total > 0 ? ((total - disponiveis) / total) * 100 : 0;

    setEstatisticas({
      total_salas: total,
      salas_disponiveis: disponiveis,
      ocupacao_media: ocupacaoMedia,
      profissionais_alocados: profissionaisAlocados,
      taxa_ocupacao: taxaOcupacao
    });
  };

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
    } finally {
      setLoading(false);
    }
  }, [carregarSalas, carregarEspecialidades, carregarProfissionais]);

  useEffect(() => {
    console.log('🔄 DEBUG: useEffect executado - unidadeSelecionada:', unidadeSelecionada);
    console.log('🔄 DEBUG: useEffect executado - unidades length:', unidades?.length || 0);
    
    // Força atualização quando as unidades estão carregadas e há uma selecionada
    if (unidades?.length > 0 && unidadeSelecionada) {
      console.log('🎯 DEBUG: Condições atendidas, carregando dados...');
      carregarDados();
    } else if (unidades?.length > 0 && !unidadeSelecionada) {
      console.log('🎯 DEBUG: Unidades carregadas mas nenhuma selecionada, aguardando...');
    } else {
      console.log('⏳ DEBUG: Aguardando unidades serem carregadas...');
    }
  }, [unidadeSelecionada, carregarDados, unidades]);

  useEffect(() => {
    aplicarFiltros(salasOriginais);
  }, [filtros, aplicarFiltros, salasOriginais]);

  const selecionarProfissional = (prof: Profissional) => {
    setProfissionalSelecionado(prof.id);
    setBuscaProfissional(prof.nome_completo);
    setDropdownAberto(false);
  };

  const limparSelecaoProfissional = () => {
    setProfissionalSelecionado('');
    setBuscaProfissional('');
    setDropdownAberto(false);
  };

  const alocarProfissional = async () => {
    if (!salaSelecionada || !profissionalSelecionado || !turnoSelecionado) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    // Verificar se a sala já está lotada
    const ocupacaoAtual = salaSelecionada.ocupacao_atual || 0;
    const capacidadeMaxima = salaSelecionada.ocupacao_maxima || 3;
    
    if (ocupacaoAtual >= capacidadeMaxima) {
      alert(`Esta sala já está lotada (${ocupacaoAtual}/${capacidadeMaxima}). Não é possível alocar mais profissionais.`);
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
      setBuscaProfissional('');
      setTurnoSelecionado('');
      setSalaSelecionada(null);
      setDropdownAberto(false);
      carregarSalas();
    } catch (error) {
      console.error('Erro ao alocar profissional:', error);
      alert('Erro inesperado ao alocar profissional');
    }
  };

  const removerProfissionalDaSala = async (profissionalSalaId: string) => {
    if (!confirm('Tem certeza que deseja remover este profissional da sala?')) {
      return;
    }

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

  const getStatusColor = (sala: Sala) => {
    const ocupacao = (sala.ocupacao_atual || 0) / (sala.ocupacao_maxima || 3);
    if (ocupacao >= 1) return 'bg-red-100 text-red-800 border-red-200';
    if (ocupacao >= 0.8) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getOcupacaoIcon = (sala: Sala) => {
    const ocupacao = (sala.ocupacao_atual || 0) / (sala.ocupacao_maxima || 3);
    if (ocupacao >= 0.8) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  if (!unidadeSelecionada) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
            <Building2 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Selecione uma Unidade
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Para acessar a gestão de salas, você precisa selecionar uma unidade primeiro.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Carregando Salas
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aguarde enquanto buscamos os dados das salas...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Principal */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Gestão de Salas
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {unidadeAtual?.nome || 'Unidade Selecionada'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-l-lg text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Grade
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-r-lg text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Lista
                  </button>
                </div>
                <button 
                  onClick={carregarDados}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Salas</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estatisticas.total_salas}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponíveis</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.salas_disponiveis}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Ocupação</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas.taxa_ocupacao.toFixed(1)}%</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupação Média</p>
                  <p className="text-3xl font-bold text-purple-600">{estatisticas.ocupacao_media.toFixed(1)}%</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profissionais</p>
                  <p className="text-3xl font-bold text-indigo-600">{estatisticas.profissionais_alocados}</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros Avançados */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar Salas
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filtros.busca}
                    onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                    placeholder="Nome, número ou especialidade..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Especialidade
                </label>
                <select
                  value={filtros.especialidade}
                  onChange={(e) => setFiltros(prev => ({ ...prev, especialidade: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todas">Todas as salas</option>
                  <option value="disponivel">Disponíveis</option>
                  <option value="ocupada">Totalmente ocupadas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todas">Todos os tipos</option>
                  <option value="terapia">Terapia</option>
                  <option value="consulta">Consulta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sala Específica
                </label>
                <select
                  value={filtros.sala_especifica}
                  onChange={(e) => setFiltros(prev => ({ ...prev, sala_especifica: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todas">Todas as salas</option>
                  {salasOriginais.map(sala => (
                    <option key={sala.id} value={sala.id}>
                      {sala.nome} {sala.numero ? `(${sala.numero})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setFiltros({
                  especialidade: '',
                  status: 'todas',
                  busca: '',
                  tipo: 'todas',
                  sala_especifica: 'todas'
                })}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Limpar todos os filtros
              </button>
            </div>
          </div>

          {/* Lista de Salas */}
          {salas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma sala encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Não há salas que correspondam aos filtros selecionados.
              </p>
              <button 
                onClick={() => setFiltros({
                  especialidade: '',
                  status: 'todas',
                  busca: '',
                  tipo: 'todas',
                  sala_especifica: 'todas'
                })}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {salas.map(sala => (
                <div 
                  key={sala.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                >
                  {/* Barra colorida no topo */}
                  <div 
                    className="h-1 w-full"
                    style={{ backgroundColor: sala.cor || sala.especialidades?.cor || '#6B7280' }}
                  />
                  
                  {/* Header da Sala */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                          style={{ backgroundColor: sala.cor || sala.especialidades?.cor || '#6B7280' }}
                        />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {sala.nome}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(sala)}`}>
                          {(sala.ocupacao_atual || 0) >= (sala.ocupacao_maxima || 3) ? 'Lotada' : 'Disponível'}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {sala.numero && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Sala {sala.numero}
                        </span>
                      )}
                      {sala.especialidades?.nome && (
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: sala.cor || sala.especialidades?.cor || '#6B7280' }}
                        >
                          <Activity className="h-3 w-3" />
                          {sala.especialidades?.nome}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        {getOcupacaoIcon(sala)}
                        {sala.ocupacao_atual || 0}/{sala.ocupacao_maxima || 3}
                      </span>
                    </div>
                  </div>

                  {/* Profissionais Alocados */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Profissionais ({sala.profissionais_salas?.length || 0})
                      </h5>
                      <button
                        onClick={() => {
                          setSalaSelecionada(sala);
                          setModalAlocacao(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </button>
                    </div>

                    {sala.profissionais_salas && sala.profissionais_salas.length > 0 ? (
                      <div className="space-y-3">
                        {sala.profissionais_salas.slice(0, 3).map(ps => (
                          <div key={ps.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {ps.profissionais.nome_completo}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                                {ps.profissionais.cargo}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {ps.turno}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(ps.data_inicio).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removerProfissionalDaSala(ps.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {sala.profissionais_salas.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            + {sala.profissionais_salas.length - 3} profissionais
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nenhum profissional alocado
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer da Sala */}
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 rounded-b-xl border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: sala.cor || sala.especialidades?.cor || '#6B7280' }}
                          />
                          <span className="capitalize">{sala.tipo}</span>
                        </div>
                        <span>•</span>
                        <span>Cap. {sala.capacidade_maxima || 3}</span>
                      </div>
                      <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="h-3 w-3" />
                        Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Alocação */}
        {modalAlocacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              {/* Barra colorida no topo do modal */}
              <div 
                className="h-1 w-full"
                style={{ backgroundColor: salaSelecionada?.cor || salaSelecionada?.especialidades?.cor || '#6B7280' }}
              />
              
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Alocar Profissional
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: salaSelecionada?.cor || salaSelecionada?.especialidades?.cor || '#6B7280' }}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {salaSelecionada?.nome}
                  </p>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profissional
                  </label>
                  <div className="relative dropdown-profissional">
                    <input
                      type="text"
                      value={buscaProfissional}
                      onChange={(e) => {
                        setBuscaProfissional(e.target.value);
                        setDropdownAberto(true);
                      }}
                      onFocus={() => setDropdownAberto(true)}
                      placeholder="Digite o nome ou especialidade do profissional..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {profissionalSelecionado && (
                      <button
                        onClick={limparSelecaoProfissional}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    
                    {dropdownAberto && profissionaisFiltrados.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {profissionaisFiltrados.slice(0, 10).map(prof => (
                          <button
                            key={prof.id}
                            onClick={() => selecionarProfissional(prof)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 focus:bg-gray-50 dark:focus:bg-gray-600 focus:outline-none"
                          >
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {prof.nome_completo}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {prof.cargo}
                            </div>
                          </button>
                        ))}
                        {profissionaisFiltrados.length > 10 && (
                          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-600">
                            +{profissionaisFiltrados.length - 10} mais profissionais...
                          </div>
                        )}
                      </div>
                    )}
                    
                    {dropdownAberto && buscaProfissional && profissionaisFiltrados.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          Nenhum profissional encontrado
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Turno
                  </label>
                  <select 
                    value={turnoSelecionado} 
                    onChange={(e) => setTurnoSelecionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione o turno</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="integral">Integral</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => {
                    setModalAlocacao(false);
                    setProfissionalSelecionado('');
                    setTurnoSelecionado('');
                    setSalaSelecionada(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={alocarProfissional}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Alocar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
