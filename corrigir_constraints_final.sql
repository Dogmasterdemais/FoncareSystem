-- Script para corrigir constraints problemáticas na tabela agendamentos
-- Baseado na análise das constraints que estão causando erros

-- 1. Remover constraint CHECK restritiva para status_confirmacao
ALTER TABLE "public"."agendamentos" 
DROP CONSTRAINT IF EXISTS "check_status_confirmacao";

-- 2. Verificar se as colunas created_by e updated_by existem
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
    AND column_name IN ('created_by', 'updated_by', 'status_confirmacao');

-- 3. Adicionar colunas que podem estar faltando
ALTER TABLE "public"."agendamentos" 
ADD COLUMN IF NOT EXISTS "created_by" UUID;

ALTER TABLE "public"."agendamentos" 
ADD COLUMN IF NOT EXISTS "updated_by" UUID;

ALTER TABLE "public"."agendamentos" 
ADD COLUMN IF NOT EXISTS "status_confirmacao" VARCHAR(50) DEFAULT 'pendente';

-- 4. Remover foreign keys problemáticas que requerem dados obrigatórios
ALTER TABLE "public"."agendamentos" 
DROP CONSTRAINT IF EXISTS "agendamentos_created_by_fkey";

ALTER TABLE "public"."agendamentos" 
DROP CONSTRAINT IF EXISTS "agendamentos_updated_by_fkey";

-- 5. Verificar se tabela convenios tem dados, se não, remover constraint
DO $$
DECLARE
    convenios_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO convenios_count FROM convenios;
    
    IF convenios_count = 0 THEN
        RAISE NOTICE 'Tabela convenios está vazia, removendo constraint foreign key';
        ALTER TABLE "public"."agendamentos" 
        DROP CONSTRAINT IF EXISTS "agendamentos_convenio_id_fkey";
    ELSE
        RAISE NOTICE 'Tabela convenios tem % registros, mantendo constraint', convenios_count;
    END IF;
END;
$$;

-- 6. Criar nova constraint CHECK mais flexível para status_confirmacao (opcional)
ALTER TABLE "public"."agendamentos" 
ADD CONSTRAINT "check_status_confirmacao_flexible" 
CHECK (status_confirmacao IS NULL OR status_confirmacao IN ('pendente', 'confirmado', 'recusado', 'cancelado'));

-- 7. Verificar constraints restantes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        ELSE contype::text
    END as constraint_type_desc,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'agendamentos' 
    AND n.nspname = 'public'
    AND contype IN ('c', 'f')
ORDER BY contype, conname;

-- 8. Comentários nas novas colunas
COMMENT ON COLUMN "public"."agendamentos"."created_by" IS 'ID do usuário que criou o agendamento (opcional)';
COMMENT ON COLUMN "public"."agendamentos"."updated_by" IS 'ID do usuário que atualizou o agendamento (opcional)';
COMMENT ON COLUMN "public"."agendamentos"."status_confirmacao" IS 'Status de confirmação do agendamento';
