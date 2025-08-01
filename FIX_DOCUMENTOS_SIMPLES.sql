-- Script simplificado para corrigir pacientes_documentos
-- Execute no Supabase SQL Editor

-- 1. Adicionar colunas essenciais se não existirem
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS tamanho_arquivo BIGINT;
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS data_vencimento DATE;
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE pacientes_documentos ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 2. Verificar colunas criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pacientes_documentos'
ORDER BY ordinal_position;

-- 3. Criar constraints apenas se as colunas existirem
DO $$
BEGIN
    -- Constraint para status (apenas se a coluna existir)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes_documentos' AND column_name = 'status') THEN
        -- Remover constraint antigo se existir
        ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS pacientes_documentos_status_check;
        -- Criar novo constraint
        ALTER TABLE pacientes_documentos 
        ADD CONSTRAINT pacientes_documentos_status_check 
        CHECK (status IN ('ativo', 'inativo', 'excluido'));
    END IF;
    
    -- Constraint para tipo_documento (apenas se a coluna existir)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes_documentos' AND column_name = 'tipo_documento') THEN
        -- Remover constraint antigo se existir
        ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS pacientes_documentos_tipo_documento_check;
        ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS check_tipo_documento;
        -- Criar novo constraint
        ALTER TABLE pacientes_documentos 
        ADD CONSTRAINT pacientes_documentos_tipo_documento_check 
        CHECK (tipo_documento IN (
            'rg',
            'carteirinha_convenio', 
            'pedido_medico',
            'comprovante_endereco'
        ));
    END IF;
END $$;

-- 4. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_paciente ON pacientes_documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_tipo ON pacientes_documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_status ON pacientes_documentos(status);

-- 5. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE WHEN column_name IN ('mime_type', 'status', 'tamanho_arquivo') THEN '✅' ELSE '' END as criada
FROM information_schema.columns
WHERE table_name = 'pacientes_documentos'
ORDER BY ordinal_position;
