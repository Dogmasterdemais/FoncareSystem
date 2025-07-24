-- 🔍 VERIFICAR CONSTRAINT numero_agendamento_key

-- 1. Verificar a estrutura da tabela agendamentos (colunas)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
    AND table_schema = 'public'
    AND column_name LIKE '%numero%'
ORDER BY ordinal_position;

-- 2. Verificar constraints específicas
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'agendamentos' 
    AND n.nspname = 'public'
    AND conname LIKE '%numero_agendamento%'
ORDER BY conname;

-- 3. Verificar se existe uma sequência para numero_agendamento
SELECT 
    schemaname,
    sequencename,
    start_value,
    min_value,
    max_value,
    increment_by,
    cycle,
    cache_size,
    last_value
FROM pg_sequences 
WHERE sequencename LIKE '%agendamento%' OR sequencename LIKE '%numero%';

-- 4. Verificar valores existentes de numero_agendamento
SELECT 
    COUNT(*) as total_agendamentos,
    MIN(numero_agendamento) as menor_numero,
    MAX(numero_agendamento) as maior_numero,
    COUNT(DISTINCT numero_agendamento) as numeros_unicos
FROM agendamentos;

-- 5. Verificar se há números duplicados
SELECT 
    numero_agendamento,
    COUNT(*) as quantidade
FROM agendamentos 
GROUP BY numero_agendamento 
HAVING COUNT(*) > 1
ORDER BY numero_agendamento;
