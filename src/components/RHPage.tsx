'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  FileText, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Building2,
  UserCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  X
} from 'lucide-react';
import { rhService, type Colaborador } from '../lib/rhService';
import ColaboradorForm from './ColaboradorForm';
import MainLayout from './MainLayout';

interface ColaboradorComUnidade extends Colaborador {
  unidade_nome?: string;
}

export default function RHPage() {
  const [colaboradores, setColaboradores] = useState<ColaboradorComUnidade[]>([]);
  const [stats, setStats] = useState<{
    totalColaboradores: number;
    colaboradoresAtivos: number;
    colaboradoresCLT: number;
    colaboradoresPJ: number;
    folhaMesAtual: number;
  }>({
    totalColaboradores: 0,
    colaboradoresAtivos: 0,
    colaboradoresCLT: 0,
    colaboradoresPJ: 0,
    folhaMesAtual: 0
  });
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: '',
    regime: '',
    status: '',
    unidade: ''
  });
  const [unidades, setUnidades] = useState<Array<{id: string, nome: string}>>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(20);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [colaboradorEditando, setColaboradorEditando] = useState<string | undefined>();
  const [mostrarDescontos, setMostrarDescontos] = useState<{
    colaboradorId: string;
    nomeColaborador: string;
  } | null>(null);

  useEffect(() => {
    carregarDados();
    carregarUnidades();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar colaboradores do backend
      const colaboradoresData = await rhService.colaboradorService.listar(filtros);
      setColaboradores(colaboradoresData);
      
      // Carregar estatísticas - por enquanto vamos calcular localmente
      const statsData = {
        totalColaboradores: colaboradoresData.length,
        colaboradoresAtivos: colaboradoresData.filter(c => c.status === 'ativo').length,
        colaboradoresCLT: colaboradoresData.filter(c => c.regime_contratacao === 'clt').length,
        colaboradoresPJ: colaboradoresData.filter(c => c.regime_contratacao === 'pj').length,
        folhaMesAtual: 0
      };
      setStats(statsData);
      
      console.log('Colaboradores carregados:', colaboradoresData.length);
      
    } catch (error: any) {
      const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error) || 'Erro desconhecido';
      console.error('Erro ao carregar dados:', errorMessage);
      // Definir valores padrão em caso de erro
      setColaboradores([]);
      setStats({
        totalColaboradores: 0,
        colaboradoresAtivos: 0,
        colaboradoresCLT: 0,
        colaboradoresPJ: 0,
        folhaMesAtual: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarUnidades = async () => {
    try {
      const unidadesData = await rhService.unidadeService.listar();
      setUnidades(unidadesData);
    } catch (error: any) {
      const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error) || 'Erro desconhecido';
      console.error('Erro ao carregar unidades:', errorMessage);
      // Definir valor padrão em caso de erro
      setUnidades([]);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      const colaboradoresData = await rhService.colaboradorService.listar(filtros);
      setColaboradores(colaboradoresData);
      setPaginaAtual(1);
    } catch (error: any) {
      const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error) || 'Erro desconhecido';
      console.error('Erro ao aplicar filtros:', errorMessage);
      // Manter estado atual em caso de erro
      setColaboradores([]);
    } finally {
      setLoading(false);
    }
  };

  const colaboradoresFiltrados = colaboradores;

  // Paginação
  const totalPaginas = Math.ceil(colaboradoresFiltrados.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const colaboradoresPaginados = colaboradoresFiltrados.slice(indiceInicio, indiceFim);

  const abrirFormulario = (colaboradorId?: string) => {
    setColaboradorEditando(colaboradorId);
    setMostrarFormulario(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setColaboradorEditando(undefined);
  };

  const aoSalvarColaborador = () => {
    fecharFormulario();
    carregarDados(); // Recarregar dados
  };

  const excluirColaborador = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o colaborador ${nome}?`)) {
      try {
        await rhService.colaboradorService.excluir(id);
        alert('Colaborador excluído com sucesso!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir colaborador:', error);
        alert('Erro ao excluir colaborador');
      }
    }
  };

  const abrirDescontos = (colaboradorId: string, nomeColaborador: string) => {
    setMostrarDescontos({ colaboradorId, nomeColaborador });
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
      <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Recursos Humanos
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Gestão completa de colaboradores CLT e Prestadores
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => window.location.href = '/rh/folha-pagamento'}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">Folha de Pagamento</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/rh/banco-horas'}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">Banco de Horas</span>
          </button>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <Download className="w-5 h-5" />
            <span className="font-medium">Relatórios</span>
          </button>
          
          <button 
            onClick={() => abrirFormulario()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Novo Colaborador</span>
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Total
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats.totalColaboradores}
              </p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl shadow-sm border border-green-200/50 dark:border-green-700/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                Ativos
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {stats.colaboradoresAtivos}
              </p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-xl">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl shadow-sm border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                CLT
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats.colaboradoresCLT}
              </p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-xl">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl shadow-sm border border-orange-200/50 dark:border-orange-700/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                PJ
              </p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {stats.colaboradoresPJ}
              </p>
            </div>
            <div className="bg-orange-500/10 p-3 rounded-xl">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-6 rounded-2xl shadow-sm border border-cyan-200/50 dark:border-cyan-700/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-1">
                Folha Mensal
              </p>
              <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                R$ {stats.folhaMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-cyan-500/10 p-3 rounded-xl">
              <DollarSign className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nome, CPF ou cargo..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200"
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regime</label>
            <select
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={filtros.regime}
              onChange={(e) => setFiltros(prev => ({ ...prev, regime: e.target.value }))}
            >
              <option value="">Todos os regimes</option>
              <option value="clt">CLT</option>
              <option value="pj">PJ</option>
              <option value="autonomo">Autônomo</option>
              <option value="estagiario">Estagiário</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="afastado">Afastado</option>
              <option value="demitido">Demitido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unidade</label>
            <select
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={filtros.unidade}
              onChange={(e) => setFiltros(prev => ({ ...prev, unidade: e.target.value }))}
            >
              <option value="">Todas</option>
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.nome}>{unidade.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Colaboradores */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lista de Colaboradores
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {colaboradoresFiltrados.length} colaboradores encontrados
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {colaboradoresFiltrados.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum colaborador encontrado
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Tente ajustar os filtros ou adicionar um novo colaborador
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Regime
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Admissão
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Salário
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {colaboradoresPaginados.map((colaborador) => (
                <tr key={colaborador.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {colaborador.nome_completo}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {colaborador.cpf} • {colaborador.email_pessoal}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {colaborador.cargo}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      colaborador.regime_contratacao === 'clt' 
                        ? 'bg-purple-100 text-purple-800' 
                        : colaborador.regime_contratacao === 'pj'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {colaborador.regime_contratacao?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      colaborador.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : colaborador.status === 'inativo'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {colaborador.status.charAt(0).toUpperCase() + colaborador.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {colaborador.unidade_nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {colaborador.salario_valor 
                      ? `R$ ${colaborador.salario_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => abrirFormulario(colaborador.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => abrirDescontos(colaborador.id!, colaborador.nome_completo)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg"
                        title="Gerenciar Descontos"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirColaborador(colaborador.id!, colaborador.nome_completo)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Paginação */}
        {colaboradoresFiltrados.length > 0 && totalPaginas > 1 && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {indiceInicio + 1} a {Math.min(indiceFim, colaboradoresFiltrados.length)} de {colaboradoresFiltrados.length} colaboradores
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  {paginaAtual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulário Modal */}
      {mostrarFormulario && (
        <ColaboradorForm
          colaboradorId={colaboradorEditando}
          onSave={aoSalvarColaborador}
          onCancel={fecharFormulario}
        />
      )}

      {/* Modal de Descontos */}
      {mostrarDescontos && (
        <DescontosModal
          colaboradorId={mostrarDescontos.colaboradorId}
          nomeColaborador={mostrarDescontos.nomeColaborador}
          onClose={() => setMostrarDescontos(null)}
        />
      )}
      </div>
    </MainLayout>
  );
}

// Componente para gerenciar descontos
import { descontoService, type Desconto } from '@/lib/rhService';

interface DescontosModalProps {
  colaboradorId: string;
  nomeColaborador: string;
  onClose: () => void;
}

const DescontosModal: React.FC<DescontosModalProps> = ({ colaboradorId, nomeColaborador, onClose }) => {
  const [descontos, setDescontos] = useState<Desconto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDesconto, setEditingDesconto] = useState<Desconto | null>(null);
  const [formData, setFormData] = useState({
    tipo_desconto: '',
    descricao: '',
    valor: 0,
    tipo_valor: 'fixo' as 'fixo' | 'percentual',
    mes_referencia: new Date().getMonth() + 1,
    ano_referencia: new Date().getFullYear(),
    data_inicio: '',
    data_fim: '',
    recorrente: false
  });

  useEffect(() => {
    carregarDescontos();
  }, []);

  const carregarDescontos = async () => {
    try {
      setLoading(true);
      const data = await descontoService.listarPorColaborador(colaboradorId);
      setDescontos(data);
    } catch (error) {
      console.error('Erro ao carregar descontos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const descontoData = {
        ...formData,
        colaborador_id: colaboradorId
      };

      if (editingDesconto) {
        await descontoService.atualizar(editingDesconto.id!, descontoData);
        alert('Desconto atualizado com sucesso!');
      } else {
        await descontoService.criar(descontoData);
        alert('Desconto criado com sucesso!');
      }

      resetForm();
      carregarDescontos();
    } catch (error) {
      console.error('Erro ao salvar desconto:', error);
      alert('Erro ao salvar desconto');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_desconto: '',
      descricao: '',
      valor: 0,
      tipo_valor: 'fixo',
      mes_referencia: new Date().getMonth() + 1,
      ano_referencia: new Date().getFullYear(),
      data_inicio: '',
      data_fim: '',
      recorrente: false
    });
    setEditingDesconto(null);
    setShowForm(false);
  };

  const editarDesconto = (desconto: Desconto) => {
    setFormData({
      tipo_desconto: desconto.tipo_desconto,
      descricao: desconto.descricao || '',
      valor: desconto.valor,
      tipo_valor: desconto.tipo_valor,
      mes_referencia: desconto.mes_referencia || new Date().getMonth() + 1,
      ano_referencia: desconto.ano_referencia || new Date().getFullYear(),
      data_inicio: desconto.data_inicio || '',
      data_fim: desconto.data_fim || '',
      recorrente: desconto.recorrente || false
    });
    setEditingDesconto(desconto);
    setShowForm(true);
  };

  const excluirDesconto = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este desconto?')) {
      try {
        await descontoService.excluir(id);
        alert('Desconto excluído com sucesso!');
        carregarDescontos();
      } catch (error) {
        console.error('Erro ao excluir desconto:', error);
        alert('Erro ao excluir desconto');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gerenciar Descontos
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {nomeColaborador}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lista de Descontos
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Novo Desconto
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mb-6">
              <h4 className="text-lg font-semibold mb-4">
                {editingDesconto ? 'Editar Desconto' : 'Novo Desconto'}
              </h4>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Desconto</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.tipo_desconto}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_desconto: e.target.value }))}
                    placeholder="Ex: Vale Transporte, Plano Saúde..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.valor}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) }))}
                      required
                    />
                    <select
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.tipo_valor}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo_valor: e.target.value as 'fixo' | 'percentual' }))}
                    >
                      <option value="fixo">R$</option>
                      <option value="percentual">%</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição adicional..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mês/Ano Referência</label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.mes_referencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, mes_referencia: parseInt(e.target.value) }))}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.ano_referencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, ano_referencia: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.recorrente}
                      onChange={(e) => setFormData(prev => ({ ...prev, recorrente: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Desconto recorrente</span>
                  </label>
                </div>

                <div className="md:col-span-2 flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingDesconto ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {descontos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum desconto cadastrado
                </div>
              ) : (
                descontos.map((desconto) => (
                  <div key={desconto.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {desconto.tipo_desconto}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {desconto.tipo_valor === 'percentual' 
                            ? `${desconto.valor}%`
                            : `R$ ${desconto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          }
                          {desconto.recorrente && ' • Recorrente'}
                          {desconto.mes_referencia && ` • ${desconto.mes_referencia}/${desconto.ano_referencia}`}
                        </p>
                        {desconto.descricao && (
                          <p className="text-sm text-gray-500 mt-1">{desconto.descricao}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarDesconto(desconto)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => excluirDesconto(desconto.id!)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
