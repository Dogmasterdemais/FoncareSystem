'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign,
  Calendar,
  Users,
  FileText,
  Download,
  Eye,
  Check,
  X,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Building2,
  Search,
  Filter,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MainLayout from './MainLayout';

interface FolhaCLT {
  id: string;
  colaborador_id: string;
  nome_completo: string;
  cpf: string;
  cargo: string;
  mes_referencia: number;
  ano_referencia: number;
  salario_base: number;
  total_vencimentos: number;
  total_descontos: number;
  salario_liquido: number;
  status: string;
  data_pagamento: string;
}

interface FolhaPJ {
  id: string;
  colaborador_id: string;
  nome_completo: string;
  cpf: string;
  cargo: string;
  cnpj: string;
  mes_referencia: number;
  ano_referencia: number;
  valor_bruto: number;
  total_descontos: number;
  valor_liquido: number;
  status: string;
  data_pagamento: string;
}

interface ResumoFolha {
  totalCLT: number;
  totalPJ: number;
  totalGeral: number;
  colaboradoresCLT: number;
  colaboradoresPJ: number;
  folhasPendentes: number;
  folhasAprovadas: number;
  folhasPagas: number;
}

const FolhaPagamentoPage: React.FC = () => {
  const [abaSelecionada, setAbaSelecionada] = useState<'clt' | 'pj'>('clt');
  const [folhasCLT, setFolhasCLT] = useState<FolhaCLT[]>([]);
  const [folhasPJ, setFolhasPJ] = useState<FolhaPJ[]>([]);
  const [resumo, setResumo] = useState<ResumoFolha>({
    totalCLT: 0,
    totalPJ: 0,
    totalGeral: 0,
    colaboradoresCLT: 0,
    colaboradoresPJ: 0,
    folhasPendentes: 0,
    folhasAprovadas: 0,
    folhasPagas: 0
  });
  const [loading, setLoading] = useState(true);
  const [mesReferencia, setMesReferencia] = useState(new Date().getMonth() + 1);
  const [anoReferencia, setAnoReferencia] = useState(new Date().getFullYear());
  const [filtros, setFiltros] = useState({
    status: '',
    busca: ''
  });

  useEffect(() => {
    carregarDados();
  }, [mesReferencia, anoReferencia]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Dados simulados para demonstração
      const folhasCLTSimuladas: FolhaCLT[] = [
        {
          id: '1',
          colaborador_id: '1',
          nome_completo: 'João Silva Santos',
          cpf: '123.456.789-01',
          cargo: 'Fisioterapeuta',
          mes_referencia: mesReferencia,
          ano_referencia: anoReferencia,
          salario_base: 4500.00,
          total_vencimentos: 4650.00,
          total_descontos: 892.50,
          salario_liquido: 3757.50,
          status: 'pendente',
          data_pagamento: ''
        },
        {
          id: '2',
          colaborador_id: '3',
          nome_completo: 'Carlos Eduardo Lima',
          cpf: '456.789.123-03',
          cargo: 'Recepcionista',
          mes_referencia: mesReferencia,
          ano_referencia: anoReferencia,
          salario_base: 2200.00,
          total_vencimentos: 2350.00,
          total_descontos: 287.50,
          salario_liquido: 2062.50,
          status: 'aprovada',
          data_pagamento: ''
        }
      ];

      const folhasPJSimuladas: FolhaPJ[] = [
        {
          id: '1',
          colaborador_id: '2',
          nome_completo: 'Maria Oliveira Costa',
          cpf: '987.654.321-02',
          cargo: 'Psicóloga',
          cnpj: '12.345.678/0001-90',
          mes_referencia: mesReferencia,
          ano_referencia: anoReferencia,
          valor_bruto: 3800.00,
          total_descontos: 190.00,
          valor_liquido: 3610.00,
          status: 'paga',
          data_pagamento: '2024-01-05'
        }
      ];

      setFolhasCLT(folhasCLTSimuladas);
      setFolhasPJ(folhasPJSimuladas);
      
      // Calcular resumo
      const totalCLT = folhasCLTSimuladas.reduce((acc, folha) => acc + folha.salario_liquido, 0);
      const totalPJ = folhasPJSimuladas.reduce((acc, folha) => acc + folha.valor_liquido, 0);
      
      setResumo({
        totalCLT,
        totalPJ,
        totalGeral: totalCLT + totalPJ,
        colaboradoresCLT: folhasCLTSimuladas.length,
        colaboradoresPJ: folhasPJSimuladas.length,
        folhasPendentes: [...folhasCLTSimuladas, ...folhasPJSimuladas].filter(f => f.status === 'pendente').length,
        folhasAprovadas: [...folhasCLTSimuladas, ...folhasPJSimuladas].filter(f => f.status === 'aprovada').length,
        folhasPagas: [...folhasCLTSimuladas, ...folhasPJSimuladas].filter(f => f.status === 'paga').length
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const aprovarFolha = async (id: string, tipo: 'clt' | 'pj') => {
    try {
      // Implementar aprovação no banco
      if (tipo === 'clt') {
        setFolhasCLT(prev => prev.map(folha => 
          folha.id === id ? { ...folha, status: 'aprovada' } : folha
        ));
      } else {
        setFolhasPJ(prev => prev.map(folha => 
          folha.id === id ? { ...folha, status: 'aprovada' } : folha
        ));
      }
      
      alert('Folha aprovada com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao aprovar folha:', error);
    }
  };

  const marcarComoPaga = async (id: string, tipo: 'clt' | 'pj') => {
    try {
      const dataPagamento = new Date().toISOString().split('T')[0];
      
      if (tipo === 'clt') {
        setFolhasCLT(prev => prev.map(folha => 
          folha.id === id ? { ...folha, status: 'paga', data_pagamento: dataPagamento } : folha
        ));
      } else {
        setFolhasPJ(prev => prev.map(folha => 
          folha.id === id ? { ...folha, status: 'paga', data_pagamento: dataPagamento } : folha
        ));
      }
      
      alert('Pagamento registrado com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }
  };

  const gerarRelatorio = () => {
    // Implementar geração de relatório
    alert('Relatório será gerado em breve!');
  };

  const folhasCLTFiltradas = folhasCLT.filter(folha => {
    const matchStatus = !filtros.status || folha.status === filtros.status;
    const matchBusca = !filtros.busca || 
      folha.nome_completo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      folha.cpf.includes(filtros.busca);
    
    return matchStatus && matchBusca;
  });

  const folhasPJFiltradas = folhasPJ.filter(folha => {
    const matchStatus = !filtros.status || folha.status === filtros.status;
    const matchBusca = !filtros.busca || 
      folha.nome_completo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      folha.cpf.includes(filtros.busca);
    
    return matchStatus && matchBusca;
  });

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Folha de Pagamento
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {getMesNome(mesReferencia)} de {anoReferencia}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMesNome(i + 1)}
                </option>
              ))}
            </select>
            
            <select
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={anoReferencia}
              onChange={(e) => setAnoReferencia(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - 2 + i}>
                  {new Date().getFullYear() - 2 + i}
                </option>
              ))}
            </select>
            
            <button 
              onClick={gerarRelatorio}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Relatório</span>
            </button>
          </div>
        </div>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Total CLT</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                  R$ {resumo.totalCLT.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                  {resumo.colaboradoresCLT} colaboradores
                </p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl shadow-lg border border-orange-200/50 dark:border-orange-700/50 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Total PJ</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                  R$ {resumo.totalPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
                  {resumo.colaboradoresPJ} prestadores
                </p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-xl">
                <Building2 className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl shadow-lg border border-green-200/50 dark:border-green-700/50 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Total Geral</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                  R$ {resumo.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">
                  {resumo.colaboradoresCLT + resumo.colaboradoresPJ} pessoas
                </p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-xl">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Status</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      {resumo.folhasPendentes} Pendentes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {resumo.folhasAprovadas} Aprovadas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      {resumo.folhasPagas} Pagas
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setAbaSelecionada('clt')}
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              abaSelecionada === 'clt'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            CLT ({resumo.colaboradoresCLT})
          </button>
          <button
            onClick={() => setAbaSelecionada('pj')}
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              abaSelecionada === 'pj'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            PJ ({resumo.colaboradoresPJ})
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Buscar</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nome ou CPF..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Status</label>
            <select
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="paga">Paga</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela CLT */}
      {abaSelecionada === 'clt' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Salário Base
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Vencimentos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Descontos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Líquido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {folhasCLTFiltradas.map((folha, index) => (
                  <tr key={folha.id} className={`hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                  }`}>
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {folha.nome_completo}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {folha.cpf} • {folha.cargo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900 dark:text-white">
                      R$ {folha.salario_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-green-700 dark:text-green-400">
                      R$ {folha.total_vencimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-red-600 dark:text-red-400">
                      R$ {folha.total_descontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">
                      R$ {folha.salario_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                        folha.status === 'pendente' 
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' 
                          : folha.status === 'aprovada'
                          ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                          : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                      }`}>
                        {folha.status === 'pendente' ? 'Pendente' : 
                         folha.status === 'aprovada' ? 'Aprovada' : 'Paga'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:shadow-md"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {folha.status === 'pendente' && (
                          <button
                            onClick={() => aprovarFolha(folha.id, 'clt')}
                            className="p-2.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 hover:shadow-md"
                            title="Aprovar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {folha.status === 'aprovada' && (
                          <button
                            onClick={() => marcarComoPaga(folha.id, 'clt')}
                            className="p-2.5 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 hover:shadow-md"
                            title="Marcar como Paga"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela PJ */}
      {abaSelecionada === 'pj' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                    Prestador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                    Valor Bruto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                    Descontos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                    Valor Líquido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {folhasPJFiltradas.map((folha, index) => (
                  <tr key={folha.id} className={`hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                  }`}>
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {folha.nome_completo}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {folha.cpf} • {folha.cargo}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          CNPJ: {folha.cnpj}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900 dark:text-white">
                      R$ {folha.valor_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-red-600 dark:text-red-400">
                      R$ {folha.total_descontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">
                      R$ {folha.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                        folha.status === 'pendente' 
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' 
                          : folha.status === 'aprovada'
                          ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                          : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                      }`}>
                        {folha.status === 'pendente' ? 'Pendente' : 
                         folha.status === 'aprovada' ? 'Aprovada' : 'Paga'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900 dark:text-white">
                      {folha.data_pagamento 
                        ? new Date(folha.data_pagamento).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:shadow-md"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {folha.status === 'pendente' && (
                          <button
                            onClick={() => aprovarFolha(folha.id, 'pj')}
                            className="p-2.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 hover:shadow-md"
                            title="Aprovar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {folha.status === 'aprovada' && (
                          <button
                            onClick={() => marcarComoPaga(folha.id, 'pj')}
                            className="p-2.5 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 hover:shadow-md"
                            title="Marcar como Paga"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
};

export default FolhaPagamentoPage;
