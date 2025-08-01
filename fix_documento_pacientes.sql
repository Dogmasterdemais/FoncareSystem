-- Script para corrigir o campo documento na tabela pacientes
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se o campo documento existe
DO $$
BEGIN
    -- Verificar se a coluna documento existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pacientes' 
        AND column_name = 'documento'
    ) THEN
        -- Adicionar o campo documento se não existir
        ALTER TABLE pacientes ADD COLUMN documento VARCHAR(20);
        
        -- Criar índice para melhor performance
        CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);
        
        -- Adicionar comentário explicativo
        COMMENT ON COLUMN pacientes.documento IS 'Campo genérico para documento (pode ser CPF, RG ou outro documento)';
        
        RAISE NOTICE 'Campo documento adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Campo documento já existe na tabela pacientes.';
    END IF;
END $$;

-- 2. Verificar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pacientes'
ORDER BY ordinal_position;
