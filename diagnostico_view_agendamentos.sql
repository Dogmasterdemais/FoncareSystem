-- 🔍 DIAGNÓSTICO DA VIEW vw_agendamentos_completo

SELECT '=== DIAGNÓSTICO DA VIEW ATUAL ===' as titulo;

-- 1. Verificar se a view existe
SELECT 
    'EXISTÊNCIA DA VIEW' as tipo,
    viewname,
    schemaname
FROM pg_views 
WHERE viewname = 'vw_agendamentos_completo';

-- 2. Verificar todas as colunas da view atual
SELECT 
    'COLUNAS DA VIEW ATUAL' as tipo,
    column_name,
    data_type,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'vw_agendamentos_completo' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se tem coluna de convênio
SELECT 
    'COLUNAS DE CONVÊNIO' as tipo,
    column_name
FROM information_schema.columns 
WHERE table_name = 'vw_agendamentos_completo' 
    AND table_schema = 'public'
    AND column_name LIKE '%convenio%';

-- 4. Testar uma consulta simples na view
SELECT 
    'TESTE DA VIEW ATUAL' as tipo,
    COUNT(*) as total_registros
FROM vw_agendamentos_completo;

-- 5. Ver a definição atual da view
SELECT 
    'DEFINIÇÃO ATUAL' as tipo,
    definition
FROM pg_views 
WHERE viewname = 'vw_agendamentos_completo' 
    AND schemaname = 'public';
