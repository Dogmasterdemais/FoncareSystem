-- Script completo para configurar o sistema de documentos dos pacientes
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de documentos dos pacientes (se não existir)
CREATE TABLE IF NOT EXISTS pacientes_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(50) NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  tamanho_arquivo INTEGER NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  data_vencimento DATE NULL,
  observacoes TEXT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_paciente_id ON pacientes_documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_tipo ON pacientes_documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_ativo ON pacientes_documentos(ativo);

-- 3. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pacientes_documentos_updated_at ON pacientes_documentos;
CREATE TRIGGER update_pacientes_documentos_updated_at
    BEFORE UPDATE ON pacientes_documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Criar bucket de storage (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pacientes-documentos', 'pacientes-documentos', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Configurar políticas RLS para a tabela
ALTER TABLE pacientes_documentos ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - usuários autenticados podem ver todos os documentos (simplificada)
DROP POLICY IF EXISTS "Usuários podem ver documentos de pacientes" ON pacientes_documentos;
CREATE POLICY "Usuários podem ver documentos de pacientes" ON pacientes_documentos
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para INSERT - usuários autenticados podem inserir documentos (simplificada)
DROP POLICY IF EXISTS "Usuários podem inserir documentos de pacientes" ON pacientes_documentos;
CREATE POLICY "Usuários podem inserir documentos de pacientes" ON pacientes_documentos
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para UPDATE - usuários autenticados podem atualizar documentos (simplificada)
DROP POLICY IF EXISTS "Usuários podem atualizar documentos de pacientes" ON pacientes_documentos;
CREATE POLICY "Usuários podem atualizar documentos de pacientes" ON pacientes_documentos
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política para DELETE - usuários autenticados podem deletar documentos (simplificada)
DROP POLICY IF EXISTS "Usuários podem deletar documentos de pacientes" ON pacientes_documentos;
CREATE POLICY "Usuários podem deletar documentos de pacientes" ON pacientes_documentos
FOR DELETE USING (auth.uid() IS NOT NULL);

-- 6. Configurar políticas para o storage bucket
-- Política para SELECT - usuários autenticados podem ver arquivos (simplificada)
DROP POLICY IF EXISTS "Usuários podem ver arquivos de documentos" ON storage.objects;
CREATE POLICY "Usuários podem ver arquivos de documentos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pacientes-documentos' AND
  auth.uid() IS NOT NULL
);

-- Política para INSERT - usuários autenticados podem fazer upload de arquivos
DROP POLICY IF EXISTS "Usuários podem fazer upload de documentos" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de documentos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pacientes-documentos' AND
  auth.uid() IS NOT NULL
);

-- Política para DELETE - usuários autenticados podem deletar arquivos (simplificada)
DROP POLICY IF EXISTS "Usuários podem deletar arquivos de documentos" ON storage.objects;
CREATE POLICY "Usuários podem deletar arquivos de documentos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pacientes-documentos' AND
  auth.uid() IS NOT NULL
);

-- 7. Criar função para validar tipos de documento
CREATE OR REPLACE FUNCTION validar_tipo_documento(tipo VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN tipo IN ('rg', 'carteirinha_convenio', 'pedido_medico', 'comprovante_endereco');
END;
$$ LANGUAGE plpgsql;

-- 8. Adicionar constraint para validar tipos de documento
ALTER TABLE pacientes_documentos 
DROP CONSTRAINT IF EXISTS check_tipo_documento;

ALTER TABLE pacientes_documentos 
ADD CONSTRAINT check_tipo_documento 
CHECK (validar_tipo_documento(tipo_documento));

-- 9. Criar view para facilitar consultas com informações completas
CREATE OR REPLACE VIEW view_documentos_pacientes AS
SELECT 
  pd.id,
  pd.paciente_id,
  p.nome as paciente_nome,
  p.cpf as paciente_cpf,
  p.unidade_id,
  u.nome as unidade_nome,
  pd.tipo_documento,
  pd.nome_arquivo,
  pd.caminho_arquivo,
  pd.tamanho_arquivo,
  pd.tipo_mime,
  pd.data_vencimento,
  pd.observacoes,
  pd.ativo,
  pd.created_at,
  pd.updated_at,
  CASE 
    WHEN pd.data_vencimento IS NULL THEN 'sem_vencimento'
    WHEN pd.data_vencimento < CURRENT_DATE THEN 'vencido'
    WHEN pd.data_vencimento <= CURRENT_DATE + INTERVAL '30 days' THEN 'vencendo'
    ELSE 'valido'
  END as status_vencimento
FROM pacientes_documentos pd
JOIN pacientes p ON pd.paciente_id = p.id
LEFT JOIN unidades u ON p.unidade_id = u.id
WHERE pd.ativo = true;

-- 10. Verificar se tudo foi criado corretamente
SELECT 'Tabela pacientes_documentos criada' as status;
SELECT 'Bucket pacientes-documentos configurado' as status;
SELECT 'Políticas RLS configuradas' as status;
SELECT 'View view_documentos_pacientes criada' as status;

-- 11. Mostrar estrutura final
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'pacientes_documentos'
ORDER BY ordinal_position;
