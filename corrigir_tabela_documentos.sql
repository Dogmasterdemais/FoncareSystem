-- Script para corrigir a tabela pacientes_documentos
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'pacientes_documentos'
);

-- 2. Verificar as colunas existentes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pacientes_documentos'
ORDER BY ordinal_position;

-- 3. Adicionar colunas que podem estar faltando
ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS tamanho_arquivo BIGINT;

ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS data_vencimento DATE;

ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Adicionar coluna status se não existir
ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';

-- 4. Criar constraint para tipos de documento se não existir
DO $$
BEGIN
    -- Verificar se o constraint existe
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pacientes_documentos_tipo_documento_check') THEN
        -- Remover constraint antigo se existir
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

-- 5. Criar constraint para status se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pacientes_documentos_status_check') THEN
        ALTER TABLE pacientes_documentos 
        ADD CONSTRAINT pacientes_documentos_status_check 
        CHECK (status IN ('ativo', 'inativo', 'excluido'));
    END IF;
END $$;

-- 6. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_paciente ON pacientes_documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_tipo ON pacientes_documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_status ON pacientes_documentos(status);

-- 7. Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pacientes_documentos'
ORDER BY ordinal_position;
