-- Script para adicionar coluna unidade_id na tabela pacientes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna já existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'pacientes' AND column_name = 'unidade_id';

-- 2. Adicionar coluna unidade_id se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pacientes' AND column_name = 'unidade_id'
    ) THEN
        ALTER TABLE pacientes ADD COLUMN unidade_id UUID REFERENCES unidades(id);
        
        -- Adicionar comentário
        COMMENT ON COLUMN pacientes.unidade_id IS 'ID da unidade onde o paciente está cadastrado';
        
        RAISE NOTICE 'Coluna unidade_id adicionada com sucesso à tabela pacientes';
    ELSE
        RAISE NOTICE 'Coluna unidade_id já existe na tabela pacientes';
    END IF;
END $$;

-- 3. Verificar a estrutura atualizada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pacientes'
ORDER BY ordinal_position;

-- 4. Atualizar pacientes existentes com uma unidade padrão (opcional)
-- Descomente as linhas abaixo se quiser atribuir uma unidade padrão
/*
UPDATE pacientes 
SET unidade_id = (
    SELECT id FROM unidades LIMIT 1
) 
WHERE unidade_id IS NULL;
*/
