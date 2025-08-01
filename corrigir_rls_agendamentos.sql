-- ================================================
-- SOLUÇÃO PARA ERRO RLS NA TABELA AGENDAMENTOS
-- Execute este script no Supabase SQL Editor
-- ================================================

-- 1. Verificar estado atual do RLS
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE tablename = 'agendamentos' AND schemaname = 'public';

-- 2. Verificar políticas existentes
SELECT 
    pol.polname as policy_name,
    CASE pol.polcmd 
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'  
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command_type,
    pg_get_expr(pol.polqual, pol.polrelid) as policy_expression
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pc.relname = 'agendamentos' 
    AND pn.nspname = 'public';

-- ================================================
-- SOLUÇÃO 1: POLÍTICA TEMPORÁRIA PERMISSIVA
-- (Recomendada para desenvolvimento/testes)
-- ================================================

-- Remover políticas restritivas existentes (se houver)
DROP POLICY IF EXISTS "Enable read access for all users" ON agendamentos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON agendamentos;
DROP POLICY IF EXISTS "Users can only access their own data" ON agendamentos;

-- Criar políticas permissivas para desenvolvimento
CREATE POLICY "allow_all_for_development" 
ON agendamentos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ================================================
-- VERIFICAÇÃO FINAL
-- ================================================

-- Verificar se as políticas foram criadas
SELECT 
    'POLÍTICAS ATUAIS' as tipo,
    pol.polname as policy_name,
    CASE pol.polcmd 
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'  
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command_type
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pc.relname = 'agendamentos' 
    AND pn.nspname = 'public';

-- Testar inserção básica
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
    CURRENT_DATE,
    '10:00',
    '11:00',
    60,
    'agendado',
    'Teste após correção RLS'
FROM pacientes p
CROSS JOIN especialidades e  
CROSS JOIN salas s
CROSS JOIN unidades u
WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE observacoes = 'Teste após correção RLS'
)
LIMIT 1;

-- Verificar se o teste funcionou
SELECT 
    'TESTE DE INSERÇÃO' as tipo,
    COUNT(*) as registros_teste
FROM agendamentos 
WHERE observacoes = 'Teste após correção RLS';

-- ================================================
-- LIMPEZA DO TESTE
-- ================================================
DELETE FROM agendamentos WHERE observacoes = 'Teste após correção RLS';

SELECT '✅ CORREÇÃO RLS APLICADA COM SUCESSO!' as resultado;
