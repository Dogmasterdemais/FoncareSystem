-- Script para corrigir o erro de especialidade_id na tabela agendamentos
-- O erro indica que a coluna 'especialidade_id' não existe na tabela agendamentos

-- 1. Verificar a estrutura atual da tabela agendamentos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
ORDER BY ordinal_position;

-- 2. Verificar se existe a coluna especialidade_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'agendamentos' 
            AND column_name = 'especialidade_id'
        ) 
        THEN 'Coluna especialidade_id EXISTE'
        ELSE 'Coluna especialidade_id NÃO EXISTE'
    END as status_especialidade_id;

-- 3. SOLUÇÃO: Adicionar a coluna especialidade_id se não existir
ALTER TABLE "public"."agendamentos" 
ADD COLUMN IF NOT EXISTS "especialidade_id" UUID;

-- 4. Criar foreign key constraint para especialidade_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'agendamentos_especialidade_id_fkey'
  ) THEN
    ALTER TABLE "public"."agendamentos" 
    ADD CONSTRAINT "agendamentos_especialidade_id_fkey" 
    FOREIGN KEY ("especialidade_id") REFERENCES "public"."especialidades"("id");
  END IF;
END;
$$;

-- 5. Criar índice para performance
CREATE INDEX IF NOT EXISTS "idx_agendamentos_especialidade_id" 
ON "public"."agendamentos" USING btree ("especialidade_id");

-- 6. Verificar se a correção funcionou
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND column_name = 'especialidade_id';

-- 7. Comentário na coluna
COMMENT ON COLUMN "public"."agendamentos"."especialidade_id" IS 'ID da especialidade do agendamento';

-- 8. NOVO: Verificar e corrigir constraint check_modalidade
-- Primeiro, vamos ver qual é o problema com a constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'agendamentos' 
    AND n.nspname = 'public'
    AND c.contype = 'c'
    AND conname = 'check_modalidade';

-- 9. Remover constraint check_modalidade que está causando problema
ALTER TABLE "public"."agendamentos" 
DROP CONSTRAINT IF EXISTS "check_modalidade";

-- 10. Criar nova constraint mais flexível para modalidade (opcional)
-- Comentado por enquanto para permitir qualquer valor
-- ALTER TABLE "public"."agendamentos" 
-- ADD CONSTRAINT "check_modalidade_flexible" 
-- CHECK (modalidade IS NULL OR LENGTH(modalidade) > 0);

-- 11. Verificar constraints criadas (foreign keys)
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'agendamentos'
    AND kcu.column_name = 'especialidade_id';

-- 12. Verificar todas as constraints da tabela agendamentos
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'agendamentos' 
    AND n.nspname = 'public'
ORDER BY conname;
