-- 🔧 DIAGNÓSTICO COMPLETO: numero_agendamento

SELECT '=== DIAGNÓSTICO NUMERO_AGENDAMENTO ===' as etapa;

-- 1. Verificar se a coluna numero_agendamento existe
SELECT 
    'COLUNA numero_agendamento' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
    AND table_schema = 'public'
    AND column_name = 'numero_agendamento';

-- 2. Verificar constraint unique
SELECT 
    'CONSTRAINT UNIQUE' as tipo,
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'agendamentos' 
    AND n.nspname = 'public'
    AND conname LIKE '%numero_agendamento%';

-- 3. Verificar se existe trigger
SELECT 
    'TRIGGER' as tipo,
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'agendamentos' 
    AND t.tgname LIKE '%numero_agendamento%';

-- 4. Verificar se a função existe
SELECT 
    'FUNÇÃO' as tipo,
    proname as function_name,
    'Existe' as status
FROM pg_proc 
WHERE proname LIKE '%numero_agendamento%';

-- 5. Verificar dados existentes
SELECT 
    'DADOS EXISTENTES' as tipo,
    COUNT(*) as total_agendamentos,
    COUNT(numero_agendamento) as com_numero,
    COUNT(*) - COUNT(numero_agendamento) as sem_numero
FROM agendamentos;

-- 6. Verificar últimos números gerados
SELECT 
    'ÚLTIMOS NÚMEROS' as tipo,
    numero_agendamento,
    data_agendamento,
    created_at
FROM agendamentos 
WHERE numero_agendamento IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;
