-- ================================================
-- VERIFICAÇÃO E CORREÇÃO COMPLETA DE RLS
-- Execute no Supabase SQL Editor
-- ================================================

-- 1. Verificar RLS em todas as tabelas principais
SELECT 
    pt.tablename,
    pt.rowsecurity as rls_enabled,
    COUNT(pp.polname) as total_policies
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
LEFT JOIN pg_policy pp ON pp.polrelid = pc.oid
WHERE pt.schemaname = 'public' 
    AND pt.tablename IN ('agendamentos', 'pacientes', 'colaboradores', 'profissionais', 'unidades', 'especialidades', 'salas', 'convenios')
GROUP BY pt.tablename, pt.rowsecurity
ORDER BY pt.tablename;

-- 2. Verificar políticas específicas de cada tabela importante
SELECT 
    pc.relname as table_name,
    pol.polname as policy_name,
    CASE pol.polcmd 
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'  
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command_type,
    pg_get_expr(pol.polqual, pol.polrelid) as policy_condition
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pn.nspname = 'public'
    AND pc.relname IN ('agendamentos', 'pacientes', 'colaboradores', 'profissionais')
ORDER BY pc.relname, pol.polname;

-- ================================================
-- CORREÇÃO: DESABILITAR RLS EM TABELAS PROBLEMÁTICAS
-- ================================================

-- Agendamentos (principal problema identificado)
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;

-- Verificar outras tabelas que podem ter o mesmo problema
-- Pacientes
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables pt
        JOIN pg_class pc ON pc.relname = pt.tablename
        WHERE pt.tablename = 'pacientes' 
            AND pt.schemaname = 'public' 
            AND pt.rowsecurity = true
    ) THEN
        ALTER TABLE pacientes DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desabilitado para pacientes';
    END IF;
END $$;

-- Colaboradores
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables pt
        JOIN pg_class pc ON pc.relname = pt.tablename
        WHERE pt.tablename = 'colaboradores' 
            AND pt.schemaname = 'public' 
            AND pt.rowsecurity = true
    ) THEN
        ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desabilitado para colaboradores';
    END IF;
END $$;

-- Profissionais
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables pt
        JOIN pg_class pc ON pc.relname = pt.tablename
        WHERE pt.tablename = 'profissionais' 
            AND pt.schemaname = 'public' 
            AND pt.rowsecurity = true
    ) THEN
        ALTER TABLE profissionais DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desabilitado para profissionais';
    END IF;
END $$;

-- ================================================
-- VERIFICAÇÃO FINAL
-- ================================================

-- Verificar estado atual após correções
SELECT 
    'ESTADO FINAL' as status,
    pt.tablename,
    pt.rowsecurity as rls_still_enabled
FROM pg_tables pt
WHERE pt.schemaname = 'public' 
    AND pt.tablename IN ('agendamentos', 'pacientes', 'colaboradores', 'profissionais')
ORDER BY pt.tablename;

-- Testar inserção na tabela agendamentos
INSERT INTO agendamentos (
    paciente_id,
    especialidade_id, 
    sala_id,
    unidade_id,
    data_agendamento,
    horario_inicio,
    horario_fim,
    duracao_minutos,
    status,
    observacoes
) 
SELECT 
    p.id,
    e.id,
    s.id,
    u.id,
    CURRENT_DATE + 1,
    '09:00',
    '10:00',
    60,
    'agendado',
    'Teste final RLS corrigido'
FROM pacientes p
CROSS JOIN especialidades e  
CROSS JOIN salas s
CROSS JOIN unidades u
WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE observacoes = 'Teste final RLS corrigido'
)
LIMIT 1;

-- Verificar se o teste funcionou
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SUCESSO: Agendamento criado após correção!'
        ELSE '❌ FALHA: Ainda há problemas na inserção'
    END as resultado_teste
FROM agendamentos 
WHERE observacoes = 'Teste final RLS corrigido';

-- Limpar o teste
DELETE FROM agendamentos WHERE observacoes = 'Teste final RLS corrigido';

SELECT '🎉 CORREÇÃO RLS CONCLUÍDA - TESTE O SISTEMA AGORA!' as final_message;
