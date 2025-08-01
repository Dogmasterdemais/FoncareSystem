-- 📊 ANÁLISE DETALHADA DOS NÚMEROS EXISTENTES

SELECT '=== ANÁLISE COMPLETA DOS NÚMEROS DE AGENDAMENTO ===' as titulo;

-- 1. Todos os números existentes
SELECT 
    'TODOS OS NÚMEROS' as categoria,
    numero_agendamento,
    LENGTH(numero_agendamento) as tamanho,
    CASE 
        WHEN numero_agendamento ~ '^[0-9]{10}$' THEN 'FORMATO CORRETO (2025XXXXXX)'
        WHEN numero_agendamento LIKE 'AG-%' THEN 'FORMATO ANTIGO (AG-2025-XXXXXX)'
        ELSE 'FORMATO DESCONHECIDO'
    END as formato
FROM agendamentos 
WHERE numero_agendamento IS NOT NULL
ORDER BY created_at DESC;

-- 2. Números no formato novo (2025XXXXXX)
SELECT 
    'FORMATO NOVO' as categoria,
    numero_agendamento,
    SUBSTRING(numero_agendamento FROM 1 FOR 4) as ano,
    SUBSTRING(numero_agendamento FROM 5) as sequencial,
    CAST(SUBSTRING(numero_agendamento FROM 5) AS INTEGER) as sequencial_int
FROM agendamentos 
WHERE numero_agendamento ~ '^[0-9]{10}$'
ORDER BY CAST(SUBSTRING(numero_agendamento FROM 5) AS INTEGER) DESC;

-- 3. Próximo número que deveria ser gerado
SELECT 
    'PRÓXIMO NÚMERO' as categoria,
    TO_CHAR(NOW(), 'YYYY') || LPAD(
        (COALESCE(
            MAX(CAST(SUBSTRING(numero_agendamento FROM 5) AS INTEGER)), 0
        ) + 1)::TEXT, 
        6, '0'
    ) as proximo_numero_esperado
FROM agendamentos 
WHERE numero_agendamento ~ '^[0-9]{10}$'
    AND SUBSTRING(numero_agendamento FROM 1 FOR 4) = TO_CHAR(NOW(), 'YYYY');
