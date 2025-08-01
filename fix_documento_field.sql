-- Script para executar migração no Supabase
-- Copie e execute este script no SQL Editor do Supabase

-- Adicionar campo documento à tabela pacientes
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS documento VARCHAR(20);

-- Criar índice para o campo documento
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);

-- Atualizar comentário
COMMENT ON COLUMN pacientes.documento IS 'Documento geral (pode ser usado para outros tipos de documento)';

-- Verificar se o campo foi adicionado
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pacientes' 
AND column_name = 'documento';
