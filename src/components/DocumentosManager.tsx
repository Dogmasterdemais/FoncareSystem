import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { 
  documentoService, 
  contratoService, 
  advertenciaService,
  DocumentoColaborador,
  Advertencia,
  DOCUMENTOS_OBRIGATORIOS,
  DOCUMENTOS_COMPLEMENTARES
} from '../lib/documentoService';

interface DocumentosManagerProps {
  colaboradorId: string;
  nomeColaborador: string;
  tipoColaborador: 'clt' | 'pj';
  unidadeNome: string;
  onDocumentosChange?: () => void;
}

export default function DocumentosManager({
  colaboradorId,
  nomeColaborador,
  tipoColaborador,
  unidadeNome,
  onDocumentosChange
}: DocumentosManagerProps) {
  console.log('🎯 DocumentosManager iniciado:', {
    colaboradorId,
    nomeColaborador,
    tipoColaborador,
    unidadeNome
  });

  const [documentos, setDocumentos] = useState<DocumentoColaborador[]>([]);
  const [advertencias, setAdvertencias] = useState<Advertencia[]>([]);
  const [statusDocumentos, setStatusDocumentos] = useState<{
    documentos_pendentes: string[];
    documentos_vencidos: string[];
    documentos_ok: string[];
  }>({
    documentos_pendentes: [],
    documentos_vencidos: [],
    documentos_ok: []
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'obrigatorios' | 'complementares' | 'contratos' | 'advertencias'>('obrigatorios');
  
  // Estados para modais
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAdvertenciaModal, setShowAdvertenciaModal] = useState(false);
  const [selectedTipoDoc, setSelectedTipoDoc] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<'obrigatorio' | 'complementar' | 'contrato'>('obrigatorio');

  // Estados para advertências
  const [novaAdvertencia, setNovaAdvertencia] = useState({
    tipo_advertencia: 'verbal' as 'verbal' | 'escrita' | 'suspensao',
    motivo: '',
    descricao: '',
    data_aplicacao: new Date().toISOString().split('T')[0],
    testemunha_1: '',
    testemunha_2: ''
  });

  console.log('📋 Estado atual das abas:', {
    activeTab,
    documentosCount: documentos.length,
    advertenciasCount: advertencias.length
  });

  const carregarDocumentos = useCallback(async () => {
    try {
      console.log('🔄 Carregando documentos para colaborador:', colaboradorId, 'tipo:', tipoColaborador);
      
      const [docs, status, advs] = await Promise.all([
        documentoService.listarDocumentos(colaboradorId),
        documentoService.verificarDocumentosObrigatorios(colaboradorId, tipoColaborador),
        tipoColaborador === 'clt' ? advertenciaService.listarAdvertencias(colaboradorId) : Promise.resolve([])
      ]);
      
      console.log('📄 Documentos carregados:', docs);
      console.log('📊 Status documentos:', status);
      console.log('⚠️ Advertências:', advs);
      
      setDocumentos(docs);
      setStatusDocumentos(status);
      setAdvertencias(advs);
    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error);
    }
  }, [colaboradorId, tipoColaborador]);

  useEffect(() => {
    carregarDocumentos();
  }, [carregarDocumentos]);

  const handleUpload = async (file: File, tipoDocumento: string, categoria: string, dataVencimento?: string) => {
    setUploading(tipoDocumento);
    try {
      await documentoService.uploadDocumento(
        file,
        colaboradorId,
        tipoDocumento,
        categoria as any,
        unidadeNome,
        tipoColaborador,
        nomeColaborador,
        dataVencimento
      );
      
      await carregarDocumentos();
      onDocumentosChange?.();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do documento');
    } finally {
      setUploading(null);
    }
  };

  const handleVisualizarDocumento = async (caminhoArquivo: string) => {
    try {
      const url = await documentoService.obterUrlDocumento(caminhoArquivo);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      alert('Erro ao visualizar documento');
    }
  };

  const handleExcluirDocumento = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await documentoService.excluirDocumento(id);
        await carregarDocumentos();
        onDocumentosChange?.();
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
        alert('Erro ao excluir documento');
      }
    }
  };

  const handleCriarAdvertencia = async (documentoFile?: File) => {
    try {
      const advertencia = await advertenciaService.criarAdvertencia({
        colaborador_id: colaboradorId,
        ...novaAdvertencia
      });

      if (documentoFile && advertencia.id) {
        await advertenciaService.uploadDocumentoAdvertencia(
          documentoFile,
          advertencia.id,
          colaboradorId,
          unidadeNome,
          nomeColaborador
        );
      }

      await carregarDocumentos();
      setShowAdvertenciaModal(false);
      setNovaAdvertencia({
        tipo_advertencia: 'verbal',
        motivo: '',
        descricao: '',
        data_aplicacao: new Date().toISOString().split('T')[0],
        testemunha_1: '',
        testemunha_2: ''
      });
    } catch (error) {
      console.error('Erro ao criar advertência:', error);
      alert('Erro ao criar advertência');
    }
  };

  const getStatusIcon = (documento: DocumentoColaborador) => {
    if (documento.data_vencimento) {
      const vencimento = new Date(documento.data_vencimento);
      const hoje = new Date();
      const diasParaVencer = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
      
      if (diasParaVencer < 0) {
        return <div title="Vencido"><AlertTriangle className="w-4 h-4 text-red-500" /></div>;
      } else if (diasParaVencer <= 30) {
        return <div title="Vence em breve"><Clock className="w-4 h-4 text-yellow-500" /></div>;
      }
    }
    return <div title="OK"><CheckCircle className="w-4 h-4 text-green-500" /></div>;
  };

  const documentosObrigatorios = DOCUMENTOS_OBRIGATORIOS[tipoColaborador];
  const documentosComplementares = DOCUMENTOS_COMPLEMENTARES;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Gestão de Documentos - {nomeColaborador}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Documentos OK</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {statusDocumentos.documentos_ok.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-500 mr-2" />
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Vencidos</p>
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                  {statusDocumentos.documentos_vencidos.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Pendentes</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">
                  {statusDocumentos.documentos_pendentes.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => {
                console.log('🔄 Mudando para aba: obrigatorios');
                setActiveTab('obrigatorios');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'obrigatorios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Documentos Obrigatórios ({documentosObrigatorios.length})
            </button>
            <button
              onClick={() => {
                console.log('🔄 Mudando para aba: complementares');
                setActiveTab('complementares');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'complementares'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Documentos Complementares
            </button>
            <button
              onClick={() => {
                console.log('🔄 Mudando para aba: contratos');
                setActiveTab('contratos');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contratos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Contratos
            </button>
            {tipoColaborador === 'clt' && (
              <button
                onClick={() => {
                  console.log('🔄 Mudando para aba: advertencias');
                  setActiveTab('advertencias');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'advertencias'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Advertências ({advertencias.length})
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* Documentos Obrigatórios */}
          {activeTab === 'obrigatorios' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Documentos Obrigatórios
                </h4>
                <button
                  onClick={() => {
                    setSelectedCategoria('obrigatorio');
                    setShowUploadModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Documento
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentosObrigatorios.map((docConfig) => {
                  const documentoExistente = documentos.find(
                    doc => doc.tipo_documento === docConfig.tipo && doc.categoria === 'obrigatorio' && doc.status === 'ativo'
                  );

                  return (
                    <div
                      key={docConfig.tipo}
                      className={`border rounded-lg p-4 ${
                        documentoExistente
                          ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {docConfig.nome}
                          </h5>
                          {documentoExistente ? (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center">
                                {getStatusIcon(documentoExistente)}
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                  {documentoExistente.nome_arquivo}
                                </span>
                              </div>
                              {documentoExistente.data_vencimento && (
                                <p className="text-xs text-gray-500">
                                  Vence em: {new Date(documentoExistente.data_vencimento).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleVisualizarDocumento(documentoExistente.caminho_arquivo)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Visualizar"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleExcluirDocumento(documentoExistente.id!)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <p className="text-sm text-red-600 dark:text-red-400">
                                Documento não enviado
                              </p>
                              <button
                                onClick={() => {
                                  setSelectedTipoDoc(docConfig.tipo);
                                  setSelectedCategoria('obrigatorio');
                                  setShowUploadModal(true);
                                }}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Enviar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documentos Complementares */}
          {activeTab === 'complementares' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Documentos Complementares
                </h4>
                <button
                  onClick={() => {
                    console.log('🔄 Abrindo modal de upload para complementares');
                    setSelectedCategoria('complementar');
                    setShowUploadModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Documento
                </button>
              </div>

              <div className="space-y-2">
                {documentos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum documento complementar encontrado</p>
                    <p className="text-sm">Clique em "Adicionar Documento" para enviar o primeiro documento</p>
                  </div>
                ) : (
                  documentos
                    .filter(doc => doc.categoria === 'complementar' && doc.status === 'ativo')
                    .map((documento) => (
                      <div key={documento.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {documento.nome_arquivo}
                              </h5>
                              <p className="text-sm text-gray-500">
                                Tipo: {documento.tipo_documento}
                              </p>
                              {documento.data_vencimento && (
                                <p className="text-xs text-gray-500">
                                  Vence em: {new Date(documento.data_vencimento).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(documento)}
                            <button
                              onClick={() => handleVisualizarDocumento(documento.caminho_arquivo)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirDocumento(documento.id!)}
                              className="text-red-600 hover:text-red-800"
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
            </div>
          )}

          {/* Contratos */}
          {activeTab === 'contratos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Contratos
                </h4>
                <button
                  onClick={() => {
                    console.log('🔄 Abrindo modal de upload para contratos');
                    setSelectedCategoria('contrato');
                    setShowUploadModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Contrato
                </button>
              </div>

              <div className="space-y-2">
                {documentos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum contrato encontrado</p>
                    <p className="text-sm">Clique em "Adicionar Contrato" para enviar o primeiro contrato</p>
                  </div>
                ) : (
                  documentos
                    .filter(doc => doc.categoria === 'contrato' && doc.status === 'ativo')
                    .map((contrato) => (
                      <div key={contrato.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-blue-500 mr-3" />
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {contrato.nome_arquivo}
                              </h5>
                              <p className="text-sm text-gray-500">
                                Tipo: {contrato.tipo_documento}
                              </p>
                              <p className="text-xs text-gray-500">
                                Enviado em: {new Date(contrato.data_upload!).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVisualizarDocumento(contrato.caminho_arquivo)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirDocumento(contrato.id!)}
                              className="text-red-600 hover:text-red-800"
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
            </div>
          )}

          {/* Advertências (apenas para CLT) */}
          {activeTab === 'advertencias' && tipoColaborador === 'clt' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Advertências
                </h4>
                <button
                  onClick={() => setShowAdvertenciaModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Advertência
                </button>
              </div>

              <div className="space-y-2">
                {advertencias.map((advertencia) => (
                  <div key={advertencia.id} className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {advertencia.tipo_advertencia.charAt(0).toUpperCase() + advertencia.tipo_advertencia.slice(1)}
                          </h5>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            advertencia.status === 'ativa' ? 'bg-red-100 text-red-800' :
                            advertencia.status === 'cumprida' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {advertencia.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <strong>Motivo:</strong> {advertencia.motivo}
                        </p>
                        {advertencia.descricao && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {advertencia.descricao}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Data: {new Date(advertencia.data_aplicacao).toLocaleDateString('pt-BR')}
                        </p>
                        {advertencia.testemunha_1 && (
                          <p className="text-xs text-gray-500">
                            Testemunhas: {advertencia.testemunha_1}{advertencia.testemunha_2 && `, ${advertencia.testemunha_2}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {advertencia.documento_path && (
                          <button
                            onClick={() => handleVisualizarDocumento(advertencia.documento_path!)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Visualizar Documento"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          categoria={selectedCategoria}
          tipoColaborador={tipoColaborador}
          tipoDocumentoSelecionado={selectedTipoDoc}
          onUpload={handleUpload}
          uploading={uploading}
        />
      )}

      {/* Modal de Nova Advertência */}
      {showAdvertenciaModal && (
        <AdvertenciaModal
          isOpen={showAdvertenciaModal}
          onClose={() => setShowAdvertenciaModal(false)}
          advertencia={novaAdvertencia}
          onChange={setNovaAdvertencia}
          onSave={handleCriarAdvertencia}
        />
      )}
    </div>
  );
}

// Modal de Upload
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoria: 'obrigatorio' | 'complementar' | 'contrato';
  tipoColaborador: 'clt' | 'pj';
  tipoDocumentoSelecionado?: string;
  onUpload: (file: File, tipoDocumento: string, categoria: string, dataVencimento?: string) => void;
  uploading: string | null;
}

function UploadModal({ 
  isOpen, 
  onClose, 
  categoria, 
  tipoColaborador, 
  tipoDocumentoSelecionado,
  onUpload, 
  uploading 
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState(tipoDocumentoSelecionado || '');
  const [dataVencimento, setDataVencimento] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && tipoDocumento) {
      onUpload(file, tipoDocumento, categoria, dataVencimento || undefined);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload de Documento
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Documento
            </label>
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione o tipo</option>
              {categoria === 'obrigatorio' && DOCUMENTOS_OBRIGATORIOS[tipoColaborador].map(doc => (
                <option key={doc.tipo} value={doc.tipo}>{doc.nome}</option>
              ))}
              {categoria === 'complementar' && DOCUMENTOS_COMPLEMENTARES.map(doc => (
                <option key={doc.tipo} value={doc.tipo}>{doc.nome}</option>
              ))}
              {categoria === 'contrato' && (
                <>
                  <option value="contrato_trabalho">Contrato de Trabalho</option>
                  <option value="contrato_experiencia">Contrato de Experiência</option>
                  <option value="termo_aditivo">Termo Aditivo</option>
                  {tipoColaborador === 'pj' && (
                    <option value="contrato_prestacao_servicos">Contrato de Prestação de Serviços</option>
                  )}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Arquivo
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 50MB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Vencimento (opcional)
            </label>
            <input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || !tipoDocumento || uploading === tipoDocumento}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {uploading === tipoDocumento ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de Nova Advertência
interface AdvertenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertencia: any;
  onChange: (advertencia: any) => void;
  onSave: (documentoFile?: File) => void;
}

function AdvertenciaModal({ isOpen, onClose, advertencia, onChange, onSave }: AdvertenciaModalProps) {
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(documentoFile || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nova Advertência
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Advertência
            </label>
            <select
              value={advertencia.tipo_advertencia}
              onChange={(e) => onChange({ ...advertencia, tipo_advertencia: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="verbal">Advertência Verbal</option>
              <option value="escrita">Advertência Escrita</option>
              <option value="suspensao">Suspensão</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo *
            </label>
            <input
              type="text"
              value={advertencia.motivo}
              onChange={(e) => onChange({ ...advertencia, motivo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição Detalhada
            </label>
            <textarea
              value={advertencia.descricao}
              onChange={(e) => onChange({ ...advertencia, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data da Aplicação
            </label>
            <input
              type="date"
              value={advertencia.data_aplicacao}
              onChange={(e) => onChange({ ...advertencia, data_aplicacao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Testemunha 1
              </label>
              <input
                type="text"
                value={advertencia.testemunha_1}
                onChange={(e) => onChange({ ...advertencia, testemunha_1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Testemunha 2
              </label>
              <input
                type="text"
                value={advertencia.testemunha_2}
                onChange={(e) => onChange({ ...advertencia, testemunha_2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Documento Digitalizado (opcional)
            </label>
            <input
              type="file"
              onChange={(e) => setDocumentoFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Criar Advertência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
