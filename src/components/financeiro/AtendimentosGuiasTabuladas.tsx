import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GerenciamentoRecebimentos } from './GerenciamentoRecebimentos';
import { 
  FileText, 
  Users, 
  Calendar, 
  TrendingUp, 
  Filter, 
  Download, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  CreditCard,
  Building,
  Search
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AtendimentoFaturamento {
  id: string;
  numero_agendamento: string;
  numero_guia: string;
  paciente_nome: string;
  paciente_telefone: string;
  convenio_nome: string;
  especialidade_nome: string;
  descricao_procedimento: string;
  codigo_tuss: string;
  valor_procedimento: number;
  valor_pago: number | null;
  valor_glosa: number | null;
  data_agendamento: string;
  data_autorizacao: string | null;
  data_chegada: string | null;
  profissional_nome: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'pronto_para_terapia' | 'finalizado' | 'cancelado' | 'falta';
  status_faturamento: 'pendente' | 'revisado' | 'faturada' | 'pago' | 'glosado' | null;
  observacoes: string | null;
  observacoes_faturamento: string | null;
  unidade_nome: string;
  sala_nome: string;
  sala_numero: string;
  horario_inicio: string;
  horario_fim: string;
  lote_faturamento: string | null;
  data_faturamento: string | null;
  usuario_faturamento: string | null;
  created_at: string;
  updated_at: string;
}

interface StatusCount {
  status: string;
  count: number;
  valor_total: number;
  cor: string;
  icone: React.ReactNode;
}

interface FiltrosAtendimento {
  dataInicio: string;
  dataFim: string;
  unidade: string;
  convenio: string;
  status: string;
  statusFaturamento: string;
  profissional: string;
  busca: string;
}

export const AtendimentosGuiasTabuladas: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<AtendimentoFaturamento[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecebimentos, setShowRecebimentos] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosAtendimento>({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    unidade: '',
    convenio: '',
    status: '',
    statusFaturamento: '',
    profissional: '',
    busca: ''
  });
  const [unidades, setUnidades] = useState<Array<{id: string, nome: string}>>([]);
  const [convenios, setConvenios] = useState<string[]>([]);
  const [profissionais, setProfissionais] = useState<string[]>([]);

  useEffect(() => {
    carregarDados();
    carregarFiltros();
  }, [filtros.dataInicio, filtros.dataFim]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vw_faturamento_completo')
        .select('*')
        .gte('data_agendamento', filtros.dataInicio)
        .lte('data_agendamento', filtros.dataFim)
        .order('data_agendamento', { ascending: false });

      // Aplicar filtros
      if (filtros.unidade) {
        query = query.eq('unidade_nome', filtros.unidade);
      }
      if (filtros.convenio) {
        query = query.eq('convenio_nome', filtros.convenio);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.statusFaturamento) {
        query = query.eq('status_faturamento', filtros.statusFaturamento);
      }
      if (filtros.profissional) {
        query = query.eq('profissional_nome', filtros.profissional);
      }
      if (filtros.busca) {
        query = query.or(`paciente_nome.ilike.%${filtros.busca}%,numero_guia.ilike.%${filtros.busca}%,numero_agendamento.ilike.%${filtros.busca}%,paciente_telefone.ilike.%${filtros.busca}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const atendimentosFormatados: AtendimentoFaturamento[] = (data || []).map(item => ({
        id: item.id,
        numero_agendamento: item.numero_agendamento || '',
        numero_guia: item.numero_guia || '',
        paciente_nome: item.paciente_nome || '',
        paciente_telefone: item.paciente_telefone || '',
        convenio_nome: item.convenio_nome || '',
        especialidade_nome: item.especialidade_nome || '',
        descricao_procedimento: item.descricao_procedimento || '',
        codigo_tuss: item.codigo_tuss || '',
        valor_procedimento: item.valor_procedimento || 0,
        valor_pago: item.valor_pago || null,
        valor_glosa: item.valor_glosa || null,
        data_agendamento: item.data_agendamento || '',
        data_autorizacao: item.data_autorizacao,
        data_chegada: item.data_chegada,
        profissional_nome: item.profissional_nome || '',
        status: item.status || 'agendado',
        status_faturamento: item.status_faturamento,
        observacoes: item.observacoes,
        observacoes_faturamento: item.observacoes_faturamento,
        unidade_nome: item.unidade_nome || 'N/A',
        sala_nome: item.sala_nome || '',
        sala_numero: item.sala_numero || '',
        horario_inicio: item.horario_inicio || '',
        horario_fim: item.horario_fim || '',
        lote_faturamento: item.lote_faturamento,
        data_faturamento: item.data_faturamento,
        usuario_faturamento: item.usuario_faturamento,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));

      setAtendimentos(atendimentosFormatados);

      // Calcular contadores por status de faturamento
      const statusMap = new Map<string, {count: number, valor: number}>();
      atendimentosFormatados.forEach(atendimento => {
        const statusFat = atendimento.status_faturamento || 'pendente';
        const current = statusMap.get(statusFat) || { count: 0, valor: 0 };
        statusMap.set(statusFat, {
          count: current.count + 1,
          valor: current.valor + atendimento.valor_procedimento
        });
      });

      const statusCountsData: StatusCount[] = [
        {
          status: 'Pendente',
          count: statusMap.get('pendente')?.count || 0,
          valor_total: statusMap.get('pendente')?.valor || 0,
          cor: 'bg-yellow-100 text-yellow-800',
          icone: <Clock className="w-5 h-5" />
        },
        {
          status: 'Revisado',
          count: statusMap.get('revisado')?.count || 0,
          valor_total: statusMap.get('revisado')?.valor || 0,
          cor: 'bg-blue-100 text-blue-800',
          icone: <CheckCircle className="w-5 h-5" />
        },
        {
          status: 'Faturado',
          count: statusMap.get('faturada')?.count || 0,
          valor_total: statusMap.get('faturada')?.valor || 0,
          cor: 'bg-purple-100 text-purple-800',
          icone: <FileText className="w-5 h-5" />
        },
        {
          status: 'Pago',
          count: statusMap.get('pago')?.count || 0,
          valor_total: statusMap.get('pago')?.valor || 0,
          cor: 'bg-green-100 text-green-800',
          icone: <DollarSign className="w-5 h-5" />
        }
      ];

      setStatusCounts(statusCountsData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setAtendimentos([]);
      setStatusCounts([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarFiltros = async () => {
    try {
      // Carregar unidades únicas da view
      const { data: unidadesData } = await supabase
        .from('vw_faturamento_completo')
        .select('unidade_nome')
        .not('unidade_nome', 'is', null);
      
      const unidadesUnicas = [...new Set((unidadesData || []).map(item => item.unidade_nome))];
      setUnidades(unidadesUnicas.map(nome => ({ id: nome, nome })));

      // Carregar convênios únicos
      const { data: conveniosData } = await supabase
        .from('vw_faturamento_completo')
        .select('convenio_nome')
        .not('convenio_nome', 'is', null);
      
      const conveniosUnicos = [...new Set((conveniosData || []).map(item => item.convenio_nome))];
      setConvenios(conveniosUnicos);

      // Carregar profissionais únicos
      const { data: profissionaisData } = await supabase
        .from('vw_faturamento_completo')
        .select('profissional_nome')
        .not('profissional_nome', 'is', null);
      
      const profissionaisUnicos = [...new Set((profissionaisData || []).map(item => item.profissional_nome))];
      setProfissionais(profissionaisUnicos);

    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  const exportarDados = () => {
    const dadosExport = atendimentos.map(item => ({
      'Número da Guia': item.numero_guia,
      'Paciente': item.paciente_nome,
      'CPF/RG': item.paciente_telefone || 'N/A',
      'Convênio': item.convenio_nome,
      'Procedimento': item.descricao_procedimento,
      'Código': item.codigo_tuss || 'N/A',
      'Valor Guia': item.valor_procedimento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      'Valor Pago': item.valor_pago?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'N/A',
      'Valor Glosa': item.valor_glosa?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00',
      'Data Atendimento': new Date(item.data_agendamento).toLocaleDateString('pt-BR'),
      'Profissional': item.profissional_nome,
      'Status': item.status,
      'Unidade': item.unidade_nome
    }));

    const headers = Object.keys(dadosExport[0] || {});
    const csvContent = [
      headers.join(','),
      ...dadosExport.map(row => headers.map(header => 
        typeof row[header as keyof typeof row] === 'string' && row[header as keyof typeof row].includes(',') 
          ? `"${row[header as keyof typeof row]}"` 
          : row[header as keyof typeof row]
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `atendimentos_faturamento_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Realizado': return 'bg-blue-100 text-blue-800';
      case 'Faturado': return 'bg-purple-100 text-purple-800';
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'Glosado': return 'bg-red-100 text-red-800';
      case 'Agendado': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const valorTotalGeral = atendimentos.reduce((sum, item) => sum + item.valor_procedimento, 0);
  const valorPagoTotal = atendimentos.reduce((sum, item) => sum + (item.valor_pago || 0), 0);
  const valorGlosaTotal = atendimentos.reduce((sum, item) => sum + (item.valor_glosa || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando dados de faturamento...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Renderização condicional */}
      {showRecebimentos ? (
        <GerenciamentoRecebimentos 
          convenioSelecionado={filtros.convenio}
          onRecebimentoAdicionado={() => carregarDados()}
        />
      ) : (
        <>
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Faturamento - Guias Tabuladas
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Gestão completa de atendimentos para faturamento aos convênios
              </p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button 
                onClick={exportarDados}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                Exportar
              </button>
              <button 
                onClick={() => setShowRecebimentos(!showRecebimentos)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showRecebimentos 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <CreditCard size={16} />
                {showRecebimentos ? 'Ver Atendimentos' : 'Gerenciar Recebimentos'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus size={16} />
                Nova Guia
              </button>
            </div>
          </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statusCounts.map((status) => (
          <div key={status.status} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${status.cor.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                  {status.icone}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{status.status}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{status.count}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  R$ {status.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Resumo Financeiro do Período
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-700 dark:text-blue-300">Valor Total Faturado</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {valorTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 dark:text-green-300">Valor Recebido</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {valorPagoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-700 dark:text-red-300">Valor em Glosas</p>
            <p className="text-2xl font-bold text-red-600">
              R$ {valorGlosaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Taxa de Recebimento:</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {valorTotalGeral > 0 ? ((valorPagoTotal / valorTotalGeral) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-700 dark:text-gray-300">Taxa de Glosas:</span>
            <span className="font-bold text-red-600">
              {valorTotalGeral > 0 ? ((valorGlosaTotal / valorTotalGeral) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Filtros Avançados */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros de Pesquisa
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidade
            </label>
            <select
              value={filtros.unidade}
              onChange={(e) => setFiltros({ ...filtros, unidade: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas as Unidades</option>
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.nome}>{unidade.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos os Status</option>
              <option value="Realizado">Realizado</option>
              <option value="Faturado">Faturado</option>
              <option value="Pago">Pago</option>
              <option value="Glosado">Glosado</option>
              <option value="Agendado">Agendado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Convênio
            </label>
            <select
              value={filtros.convenio}
              onChange={(e) => setFiltros({ ...filtros, convenio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos os Convênios</option>
              {convenios.map(convenio => (
                <option key={convenio} value={convenio}>{convenio}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profissional
            </label>
            <select
              value={filtros.profissional}
              onChange={(e) => setFiltros({ ...filtros, profissional: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos os Profissionais</option>
              {profissionais.map(profissional => (
                <option key={profissional} value={profissional}>{profissional}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Paciente, CPF ou Nº Guia..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Tabela de Atendimentos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Atendimentos Detalhados ({atendimentos.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Building className="w-4 h-4" />
              Filtros aplicados: {Object.values(filtros).filter(v => v !== '').length}
            </div>
          </div>
        </div>
        
        {/* Versão Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Guia / Paciente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Convênio / Procedimento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valores
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data / Profissional
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {atendimentos.map((atendimento) => (
                <tr key={atendimento.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {atendimento.numero_guia}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {atendimento.paciente_nome}
                      </div>
                      {atendimento.paciente_telefone && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Telefone: {atendimento.paciente_telefone}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {atendimento.convenio_nome}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {atendimento.descricao_procedimento}
                      </div>
                      {atendimento.codigo_tuss && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Cód: {atendimento.codigo_tuss}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        R$ {atendimento.valor_procedimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {atendimento.valor_pago && (
                        <div className="text-xs text-green-600">
                          Pago: R$ {atendimento.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                      {atendimento.valor_glosa && atendimento.valor_glosa > 0 && (
                        <div className="text-xs text-red-600">
                          Glosa: R$ {atendimento.valor_glosa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(atendimento.data_agendamento).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {atendimento.profissional_nome}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {atendimento.unidade_nome}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(atendimento.status)}`}>
                      {atendimento.status}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versão Mobile - Cards */}
        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {atendimentos.map((atendimento) => (
            <div key={atendimento.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Guia: {atendimento.numero_guia}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {atendimento.paciente_nome}
                  </p>
                  {atendimento.paciente_telefone && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Telefone: {atendimento.paciente_telefone}
                    </p>
                  )}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(atendimento.status)}`}>
                  {atendimento.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Convênio</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{atendimento.convenio_nome}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    R$ {atendimento.valor_procedimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Data</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(atendimento.data_agendamento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Profissional</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{atendimento.profissional_nome}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Procedimento</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{atendimento.descricao_procedimento}</p>
                {atendimento.codigo_tuss && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">Código: {atendimento.codigo_tuss}</p>
                )}
              </div>

              {(atendimento.valor_pago || (atendimento.valor_glosa && atendimento.valor_glosa > 0)) && (
                <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-600 rounded">
                  {atendimento.valor_pago && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Valor Pago:</span>
                      <span className="text-green-600 font-medium">
                        R$ {atendimento.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {atendimento.valor_glosa && atendimento.valor_glosa > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Glosa:</span>
                      <span className="text-red-600 font-medium">
                        R$ {atendimento.valor_glosa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                  {atendimento.unidade_nome}
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {atendimentos.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum atendimento encontrado com os filtros aplicados.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Ajuste os filtros para visualizar outros resultados.
            </p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};
