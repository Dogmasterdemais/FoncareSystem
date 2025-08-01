import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, 
  Upload, 
  DollarSign, 
  FileText, 
  Calendar,
  Building,
  CreditCard,
  Check,
  X,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RecebimentoConvenio {
  id: string;
  convenio_nome: string;
  valor_recebido: number;
  data_recebimento: string;
  comprovante_bancario: string | null;
  numero_lote: string | null;
  observacoes: string | null;
  usuario_responsavel: string | null;
  created_at: string;
  total_atendimentos?: number;
  valor_total_pago?: number;
  valor_total_glosa?: number;
  diferenca_valor?: number;
}

interface NovoRecebimento {
  convenio_nome: string;
  valor_recebido: string;
  data_recebimento: string;
  comprovante_bancario: string;
  numero_lote: string;
  observacoes: string;
}

interface GerenciamentoRecebimentosProps {
  convenioSelecionado?: string;
  onRecebimentoAdicionado?: () => void;
}

export const GerenciamentoRecebimentos: React.FC<GerenciamentoRecebimentosProps> = ({ 
  convenioSelecionado, 
  onRecebimentoAdicionado 
}) => {
  const [recebimentos, setRecebimentos] = useState<RecebimentoConvenio[]>([]);
  const [convenios, setConvenios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [novoRecebimento, setNovoRecebimento] = useState<NovoRecebimento>({
    convenio_nome: convenioSelecionado || '',
    valor_recebido: '',
    data_recebimento: new Date().toISOString().split('T')[0],
    comprovante_bancario: '',
    numero_lote: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarRecebimentos();
    carregarConvenios();
  }, [convenioSelecionado]);

  useEffect(() => {
    if (convenioSelecionado) {
      setNovoRecebimento(prev => ({ ...prev, convenio_nome: convenioSelecionado }));
    }
  }, [convenioSelecionado]);

  const carregarRecebimentos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vw_recebimentos_consolidado')
        .select('*')
        .order('data_recebimento', { ascending: false });

      if (convenioSelecionado) {
        query = query.eq('convenio_nome', convenioSelecionado);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecebimentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar recebimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarConvenios = async () => {
    try {
      const { data } = await supabase
        .from('vw_faturamento_completo')
        .select('convenio_nome')
        .not('convenio_nome', 'is', null);
      
      const conveniosUnicos = [...new Set((data || []).map(item => item.convenio_nome))];
      setConvenios(conveniosUnicos);
    } catch (error) {
      console.error('Erro ao carregar convênios:', error);
    }
  };

  const salvarRecebimento = async () => {
    try {
      const dadosRecebimento = {
        convenio_nome: novoRecebimento.convenio_nome,
        valor_recebido: parseFloat(novoRecebimento.valor_recebido),
        data_recebimento: novoRecebimento.data_recebimento,
        comprovante_bancario: novoRecebimento.comprovante_bancario || null,
        numero_lote: novoRecebimento.numero_lote || null,
        observacoes: novoRecebimento.observacoes || null,
        usuario_responsavel: 'Sistema' // Pode ser pego do usuário logado
      };

      let result;
      if (editingId) {
        result = await supabase
          .from('recebimentos_convenios')
          .update(dadosRecebimento)
          .eq('id', editingId);
      } else {
        result = await supabase
          .from('recebimentos_convenios')
          .insert([dadosRecebimento]);
      }

      const { error } = result;
      if (error) throw error;

      setShowModal(false);
      setEditingId(null);
      setNovoRecebimento({
        convenio_nome: convenioSelecionado || '',
        valor_recebido: '',
        data_recebimento: new Date().toISOString().split('T')[0],
        comprovante_bancario: '',
        numero_lote: '',
        observacoes: ''
      });
      
      carregarRecebimentos();
      onRecebimentoAdicionado?.();

    } catch (error) {
      console.error('Erro ao salvar recebimento:', error);
      alert('Erro ao salvar recebimento. Verifique os dados e tente novamente.');
    }
  };

  const editarRecebimento = (recebimento: RecebimentoConvenio) => {
    setEditingId(recebimento.id);
    setNovoRecebimento({
      convenio_nome: recebimento.convenio_nome,
      valor_recebido: recebimento.valor_recebido.toString(),
      data_recebimento: recebimento.data_recebimento,
      comprovante_bancario: recebimento.comprovante_bancario || '',
      numero_lote: recebimento.numero_lote || '',
      observacoes: recebimento.observacoes || ''
    });
    setShowModal(true);
  };

  const excluirRecebimento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este recebimento?')) return;

    try {
      const { error } = await supabase
        .from('recebimentos_convenios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      carregarRecebimentos();
      onRecebimentoAdicionado?.();
    } catch (error) {
      console.error('Erro ao excluir recebimento:', error);
      alert('Erro ao excluir recebimento.');
    }
  };

  const valorTotalRecebido = recebimentos.reduce((sum, item) => sum + item.valor_recebido, 0);
  const valorTotalPago = recebimentos.reduce((sum, item) => sum + (item.valor_total_pago || 0), 0);
  const diferenaTotal = valorTotalRecebido - valorTotalPago;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando recebimentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Gestão de Recebimentos
            {convenioSelecionado && (
              <span className="text-lg font-normal text-blue-600 dark:text-blue-400 ml-2">
                - {convenioSelecionado}
              </span>
            )}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Controle de recebimentos com comprovantes bancários
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus size={16} />
          Novo Recebimento
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recebido</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                R$ {valorTotalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pago</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                R$ {valorTotalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${diferenaTotal >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Diferença</p>
              <p className={`text-2xl font-bold ${diferenaTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {Math.abs(diferenaTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Recebimentos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recebimentos Registrados ({recebimentos.length})
          </h4>
        </div>

        {recebimentos.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum recebimento encontrado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Convênio / Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lote / Comprovante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recebimentos.map((recebimento) => (
                  <tr key={recebimento.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {recebimento.convenio_nome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(recebimento.data_recebimento).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          R$ {recebimento.valor_recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {recebimento.valor_total_pago && recebimento.valor_total_pago > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Atendimentos: R$ {recebimento.valor_total_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {recebimento.numero_lote && (
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            Lote: {recebimento.numero_lote}
                          </div>
                        )}
                        {recebimento.comprovante_bancario && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            📎 Comprovante anexado
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {recebimento.diferenca_valor === 0 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Conciliado
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editarRecebimento(recebimento)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => excluirRecebimento(recebimento.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
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
      </div>

      {/* Modal para Novo/Editar Recebimento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingId ? 'Editar Recebimento' : 'Novo Recebimento'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Convênio *
                </label>
                <select
                  value={novoRecebimento.convenio_nome}
                  onChange={(e) => setNovoRecebimento({ ...novoRecebimento, convenio_nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Selecione um convênio</option>
                  {convenios.map(convenio => (
                    <option key={convenio} value={convenio}>{convenio}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor Recebido *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={novoRecebimento.valor_recebido}
                  onChange={(e) => setNovoRecebimento({ ...novoRecebimento, valor_recebido: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data do Recebimento *
                </label>
                <input
                  type="date"
                  value={novoRecebimento.data_recebimento}
                  onChange={(e) => setNovoRecebimento({ ...novoRecebimento, data_recebimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número do Lote
                </label>
                <input
                  type="text"
                  value={novoRecebimento.numero_lote}
                  onChange={(e) => setNovoRecebimento({ ...novoRecebimento, numero_lote: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: LOTE202501"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comprovante Bancário (URL)
                </label>
                <input
                  type="url"
                  value={novoRecebimento.comprovante_bancario}
                  onChange={(e) => setNovoRecebimento({ ...novoRecebimento, comprovante_bancario: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={novoRecebimento.observacoes}
                  onChange={(e) => setNovoRecebimento({ ...novoRecebimento, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Informações adicionais..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setNovoRecebimento({
                    convenio_nome: convenioSelecionado || '',
                    valor_recebido: '',
                    data_recebimento: new Date().toISOString().split('T')[0],
                    comprovante_bancario: '',
                    numero_lote: '',
                    observacoes: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarRecebimento}
                disabled={!novoRecebimento.convenio_nome || !novoRecebimento.valor_recebido}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
