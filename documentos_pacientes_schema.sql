-- Schema para documentos dos pacientes
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar tabela para documentos dos pacientes
CREATE TABLE IF NOT EXISTS pacientes_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento IN (
    'rg',
    'carteirinha_convenio', 
    'pedido_medico',
    'comprovante_endereco'
  )),
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  tamanho_arquivo BIGINT,
  mime_type VARCHAR(100),
  data_vencimento DATE, -- Para documentos que vencem (ex: carteirinha)
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'excluido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_paciente ON pacientes_documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_tipo ON pacientes_documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_status ON pacientes_documentos(status);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_created ON pacientes_documentos(created_at);

-- 3. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_pacientes_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pacientes_documentos_updated_at
  BEFORE UPDATE ON pacientes_documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_pacientes_documentos_updated_at();

-- 4. Configurar RLS (Row Level Security)
ALTER TABLE pacientes_documentos ENABLE ROW LEVEL SECURITY;

-- Política para leitura - usuários autenticados podem ver documentos
CREATE POLICY "Usuários autenticados podem visualizar documentos dos pacientes" ON pacientes_documentos
  FOR SELECT TO authenticated
  USING (true);

-- Política para inserção - usuários autenticados podem inserir documentos
CREATE POLICY "Usuários autenticados podem inserir documentos dos pacientes" ON pacientes_documentos
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Política para atualização - usuários autenticados podem atualizar documentos
CREATE POLICY "Usuários autenticados podem atualizar documentos dos pacientes" ON pacientes_documentos
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para exclusão - usuários autenticados podem excluir documentos
CREATE POLICY "Usuários autenticados podem excluir documentos dos pacientes" ON pacientes_documentos
  FOR DELETE TO authenticated
  USING (true);

-- 5. Criar bucket no Storage para documentos dos pacientes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pacientes-documentos',
  'pacientes-documentos',
  false,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/heic', 'image/heif']
) ON CONFLICT (id) DO NOTHING;

-- 6. Configurar políticas do Storage
CREATE POLICY "Usuários autenticados podem fazer upload de documentos dos pacientes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pacientes-documentos');

CREATE POLICY "Usuários autenticados podem visualizar documentos dos pacientes" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pacientes-documentos');

CREATE POLICY "Usuários autenticados podem atualizar documentos dos pacientes" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'pacientes-documentos');

CREATE POLICY "Usuários autenticados podem excluir documentos dos pacientes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pacientes-documentos');

-- 7. Verificar se tudo foi criado corretamente
SELECT 
  'Tabela pacientes_documentos' as recurso,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pacientes_documentos') 
    THEN 'Criada ✅' 
    ELSE 'Erro ❌' 
  END as status
UNION ALL
SELECT 
  'Bucket pacientes-documentos' as recurso,
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'pacientes-documentos') 
    THEN 'Criado ✅' 
    ELSE 'Erro ❌' 
  END as status;

-- 8. Comentários na tabela
COMMENT ON TABLE pacientes_documentos IS 'Armazena documentos anexados aos pacientes';
COMMENT ON COLUMN pacientes_documentos.tipo_documento IS 'Tipo do documento: rg, carteirinha_convenio, pedido_medico, comprovante_endereco';
COMMENT ON COLUMN pacientes_documentos.data_vencimento IS 'Data de vencimento do documento (opcional)';
COMMENT ON COLUMN pacientes_documentos.caminho_arquivo IS 'Caminho completo do arquivo no storage';
