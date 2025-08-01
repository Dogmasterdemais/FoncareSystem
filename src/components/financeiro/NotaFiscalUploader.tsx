import React, { useState, useRef } from 'react';
import { Upload, File, X, Download, Eye } from 'lucide-react';

interface NotaFiscalUploaderProps {
  contaId: string;
  onUploadSuccess?: (arquivo: any) => void;
  existingFiles?: any[];
}

export const NotaFiscalUploader: React.FC<NotaFiscalUploaderProps> = ({
  contaId,
  onUploadSuccess,
  existingFiles = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    
    // Validação de tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Apenas arquivos PDF, JPG ou PNG são permitidos');
      return;
    }

    // Validação de tamanho (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 10MB permitido');
      return;
    }

    setUploading(true);

    try {
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contaId', contaId);
      formData.append('tipo', 'nota_fiscal');

      // Simular upload - em produção, usar API real
      await new Promise(resolve => setTimeout(resolve, 2000));

      const novoArquivo = {
        id: Date.now(),
        nome: file.name,
        tamanho: file.size,
        tipo: file.type,
        dataUpload: new Date().toISOString(),
        contaId,
        url: URL.createObjectURL(file) // Em produção, seria a URL real do storage
      };

      if (onUploadSuccess) {
        onUploadSuccess(novoArquivo);
      }

      alert('Nota fiscal enviada com sucesso!');
    } catch (error) {
      alert('Erro ao enviar arquivo. Tente novamente.');
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (arquivo: any) => {
    // Em produção, fazer download real do storage
    const link = document.createElement('a');
    link.href = arquivo.url;
    link.download = arquivo.nome;
    link.click();
  };

  const handlePreview = (arquivo: any) => {
    // Abrir arquivo em nova aba para visualização
    window.open(arquivo.url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleChange}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Enviando arquivo...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Arraste a nota fiscal aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              PDF, JPG ou PNG até 10MB
            </p>
            <button
              type="button"
              onClick={onButtonClick}
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </button>
          </div>
        )}
      </div>

      {/* Lista de Arquivos Existentes */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Notas Fiscais Anexadas:</h4>
          
          {existingFiles.map((arquivo) => (
            <div
              key={arquivo.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{arquivo.nome}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(arquivo.tamanho)} • {new Date(arquivo.dataUpload).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePreview(arquivo)}
                  className="inline-flex items-center p-1 border border-transparent rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDownload(arquivo)}
                  className="inline-flex items-center p-1 border border-transparent rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
