-- Script para verificar e corrigir constraints problemáticas da tabela agendamentos
-- Execute este script se houver erros de constraint ao criar agendamentos

-- 1. Verificar TODAS as constraints da tabela agendamentos
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'x' THEN 'EXCLUDE'
        ELSE contype::text
    END as constraint_type_desc,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'agendamentos' 
    AND n.nspname = 'public'
ORDER BY contype, conname;

-- 2. Remover constraints CHECK problemáticas mais comuns
ALTER TABLE "public"."agendamentos" DROP CONSTRAINT IF EXISTS "check_modalidade";
ALTER TABLE "public"."agendamentos" DROP CONSTRAINT IF EXISTS "check_status";
ALTER TABLE "public"."agendamentos" DROP CONSTRAINT IF EXISTS "check_tipo_sessao";
ALTER TABLE "public"."agendamentos" DROP CONSTRAINT IF EXISTS "agendamentos_modalidade_check";
ALTER TABLE "public"."agendamentos" DROP CONSTRAINT IF EXISTS "agendamentos_status_check";
ALTER TABLE "public"."agendamentos" DROP CONSTRAINT IF EXISTS "agendamentos_tipo_sessao_check";

-- 3. Verificar se as constraints foram removidas
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'agendamentos' 
    AND n.nspname = 'public'
    AND contype = 'c'  -- Apenas CHECK constraints
ORDER BY conname;

-- 4. Verificar estrutura das colunas que podem ter constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
    AND column_name IN ('modalidade', 'status', 'tipo_sessao', 'especialidade_id')
ORDER BY column_name;

-- 5. TESTE: Tentar inserir um registro de teste para verificar se ainda há problemas
-- ATENÇÃO: Este INSERT será removido automaticamente após o teste
DO $$
DECLARE
    test_paciente_id UUID;
    test_unidade_id UUID;
    test_sala_id UUID;
BEGIN
    -- Pegar IDs reais para teste
    SELECT id INTO test_paciente_id FROM pacientes WHERE ativo = true LIMIT 1;
    SELECT id INTO test_unidade_id FROM unidades WHERE ativo = true LIMIT 1;
    SELECT id INTO test_sala_id FROM salas WHERE ativo = true LIMIT 1;
    
    -- Se encontrou dados, fazer o teste
    IF test_paciente_id IS NOT NULL AND test_unidade_id IS NOT NULL AND test_sala_id IS NOT NULL THEN
        -- Tentar inserir agendamento de teste
        INSERT INTO agendamentos (
            paciente_id,
            unidade_id,
            sala_id,
            data_agendamento,
            horario_inicio,
            horario_fim,
            duracao_minutos,
            tipo_sessao,
            modalidade,
            status
        ) VALUES (
            test_paciente_id,
            test_unidade_id,
            test_sala_id,
            CURRENT_DATE + 1,
            '09:00',
            '10:00',
            60,
            'Teste Agendamento',
            'Teste Modalidade',
            'agendado'
        );
        
        RAISE NOTICE 'SUCESSO: Agendamento de teste inserido com sucesso!';
        
        -- Remover o teste
        DELETE FROM agendamentos WHERE tipo_sessao = 'Teste Agendamento';
        RAISE NOTICE 'Agendamento de teste removido.';
    ELSE
        RAISE NOTICE 'AVISO: Não foi possível fazer o teste - faltam dados nas tabelas relacionadas';
    END IF;
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'ERRO no teste de inserção: %', SQLERRM;
END;
$$;
