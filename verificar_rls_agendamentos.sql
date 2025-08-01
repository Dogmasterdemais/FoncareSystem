-- Script para verificar as políticas RLS da tabela agendamentos
-- Execute no Supabase SQL Editor para diagnosticar o problema

-- 1. Verificar se RLS está habilitado na tabela agendamentos
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls,
    relrowsecurity
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE tablename = 'agendamentos' AND schemaname = 'public';

-- 2. Verificar todas as políticas existentes na tabela agendamentos
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command_type,
    CASE pol.polcmd 
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'  
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command_desc,
    pol.polroles as roles,
    pg_get_expr(pol.polqual, pol.polrelid) as policy_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pc.relname = 'agendamentos' 
    AND pn.nspname = 'public';

-- 3. Verificar informações sobre a sessão atual (usuário/role)
SELECT 
    current_user as current_user,
    session_user as session_user,
    current_role as current_role,
    current_setting('role') as current_setting_role;

-- 4. Verificar se existe função de autenticação do Supabase
SELECT 
    proname,
    pronamespace::regnamespace as schema_name
FROM pg_proc 
WHERE proname IN ('auth.uid', 'auth.role', 'auth.jwt');

-- 5. Testar se conseguimos selecionar dados da tabela
SELECT 
    'TESTE SELECT' as tipo,
    COUNT(*) as total_registros
FROM agendamentos;

-- 6. Verificar as colunas que podem estar relacionadas a políticas RLS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
    AND column_name IN ('user_id', 'created_by', 'updated_by', 'auth_id');

-- 7. Verificar se existe alguma coluna de controle de usuário
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
    AND (column_name ILIKE '%user%' OR column_name ILIKE '%auth%' OR column_name ILIKE '%created%' OR column_name ILIKE '%owner%');

-- ================================================
-- SOLUÇÕES TEMPORÁRIAS (CUIDADO - USE APENAS PARA TESTES)
-- ================================================

-- OPÇÃO 1: Desabilitar RLS temporariamente (NÃO RECOMENDADO PARA PRODUÇÃO)
-- ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2: Criar política permissiva para testes
-- CREATE POLICY "temporary_allow_all" ON agendamentos FOR ALL USING (true) WITH CHECK (true);

-- OPÇÃO 3: Criar política baseada em usuário autenticado
-- CREATE POLICY "allow_authenticated_users" ON agendamentos FOR ALL 
-- TO authenticated 
-- USING (true) 
-- WITH CHECK (true);
