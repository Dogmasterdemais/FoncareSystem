"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Eye, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';
import documentosPacienteService, { 
  DocumentoPaciente, 
  TipoDocumentoPaciente, 
  TIPOS_DOCUMENTOS_PACIENTE,
  StatusDocumentosPaciente
} from '../lib/documentosPacienteService';

interface DocumentosPacienteManagerProps {
  pacienteId: string;
  pacienteNome: string;
  onDocumentosChange?: () => void;
}

export default function DocumentosPacienteManager({ 
  pacienteId, 
  pacienteNome, 
  onDocumentosChange 
}: DocumentosPacienteManagerProps) {
  const [documentos, setDocumentos] = useState<DocumentoPaciente[]>([]);
  const [statusDocumentos, setStatusDocumentos] = useState<StatusDocumentosPaciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    tipo: '' as TipoDocumentoPaciente | '',
    dataVencimento: '',
    observacoes: '',
    arquivo: null as File | null
  });

  const carregarDocumentos = useCallback(async () => {
    try {
      setLoading(true);
      const [docs, status] = await Promise.all([
        documentosPacienteService.listarDocumentos(pacienteId),
        documentosPacienteService.verificarStatusDocumentos(pacienteId)
      ]);
      
      setDocumentos(docs);
      setStatusDocumentos(status);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    carregarDocumentos();
  }, [carregarDocumentos]);

  const handleUpload = async () => {
    if (!uploadForm.arquivo || !uploadForm.tipo) {
      alert('Por favor, selecione um arquivo e o tipo de documento');
      return;
    }

    setUploading(uploadForm.tipo);
    try {
      await documentosPacienteService.uploadDocumento(
        uploadForm.arquivo,
        pacienteId,
        pacienteNome,
        uploadForm.tipo,
        uploadForm.dataVencimento || undefined,
        uploadForm.observacoes || undefined
      );

      await carregarDocumentos();
      onDocumentosChange?.();
      setShowUploadModal(false);
      setUploadForm({
        tipo: '',
        dataVencimento: '',
        observacoes: '',
        arquivo: null
      });
      
      alert('Documento enviado com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar documento: ' + (error as Error).message);
    } finally {
      setUploading(null);
    }
  };

  const handleVisualizarDocumento = async (caminhoArquivo: string) => {
    try {
      const url = await documentosPacienteService.obterUrlDocumento(caminhoArquivo);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      alert('Erro ao visualizar documento');
    }
  };

  const handleExcluirDocumento = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await documentosPacienteService.excluirDocumento(id);
        await carregarDocumentos();
        onDocumentosChange?.();
        alert('Documento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
        alert('Erro ao excluir documento');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando documentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status dos Documentos */}
      {statusDocumentos && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Status dos Documentos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800 dark:text-green-400">
                  Completos ({statusDocumentos.documentos_ok.length})
                </span>
              </div>
              {statusDocumentos.documentos_ok.map((doc, index) => (
                <div key={index} className="text-sm text-green-700 dark:text-green-300">
                  • {doc}
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-400">
                  Pendentes ({statusDocumentos.documentos_pendentes.length})
                </span>
              </div>
              {statusDocumentos.documentos_pendentes.map((doc, index) => (
                <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                  • {doc}
                </div>
              ))}
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <X className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800 dark:text-red-400">
                  Vencidos ({statusDocumentos.documentos_vencidos.length})
                </span>
              </div>
              {statusDocumentos.documentos_vencidos.map((doc, index) => (
                <div key={index} className="text-sm text-red-700 dark:text-red-300">
                  • {doc}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progresso da Documentação
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {statusDocumentos.porcentagem_completa}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${statusDocumentos.porcentagem_completa}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botão para Adicionar Documento */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Documentos Anexados ({documentos.length})
        </h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Documento
        </button>
      </div>

      {/* Lista de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentos.map((documento) => {
          const tipoConfig = TIPOS_DOCUMENTOS_PACIENTE[documento.tipo_documento];
          const isVencido = documento.data_vencimento && 
            new Date(documento.data_vencimento) < new Date();

          return (
            <div
              key={documento.id}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 shadow-md ${
                isVencido ? 'border-red-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tipoConfig.icone}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {tipoConfig.nome}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {documento.nome_arquivo}
                    </p>
                  </div>
                </div>
                {isVencido && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Vencido
                  </span>
                )}
              </div>

              {documento.data_vencimento && (
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Vencimento: {new Date(documento.data_vencimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              {documento.observacoes && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {documento.observacoes}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span>Enviado em: {new Date(documento.created_at).toLocaleDateString('pt-BR')}</span>
                <span>•</span>
                <span>{(documento.tamanho_arquivo / 1024 / 1024).toFixed(1)}MB</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleVisualizarDocumento(documento.caminho_arquivo)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Visualizar
                </button>
                <button
                  onClick={() => handleExcluirDocumento(documento.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {documentos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Nenhum documento anexado
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            Adicione os documentos obrigatórios do paciente
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Adicionar Primeiro Documento
          </button>
        </div>
      )}

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Adicionar Documento
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Documento *
                </label>
                <select
                  value={uploadForm.tipo}
                  onChange={(e) => setUploadForm(prev => ({ 
                    ...prev, 
                    tipo: e.target.value as TipoDocumentoPaciente 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Selecione o tipo</option>
                  {Object.entries(TIPOS_DOCUMENTOS_PACIENTE).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icone} {config.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arquivo *
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setUploadForm(prev => ({ 
                    ...prev, 
                    arquivo: e.target.files?.[0] || null 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: JPG, PNG, PDF, HEIC (máx. 50MB)
                </p>
              </div>

              {uploadForm.tipo && TIPOS_DOCUMENTOS_PACIENTE[uploadForm.tipo].vencimento && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={uploadForm.dataVencimento}
                    onChange={(e) => setUploadForm(prev => ({ 
                      ...prev, 
                      dataVencimento: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={uploadForm.observacoes}
                  onChange={(e) => setUploadForm(prev => ({ 
                    ...prev, 
                    observacoes: e.target.value 
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  placeholder="Informações adicionais sobre o documento..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadForm.arquivo || !uploadForm.tipo || uploading !== null}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
