-- Verificar se a tabela pacientes_documentos existe e sua estrutura
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pacientes_documentos') 
        THEN '✅ Tabela pacientes_documentos existe'
        ELSE '❌ Tabela pacientes_documentos NÃO existe'
    END as status_tabela;

-- 2. Se existir, mostrar estrutura atual
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'pacientes_documentos'
ORDER BY ordinal_position;

-- 3. Se não existir, criar a tabela completa
CREATE TABLE IF NOT EXISTS pacientes_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(50) NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  tamanho_arquivo BIGINT,
  mime_type VARCHAR(100),
  data_vencimento DATE,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- 3.1. Se a tabela já existir, adicionar colunas que podem estar faltando
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS tamanho_arquivo BIGINT;
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS data_vencimento DATE;
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 4. Criar constraints
ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS pacientes_documentos_tipo_documento_check;
ALTER TABLE pacientes_documentos 
ADD CONSTRAINT pacientes_documentos_tipo_documento_check 
CHECK (tipo_documento IN ('rg', 'carteirinha_convenio', 'pedido_medico', 'comprovante_endereco'));

ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS pacientes_documentos_status_check;
ALTER TABLE pacientes_documentos 
ADD CONSTRAINT pacientes_documentos_status_check 
CHECK (status IN ('ativo', 'inativo', 'excluido'));

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_paciente ON pacientes_documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_tipo ON pacientes_documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_status ON pacientes_documentos(status);

-- 6. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'pacientes_documentos'
ORDER BY ordinal_position;
