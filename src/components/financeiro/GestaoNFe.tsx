import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import FocusNFeService, { extrairEnderecoCompleto, formatarDocumento, calcularISS } from '../../services/focusNFeService';
import { 
  FileText, 
  Plus, 
  Send, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  X,
  Lock
} from 'lucide-react';

// Configuração Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Interface para NFe do banco
interface NFe {
  id: string;
  numero_nfe: string;
  destinatario_nome: string;
  destinatario_documento: string;
  destinatario_email?: string;
  destinatario_endereco: string;
  destinatario_telefone?: string;
  natureza_operacao: string;
  codigo_servico: string;
  valor_servicos: number;
  aliquota_iss: number;
  valor_iss: number;
  valor_liquido: number;
  pis: number;
  cofins: number;
  irrf: number;
  csll: number;
  discriminacao_servicos: string;
  observacoes?: string;
  data_emissao: string;
  status: 'rascunho' | 'processando' | 'autorizada' | 'cancelada' | 'erro';
  chave_acesso?: string;
  protocolo?: string;
  erro_processamento?: string;
  created_at: string;
  updated_at: string;
}

// Interface para criar nova NFe
interface NovaNFe {
  destinatario_nome: string;
  destinatario_documento: string;
  destinatario_email: string;
  destinatario_endereco: string;
  destinatario_telefone: string;
  natureza_operacao: string;
  codigo_servico: string;
  valor_servicos: string;
  aliquota_iss: string;
  // Campos fiscais fixos - não editáveis
  pis: string;
  cofins: string;
  irrf: string;
  csll: string;
  discriminacao_servicos: string;
  observacoes: string;
}

// Interface para filtros
interface FiltrosNFe {
  destinatario_nome: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  numero_nfe: string;
}

