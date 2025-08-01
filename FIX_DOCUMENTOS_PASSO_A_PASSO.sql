-- Script SUPER SIMPLES para corrigir pacientes_documentos
-- Execute LINHA POR LINHA no Supabase SQL Editor

-- PASSO 1: Verificar se tabela existe
SELECT 'Verificando tabela...' as status;
SELECT table_name FROM information_schema.tables WHERE table_name = 'pacientes_documentos';

-- PASSO 2: Criar tabela se não existir (execute este bloco inteiro)
CREATE TABLE IF NOT EXISTS pacientes_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL,
  tipo_documento VARCHAR(50) NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_arquivo TEXT NOT NULL
);

-- PASSO 3: Adicionar colunas uma por vez
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS tamanho_arquivo BIGINT;

ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS data_vencimento DATE;

ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS observacoes TEXT;

ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';

ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS updated_by UUID;

-- PASSO 4: Verificar colunas criadas
SELECT column_name FROM information_schema.columns WHERE table_name = 'pacientes_documentos' ORDER BY ordinal_position;

-- PASSO 5: Adicionar foreign key se não existir
ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS fk_pacientes_documentos_paciente;
ALTER TABLE pacientes_documentos ADD CONSTRAINT fk_pacientes_documentos_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE;

-- PASSO 6: Agora criar constraints (só depois de ter certeza que as colunas existem)
ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS pacientes_documentos_status_check;
ALTER TABLE pacientes_documentos ADD CONSTRAINT pacientes_documentos_status_check CHECK (status IN ('ativo', 'inativo', 'excluido'));

ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS pacientes_documentos_tipo_check;
ALTER TABLE pacientes_documentos ADD CONSTRAINT pacientes_documentos_tipo_check CHECK (tipo_documento IN ('rg', 'carteirinha_convenio', 'pedido_medico', 'comprovante_endereco'));

-- PASSO 7: Criar índices
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_paciente ON pacientes_documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_tipo ON pacientes_documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_status ON pacientes_documentos(status);

-- PASSO 8: Verificar estrutura final
SELECT 'Estrutura final:' as status;
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'pacientes_documentos' ORDER BY ordinal_position;
