-- Script para limpar colunas duplicadas na tabela pacientes_documentos
-- Execute no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT 'Estrutura atual:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'pacientes_documentos' 
ORDER BY ordinal_position;

-- 2. Remover coluna mime_type duplicada (mantendo tipo_mime)
ALTER TABLE pacientes_documentos DROP COLUMN IF EXISTS mime_type;

-- 3. Remover coluna status duplicada (mantendo ativo)
ALTER TABLE pacientes_documentos DROP COLUMN IF EXISTS status;

-- 4. Verificar estrutura final
SELECT 'Estrutura final:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'pacientes_documentos' 
ORDER BY ordinal_position;

-- 5. Atualizar constraint para usar coluna ativo
ALTER TABLE pacientes_documentos DROP CONSTRAINT IF EXISTS pacientes_documentos_ativo_check;
ALTER TABLE pacientes_documentos ADD CONSTRAINT pacientes_documentos_ativo_check 
CHECK (ativo IN (true, false));

-- 6. Criar índice para coluna ativo
CREATE INDEX IF NOT EXISTS idx_pacientes_documentos_ativo ON pacientes_documentos(ativo);
