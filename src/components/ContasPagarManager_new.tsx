"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { NotaFiscalUploader } from "./financeiro/NotaFiscalUploader";
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar,
  DollarSign,
  Building,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Save,
  Filter,
  Upload,
  Paperclip
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  categoria: 'Consumo' | 'Fixa' | 'Variavel' | 'Investimento';
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  metodo_pagamento?: string;
  observacoes?: string;
  documento?: string;
  created_at: string;
  notas_fiscais?: NotaFiscalAnexo[];
}

interface NotaFiscalAnexo {
  id: string;
  nome: string;
  url: string;
  tamanho: number;
  tipo: string;
  dataUpload: string;
}

interface ContasPagarManagerProps {
  unidadeId: string;
}

export default function ContasPagarManager({ unidadeId }: ContasPagarManagerProps) {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingContaId, setUploadingContaId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editingConta, setEditingConta] = useState<ContaPagar | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  useEffect(() => {
    loadContas();
  }, [unidadeId]);

  async function loadContas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('unidade_id', unidadeId)
        .order('data_vencimento', { ascending: true });
      
      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveConta(conta: Partial<ContaPagar>) {
    try {
      if (modalMode === 'create') {
        const { error } = await supabase
          .from('contas_pagar')
          .insert([{ ...conta, unidade_id: unidadeId }]);
        
        if (error) throw error;
      } else if (modalMode === 'edit' && editingConta) {
        const { error } = await supabase
          .from('contas_pagar')
          .update(conta)
          .eq('id', editingConta.id);
        
        if (error) throw error;
      }
      
      await loadContas();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta');
    }
  }

  async function deleteConta(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    
    try {
      const { error } = await supabase
        .from('contas_pagar')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadContas();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('Erro ao excluir conta');
    }
  }

  function openModal(mode: 'create' | 'edit' | 'view', conta?: ContaPagar) {
    setModalMode(mode);
    setEditingConta(conta || null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingConta(null);
    setModalMode('create');
  }

  function handleUploadClick(contaId: string) {
    setUploadingContaId(contaId);
    setShowUploadModal(true);
  }

  function closeUploadModal() {
    setShowUploadModal(false);
    setUploadingContaId(null);
  }

  async function handleUploadSuccess(arquivo: any) {
    try {
      console.log('Arquivo enviado:', arquivo);
      alert('Nota fiscal anexada com sucesso!');
      closeUploadModal();
      await loadContas();
    } catch (error) {
      console.error('Erro ao anexar nota fiscal:', error);
      alert('Erro ao anexar nota fiscal');
    }
  }

  const filteredContas = contas.filter(conta => {
    const matchesSearch = !searchTerm || 
      conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filtroStatus || conta.status === filtroStatus;
    const matchesCategoria = !filtroCategoria || conta.categoria === filtroCategoria;
    
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  // Calcular totais
  const totalPendente = filteredContas
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + c.valor, 0);
  
  const totalPago = filteredContas
    .filter(c => c.status === 'Pago')
    .reduce((sum, c) => sum + c.valor, 0);
  
  const totalAtrasado = filteredContas
    .filter(c => c.status === 'Atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <span className="font-medium text-green-900 dark:text-green-100">Pagas</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              placeholder="Buscar por descrição ou fornecedor..."
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
              <option value="Pago">Pago</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas as Categorias</option>
              <option value="Consumo">Consumo</option>
              <option value="Fixa">Fixa</option>
              <option value="Variavel">Variável</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          
          <button
            onClick={() => openModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Nova Conta
          </button>
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
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
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
                        {conta.fornecedor} • {conta.categoria}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      conta.status === 'Pago' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
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
                        onClick={() => handleUploadClick(conta.id)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Upload Nota Fiscal"
                      >
                        <Paperclip size={16} />
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
                    {conta.fornecedor}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  conta.status === 'Pago' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  conta.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  conta.status === 'Atrasado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {conta.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
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
                  {conta.categoria}
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
                    onClick={() => handleUploadClick(conta.id)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Upload Nota Fiscal"
                  >
                    <Paperclip size={16} />
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

      {/* Modal de Upload de Nota Fiscal */}
      {showUploadModal && uploadingContaId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Anexar Nota Fiscal
              </h2>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <NotaFiscalUploader
                contaId={uploadingContaId}
                onUploadSuccess={handleUploadSuccess}
                existingFiles={[]} // Em produção, carregar arquivos existentes
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
