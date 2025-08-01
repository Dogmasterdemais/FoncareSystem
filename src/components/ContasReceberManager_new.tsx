"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Download, 
  Eye, 
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Receipt,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  FileText,
  Search
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ContaReceber {
  id: string;
  paciente_id?: string;
  agendamento_id?: string;
  descricao: string;
  valor_bruto: number;
  valor_liquido: number;
  valor_glosa: number;
  percentual_glosa: number;
  data_vencimento: string;
  data_recebimento?: string;
  origem: 'Guia_Tabulada' | 'Particular' | 'Procedimento' | 'Exame' | 'Consulta';
  convenio_id?: string;
  status: 'Pendente' | 'Recebido' | 'Atrasado' | 'Glosa_Total' | 'Glosa_Parcial';
  metodo_recebimento?: string;
  numero_guia?: string;
  observacoes?: string;
  created_at: string;
  paciente_nome?: string;
  convenio_nome?: string;
}

interface ContasReceberProps {
  unidadeId?: string;
}

export default function ContasReceberManager({ unidadeId }: ContasReceberProps) {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');

  useEffect(() => {
    loadContas();
  }, [unidadeId]);

  async function loadContas() {
    try {
      setLoading(true);
      
      // Mock data - em produção, carregar do Supabase
      const mockData: ContaReceber[] = [
        {
          id: '1',
          descricao: 'Consulta Especialista - Cardiologia',
          paciente_nome: 'João Silva',
          valor_bruto: 350.00,
          valor_liquido: 315.00,
          valor_glosa: 35.00,
          percentual_glosa: 10,
          data_vencimento: '2024-08-15',
          origem: 'Consulta',
          convenio_nome: 'Unimed',
          status: 'Pendente',
          numero_guia: 'GU-123456',
          created_at: '2024-07-28T10:00:00Z'
        },
        {
          id: '2',
          descricao: 'Exame Ecocardiograma',
          paciente_nome: 'Maria Santos',
          valor_bruto: 280.00,
          valor_liquido: 280.00,
          valor_glosa: 0,
          percentual_glosa: 0,
          data_vencimento: '2024-08-10',
          origem: 'Exame',
          convenio_nome: 'Particular',
          status: 'Recebido',
          data_recebimento: '2024-07-30',
          created_at: '2024-07-25T14:30:00Z'
        },
        {
          id: '3',
          descricao: 'Consulta Retorno - Pneumologia',
          paciente_nome: 'Carlos Oliveira',
          valor_bruto: 180.00,
          valor_liquido: 144.00,
          valor_glosa: 36.00,
          percentual_glosa: 20,
          data_vencimento: '2024-07-20',
          origem: 'Guia_Tabulada',
          convenio_nome: 'Bradesco Saúde',
          status: 'Atrasado',
          numero_guia: 'GU-789012',
          created_at: '2024-07-15T09:15:00Z'
        }
      ];
      
      setContas(mockData);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteConta(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    
    try {
      // Em produção, fazer delete no Supabase
      setContas(contas.filter(c => c.id !== id));
      alert('Conta excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('Erro ao excluir conta');
    }
  }

  function openModal(mode: 'view' | 'edit', conta: ContaReceber) {
    // Implementar modal conforme necessário
    console.log('Abrir modal:', mode, conta);
  }

  const filteredContas = contas.filter(conta => {
    const matchesSearch = !searchTerm || 
      conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.paciente_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filtroStatus || conta.status === filtroStatus;
    const matchesOrigem = !filtroOrigem || conta.origem === filtroOrigem;
    
    return matchesSearch && matchesStatus && matchesOrigem;
  });

  // Calcular totais
  const totalPendente = filteredContas
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + c.valor_liquido, 0);
  
  const totalRecebido = filteredContas
    .filter(c => c.status === 'Recebido')
    .reduce((sum, c) => sum + c.valor_liquido, 0);
  
  const totalAtrasado = filteredContas
    .filter(c => c.status === 'Atrasado')
    .reduce((sum, c) => sum + c.valor_liquido, 0);

  const totalGlosas = filteredContas
    .reduce((sum, c) => sum + c.valor_glosa, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-900 dark:text-yellow-100">Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900 dark:text-green-100">Recebidas</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900 dark:text-red-100">Em Atraso</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            R$ {totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900 dark:text-purple-100">Glosas</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            R$ {totalGlosas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              placeholder="Buscar por descrição ou paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Recebido">Recebido</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Glosa_Total">Glosa Total</option>
              <option value="Glosa_Parcial">Glosa Parcial</option>
            </select>
            
            <select
              value={filtroOrigem}
              onChange={(e) => setFiltroOrigem(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas as Origens</option>
              <option value="Guia_Tabulada">Guia Tabulada</option>
              <option value="Particular">Particular</option>
              <option value="Procedimento">Procedimento</option>
              <option value="Exame">Exame</option>
              <option value="Consulta">Consulta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela Responsiva */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Versão Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descrição / Paciente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valores
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Origem
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vencimento
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
              {filteredContas.map((conta) => (
                <tr key={conta.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {conta.descricao}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {conta.paciente_nome}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        R$ {conta.valor_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {conta.valor_glosa > 0 && (
                        <div className="text-xs text-red-600">
                          Glosa: R$ {conta.valor_glosa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                      <div className="text-xs text-green-600 font-medium">
                        Líquido: R$ {conta.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{conta.origem.replace('_', ' ')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{conta.convenio_nome}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      conta.status === 'Recebido' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      conta.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      conta.status === 'Atrasado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {conta.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal('view', conta)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openModal('edit', conta)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteConta(conta.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
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
          {filteredContas.map((conta) => (
            <div key={conta.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {conta.descricao}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {conta.paciente_nome}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  conta.status === 'Recebido' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  conta.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  conta.status === 'Atrasado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {conta.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor Bruto</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    R$ {conta.valor_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor Líquido</p>
                  <p className="text-sm font-bold text-green-600">
                    R$ {conta.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Origem</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{conta.origem.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vencimento</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  {conta.convenio_nome}
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openModal('view', conta)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Visualizar"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openModal('edit', conta)}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteConta(conta.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredContas.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma conta a receber encontrada</p>
        </div>
      )}
    </div>
  );
}
