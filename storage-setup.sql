-- Configuração do Storage para documentos RH
-- Execute este SQL no painel do Supabase

-- 1. Criar bucket para documentos RH
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rh-documentos',
  'rh-documentos',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- 2. Políticas de acesso ao storage
-- Permitir que usuários autenticados façam upload
CREATE POLICY "Usuarios autenticados podem fazer upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'rh-documentos' AND 
  auth.role() = 'authenticated'
);

-- Permitir que usuários autenticados visualizem documentos
CREATE POLICY "Usuarios autenticados podem visualizar" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rh-documentos' AND 
  auth.role() = 'authenticated'
);

-- Permitir que usuários autenticados atualizem documentos
CREATE POLICY "Usuarios autenticados podem atualizar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'rh-documentos' AND 
  auth.role() = 'authenticated'
);

-- Permitir que usuários autenticados excluam documentos
CREATE POLICY "Usuarios autenticados podem excluir" ON storage.objects
FOR DELETE USING (
  bucket_id = 'rh-documentos' AND 
  auth.role() = 'authenticated'
);

-- 3. Tabela para controle de documentos
CREATE TABLE IF NOT EXISTS colaboradores_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL, -- 'obrigatorio', 'complementar', 'contrato', 'advertencia'
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  tamanho_arquivo INTEGER,
  mime_type VARCHAR(100),
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_vencimento DATE,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'vencido', 'substituido', 'excluido')),
  observacoes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_colaboradores_documentos_colaborador ON colaboradores_documentos(colaborador_id);
CREATE INDEX idx_colaboradores_documentos_tipo ON colaboradores_documentos(tipo_documento);
CREATE INDEX idx_colaboradores_documentos_categoria ON colaboradores_documentos(categoria);
CREATE INDEX idx_colaboradores_documentos_status ON colaboradores_documentos(status);

-- 4. Tabela para histórico de advertências (específico para CLT)
CREATE TABLE IF NOT EXISTS colaboradores_advertencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo_advertencia VARCHAR(50) NOT NULL CHECK (tipo_advertencia IN ('verbal', 'escrita', 'suspensao')),
  motivo TEXT NOT NULL,
  descricao TEXT,
  data_aplicacao DATE NOT NULL,
  documento_path TEXT, -- Caminho para o documento digitalizado
  aplicada_por UUID REFERENCES auth.users(id),
  testemunha_1 VARCHAR(255),
  testemunha_2 VARCHAR(255),
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'revogada', 'cumprida')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para advertências
CREATE INDEX idx_advertencias_colaborador ON colaboradores_advertencias(colaborador_id);
CREATE INDEX idx_advertencias_tipo ON colaboradores_advertencias(tipo_advertencia);
CREATE INDEX idx_advertencias_data ON colaboradores_advertencias(data_aplicacao);

-- 5. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_colaboradores_documentos_updated_at 
    BEFORE UPDATE ON colaboradores_documentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colaboradores_advertencias_updated_at 
    BEFORE UPDATE ON colaboradores_advertencias 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