export const GestaoNFe: React.FC = () => {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [focusNFeService] = useState(() => new FocusNFeService());
  const [filtros, setFiltros] = useState<FiltrosNFe>({
    destinatario_nome: '',
    status: '',
    data_inicio: '',
    data_fim: '',
    numero_nfe: ''
  });

  const [novaNFe, setNovaNFe] = useState<NovaNFe>({
    destinatario_nome: '',
    destinatario_documento: '',
    destinatario_email: '',
    destinatario_endereco: '',
    destinatario_telefone: '',
    natureza_operacao: 'Prestação de Serviços',
    codigo_servico: '04472',
    valor_servicos: '',
    aliquota_iss: '2.00',
    // Campos fiscais fixos
    pis: '0.65',
    cofins: '3.00',
    irrf: '1.50',
    csll: '1.00',
    discriminacao_servicos: '',
    observacoes: ''
  });

  // Função para calcular valores fiscais
  const calcularValoresFiscais = (valorServicos: number) => {
    const iss = (valorServicos * parseFloat(novaNFe.aliquota_iss)) / 100;
    const pis = (valorServicos * parseFloat(novaNFe.pis)) / 100;
    const cofins = (valorServicos * parseFloat(novaNFe.cofins)) / 100;
    const irrf = (valorServicos * parseFloat(novaNFe.irrf)) / 100;
    const csll = (valorServicos * parseFloat(novaNFe.csll)) / 100;
    
    const totalImpostos = iss + pis + cofins + irrf + csll;
    const valorLiquido = valorServicos - totalImpostos;
    
    return {
      iss,
      pis,
      cofins,
      irrf,
      csll,
      totalImpostos,
      valorLiquido
    };
  };

  // Carregar NFes
  const carregarNFes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('nfes')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.destinatario_nome) {
        query = query.ilike('destinatario_nome', `%${filtros.destinatario_nome}%`);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.numero_nfe) {
        query = query.ilike('numero_nfe', `%${filtros.numero_nfe}%`);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_emissao', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_emissao', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNfes(data || []);
    } catch (error) {
      console.error('Erro ao carregar NFes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    carregarNFes();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    carregarNFes();
  }, [filtros]);

  // Buscar CEP
  const buscarCEP = async (cep: string) => {
    if (cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        const enderecoCompleto = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        setNovaNFe(prev => ({
          ...prev,
          destinatario_endereco: enderecoCompleto
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Carregar dados para edição
  const carregarParaEdicao = (nfe: NFe) => {
    setNovaNFe({
      destinatario_nome: nfe.destinatario_nome,
      destinatario_documento: nfe.destinatario_documento,
      destinatario_email: nfe.destinatario_email || '',
      destinatario_endereco: nfe.destinatario_endereco,
      destinatario_telefone: nfe.destinatario_telefone || '',
      natureza_operacao: nfe.natureza_operacao,
      codigo_servico: nfe.codigo_servico,
      valor_servicos: nfe.valor_servicos.toString(),
      aliquota_iss: '2.00',
      // Campos fiscais fixos
      pis: '0.65',
      cofins: '3.00',
      irrf: '1.50',
      csll: '1.00',
      discriminacao_servicos: nfe.discriminacao_servicos,
      observacoes: nfe.observacoes || ''
    });
    setEditingId(nfe.id);
    setShowModal(true);
  };

  // Salvar NFe
  const salvarNFe = async () => {
    try {
      const valorServicos = parseFloat(novaNFe.valor_servicos);
      const valores = calcularValoresFiscais(valorServicos);

      const nfeData = {
        destinatario_nome: novaNFe.destinatario_nome,
        destinatario_documento: formatarDocumento(novaNFe.destinatario_documento),
        destinatario_email: novaNFe.destinatario_email || null,
        destinatario_endereco: novaNFe.destinatario_endereco,
        destinatario_telefone: novaNFe.destinatario_telefone || null,
        natureza_operacao: novaNFe.natureza_operacao,
        codigo_servico: novaNFe.codigo_servico,
        valor_servicos: valorServicos,
        aliquota_iss: parseFloat(novaNFe.aliquota_iss),
        valor_iss: valores.iss,
        pis: parseFloat(novaNFe.pis),
        cofins: parseFloat(novaNFe.cofins),
        irrf: parseFloat(novaNFe.irrf),
        csll: parseFloat(novaNFe.csll),
        valor_liquido: valores.valorLiquido,
        discriminacao_servicos: novaNFe.discriminacao_servicos,
        observacoes: novaNFe.observacoes || null,
        data_emissao: new Date().toISOString().split('T')[0],
        status: 'rascunho' as const
      };

      if (editingId) {
        const { error } = await supabase
          .from('nfes')
          .update(nfeData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('nfes')
          .insert([nfeData]);
        if (error) throw error;
      }

      setShowModal(false);
      setEditingId(null);
      limparFormulario();
      carregarNFes();
    } catch (error) {
      console.error('Erro ao salvar NFe:', error);
      alert('Erro ao salvar NFe. Verifique os dados e tente novamente.');
    }
  };

  // Processar NFe (enviar para Focus NFe)
  const processarNFe = async (nfe: NFe) => {
    if (!confirm('Deseja transmitir esta NFe para a SEFAZ?')) return;

    try {
      // Atualizar status para processando
      await supabase
        .from('nfes')
        .update({ status: 'processando' })
        .eq('id', nfe.id);

      carregarNFes(); // Atualizar lista

      // Preparar dados para Focus NFe
      const dados = {
        natureza_operacao: nfe.natureza_operacao,
        data_emissao: nfe.data_emissao,
        discriminacao: nfe.discriminacao_servicos,
        cpf_cnpj_tomador: nfe.destinatario_documento,
        razao_social_tomador: nfe.destinatario_nome,
        logradouro_tomador: extrairEnderecoCompleto(nfe.destinatario_endereco).logradouro,
        numero_tomador: extrairEnderecoCompleto(nfe.destinatario_endereco).numero,
        bairro_tomador: extrairEnderecoCompleto(nfe.destinatario_endereco).bairro,
        codigo_municipio_tomador: '3550308', // São Paulo - ajustar conforme necessário
        uf_tomador: 'SP', // Ajustar conforme necessário
        cep_tomador: extrairEnderecoCompleto(nfe.destinatario_endereco).cep || '01000000',
        email_tomador: nfe.destinatario_email,
        telefone_tomador: nfe.destinatario_telefone,
        valor_servicos: nfe.valor_servicos,
        observacoes: nfe.observacoes
      };

      // Transmitir NFe
      const resultado = await focusNFeService.emitirNFSe(dados);

      if (resultado.sucesso) {
        // Atualizar NFe com dados de retorno
        await supabase
          .from('nfes')
          .update({ 
            status: 'autorizada',
            chave_acesso: resultado.chaveAcesso || resultado.nfeId || `FOCUS_${resultado.nfeId || Date.now()}`,
            protocolo: resultado.protocolo,
            observacoes: (nfe.observacoes || '') + `\n\nReferência Focus NFe: ${resultado.nfeId}`
          })
          .eq('id', nfe.id);

        alert(`
✅ NFe transmitida com sucesso!

🔑 Chave de Acesso: ${resultado.chaveAcesso || resultado.nfeId}
📋 Protocolo: ${resultado.protocolo}
🏷️ Referência: ${resultado.nfeId}
📧 Status: Autorizada

A NFe foi enviada para a SEFAZ e está disponível para download.
        `);

        // Enviar por email se disponível
        if (nfe.destinatario_email && (resultado.nfeId)) {
          try {
            const referenciaParaEmail = resultado.nfeId;
            await focusNFeService.enviarPorEmail(referenciaParaEmail, [nfe.destinatario_email]);
            alert('📧 NFe também foi enviada por email para o destinatário!');
          } catch (emailError) {
            console.warn('Erro ao enviar email:', emailError);
          }
        }
      } else {
        // Erro na transmissão
        await supabase
          .from('nfes')
          .update({ 
            status: 'erro',
            erro_processamento: resultado.mensagem
          })
          .eq('id', nfe.id);

        alert(`❌ Erro na transmissão: ${resultado.mensagem}`);
      }

      carregarNFes();
    } catch (error) {
      console.error('Erro ao processar NFe:', error);
      
      // Reverter status em caso de erro
      await supabase
        .from('nfes')
        .update({ 
          status: 'erro',
          erro_processamento: 'Erro interno do sistema'
        })
        .eq('id', nfe.id);

      alert('Erro ao processar NFe. Tente novamente.');
      carregarNFes();
    }
  };

  // Excluir NFe
  const excluirNFe = async (id: string) => {
    if (!confirm('Deseja excluir esta NFe? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('nfes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      carregarNFes();
    } catch (error) {
      console.error('Erro ao excluir NFe:', error);
      alert('Erro ao excluir NFe.');
    }
  };

  // Limpar formulário
  const limparFormulario = () => {
    setNovaNFe({
      destinatario_nome: '',
      destinatario_documento: '',
      destinatario_email: '',
      destinatario_endereco: '',
      destinatario_telefone: '',
      natureza_operacao: 'Prestação de Serviços',
      codigo_servico: '04472',
      valor_servicos: '',
      aliquota_iss: '2.00',
      // Campos fiscais fixos
      pis: '0.65',
      cofins: '3.00',
      irrf: '1.50',
      csll: '1.00',
      discriminacao_servicos: '',
      observacoes: ''
    });
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'text-gray-600 bg-gray-100';
      case 'processando': return 'text-blue-600 bg-blue-100';
      case 'autorizada': return 'text-green-600 bg-green-100';
      case 'cancelada': return 'text-orange-600 bg-orange-100';
      case 'erro': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rascunho': return <Edit className="w-4 h-4" />;
      case 'processando': return <Clock className="w-4 h-4" />;
      case 'autorizada': return <CheckCircle className="w-4 h-4" />;
      case 'cancelada': return <XCircle className="w-4 h-4" />;
      case 'erro': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Gestão de NFe
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Emissão e controle de Notas Fiscais Eletrônicas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              limparFormulario();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova NFe
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente
              </label>
              <input
                type="text"
                value={filtros.destinatario_nome}
                onChange={(e) => setFiltros({ ...filtros, destinatario_nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Nome do cliente..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos</option>
                <option value="rascunho">Rascunho</option>
                <option value="processando">Processando</option>
                <option value="autorizada">Autorizada</option>
                <option value="cancelada">Cancelada</option>
                <option value="erro">Erro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número NFe
              </label>
              <input
                type="text"
                value={filtros.numero_nfe}
                onChange={(e) => setFiltros({ ...filtros, numero_nfe: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Número da NFe..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de NFes */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando NFes...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    NFe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {nfes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Nenhuma NFe encontrada</p>
                      <p>Clique em "Nova NFe" para criar sua primeira nota fiscal</p>
                    </td>
                  </tr>
                ) : (
                  nfes.map((nfe) => (
                    <tr key={nfe.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {nfe.numero_nfe || 'Rascunho'}
                          </div>
                          {nfe.chave_acesso && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {nfe.chave_acesso.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {nfe.destinatario_nome}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatarDocumento(nfe.destinatario_documento)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          R$ {nfe.valor_servicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Líq: R$ {nfe.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(nfe.data_emissao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(nfe.status)}`}>
                          {getStatusIcon(nfe.status)}
                          {nfe.status.charAt(0).toUpperCase() + nfe.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {nfe.status === 'rascunho' && (
                            <>
                              <button
                                onClick={() => carregarParaEdicao(nfe)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => processarNFe(nfe)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Transmitir"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {nfe.status === 'autorizada' && nfe.chave_acesso && (
                            <button
                              onClick={() => window.open(`https://www.sefaz.sp.gov.br/nfse/contribuinte/download.aspx?chave=${nfe.chave_acesso}`, '_blank')}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => alert(`NFe: ${nfe.numero_nfe || 'Rascunho'}\nCliente: ${nfe.destinatario_nome}\nValor: R$ ${nfe.valor_servicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nStatus: ${nfe.status}\n${nfe.chave_acesso ? `\nChave: ${nfe.chave_acesso}` : ''}`)}
                            className="text-gray-600 hover:text-gray-800 p-1"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {nfe.status === 'rascunho' && (
                            <button
                              onClick={() => excluirNFe(nfe.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Editar NFe' : 'Nova NFe'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  limparFormulario();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Dados do Destinatário */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Dados do Destinatário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome/Razão Social *
                    </label>
                    <input
                      type="text"
                      value={novaNFe.destinatario_nome}
                      onChange={(e) => setNovaNFe({ ...novaNFe, destinatario_nome: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CPF/CNPJ *
                    </label>
                    <input
                      type="text"
                      value={novaNFe.destinatario_documento}
                      onChange={(e) => setNovaNFe({ ...novaNFe, destinatario_documento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={novaNFe.destinatario_email}
                      onChange={(e) => setNovaNFe({ ...novaNFe, destinatario_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={novaNFe.destinatario_telefone}
                      onChange={(e) => setNovaNFe({ ...novaNFe, destinatario_telefone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endereço Completo *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="CEP"
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        onBlur={(e) => buscarCEP(e.target.value.replace(/\D/g, ''))}
                      />
                      <input
                        type="text"
                        value={novaNFe.destinatario_endereco}
                        onChange={(e) => setNovaNFe({ ...novaNFe, destinatario_endereco: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Endereço completo..."
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados dos Serviços */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Dados dos Serviços
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Natureza da Operação
                    </label>
                    <input
                      type="text"
                      value={novaNFe.natureza_operacao}
                      onChange={(e) => setNovaNFe({ ...novaNFe, natureza_operacao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-500" />
                      Código do Serviço (Fixo)
                    </label>
                    <input
                      type="text"
                      value={novaNFe.codigo_servico}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valor dos Serviços *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={novaNFe.valor_servicos}
                      onChange={(e) => setNovaNFe({ ...novaNFe, valor_servicos: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-500" />
                      Alíquota ISS (Fixo)
                    </label>
                    <input
                      type="text"
                      value={`${novaNFe.aliquota_iss}%`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Campos Fiscais Fixos */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-500" />
                    Tributos Fixos (Não Editáveis)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        PIS
                      </label>
                      <input
                        type="text"
                        value={`${novaNFe.pis}%`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        COFINS
                      </label>
                      <input
                        type="text"
                        value={`${novaNFe.cofins}%`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        IRRF
                      </label>
                      <input
                        type="text"
                        value={`${novaNFe.irrf}%`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CSLL/CRF
                      </label>
                      <input
                        type="text"
                        value={`${novaNFe.csll}%`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo Fiscal */}
                {novaNFe.valor_servicos && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      💰 Resumo Fiscal
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      {(() => {
                        const valores = calcularValoresFiscais(parseFloat(novaNFe.valor_servicos || '0'));
                        return (
                          <>
                            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                              <div className="text-gray-600 dark:text-gray-400">Valor Bruto</div>
                              <div className="font-bold text-blue-600">
                                R$ {parseFloat(novaNFe.valor_servicos || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                              <div className="text-gray-600 dark:text-gray-400">ISS (2%)</div>
                              <div className="font-medium text-orange-600">
                                R$ {valores.iss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                              <div className="text-gray-600 dark:text-gray-400">PIS (0,65%)</div>
                              <div className="font-medium text-red-600">
                                R$ {valores.pis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                              <div className="text-gray-600 dark:text-gray-400">COFINS (3%)</div>
                              <div className="font-medium text-red-600">
                                R$ {valores.cofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                              <div className="text-gray-600 dark:text-gray-400">IRRF (1,5%)</div>
                              <div className="font-medium text-red-600">
                                R$ {valores.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                              <div className="text-gray-600 dark:text-gray-400">CSLL (1%)</div>
                              <div className="font-medium text-red-600">
                                R$ {valores.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-600">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total de Impostos:</span>
                        <span className="font-medium text-red-600">
                          R$ {calcularValoresFiscais(parseFloat(novaNFe.valor_servicos || '0')).totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Valor Líquido:</span>
                        <span className="text-lg font-bold text-green-600">
                          R$ {calcularValoresFiscais(parseFloat(novaNFe.valor_servicos || '0')).valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Descrição dos Serviços */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discriminação dos Serviços *
                </label>
                <textarea
                  value={novaNFe.discriminacao_servicos}
                  onChange={(e) => setNovaNFe({ ...novaNFe, discriminacao_servicos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  required
                  placeholder="Descreva detalhadamente os serviços prestados..."
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={novaNFe.observacoes}
                  onChange={(e) => setNovaNFe({ ...novaNFe, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Informações complementares..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  limparFormulario();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarNFe}
                disabled={!novaNFe.destinatario_nome || !novaNFe.destinatario_documento || !novaNFe.valor_servicos || !novaNFe.discriminacao_servicos}
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

export default GestaoNFe;
