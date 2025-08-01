-- EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR
-- Para corrigir a coluna mime_type na tabela pacientes_documentos

-- Adicionar a coluna mime_type se não existir
ALTER TABLE pacientes_documentos 
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

-- Verificar se foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pacientes_documentos' 
AND column_name = 'mime_type';
