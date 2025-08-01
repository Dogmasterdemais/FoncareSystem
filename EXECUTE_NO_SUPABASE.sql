-- Script SIMPLES para corrigir tabela profissionais
-- COPIE E COLE no Supabase Dashboard > SQL Editor

-- 1. Adicionar coluna unidade_id
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS unidade_id UUID;

-- 2. Adicionar foreign key (com verificação manual)
DO $$
BEGIN
    -- Verificar se a constraint já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'profissionais_unidade_id_fkey' 
        AND table_name = 'profissionais'
    ) THEN
        ALTER TABLE profissionais 
        ADD CONSTRAINT profissionais_unidade_id_fkey 
        FOREIGN KEY (unidade_id) REFERENCES unidades(id);
    END IF;
END $$;

-- 3. Atualizar profissionais existentes para usar primeira unidade
UPDATE profissionais 
SET unidade_id = (SELECT id FROM unidades ORDER BY nome LIMIT 1) 
WHERE unidade_id IS NULL;

-- 4. Verificar resultado
SELECT 
  p.nome,
  p.email,
  e.nome as especialidade,
  u.nome as unidade
FROM profissionais p
LEFT JOIN especialidades e ON p.especialidade_id = e.id
LEFT JOIN unidades u ON p.unidade_id = u.id
WHERE p.ativo = true
ORDER BY p.nome;
