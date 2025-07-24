-- 🔧 CORRIGIR CONVÊNIOS EM AGENDAMENTOS EXISTENTES

SELECT '=== CORREÇÃO DE CONVÊNIOS EM AGENDAMENTOS ===' as titulo;

-- 1. Identificar agendamentos que perderam o convênio
SELECT 
    'AGENDAMENTOS SEM CONVÊNIO (mas paciente tem)' as tipo,
    COUNT(*) as quantidade
FROM agendamentos a
INNER JOIN pacientes p ON a.paciente_id = p.id
WHERE a.convenio_id IS NULL 
    AND p.convenio_id IS NOT NULL;

-- 2. Mostrar detalhes dos agendamentos a serem corrigidos
SELECT 
    'DETALHES - AGENDAMENTOS A CORRIGIR' as tipo,
    a.id as agendamento_id,
    p.nome as paciente_nome,
    p.convenio_id as paciente_convenio,
    c.nome as convenio_nome,
    a.data_agendamento,
    a.created_at
FROM agendamentos a
INNER JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN convenios c ON p.convenio_id = c.id
WHERE a.convenio_id IS NULL 
    AND p.convenio_id IS NOT NULL
ORDER BY a.created_at DESC
LIMIT 10;

-- 3. Corrigir agendamentos sem convênio
DO $$
DECLARE
    agendamentos_corrigidos INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando correção de convênios em agendamentos...';
    
    -- Atualizar agendamentos que não têm convênio mas o paciente tem
    UPDATE agendamentos 
    SET convenio_id = p.convenio_id,
        updated_at = NOW()
    FROM pacientes p
    WHERE agendamentos.paciente_id = p.id
        AND agendamentos.convenio_id IS NULL
        AND p.convenio_id IS NOT NULL;
    
    GET DIAGNOSTICS agendamentos_corrigidos = ROW_COUNT;
    
    RAISE NOTICE '✅ % agendamentos tiveram o convênio corrigido', agendamentos_corrigidos;
    
EXCEPTION WHEN others THEN
    RAISE NOTICE '❌ Erro ao corrigir convênios: %', SQLERRM;
END;
$$;

-- 4. Verificar resultado da correção
SELECT 
    'RESULTADO DA CORREÇÃO' as tipo,
    COUNT(*) as total_agendamentos,
    COUNT(a.convenio_id) as com_convenio,
    COUNT(*) - COUNT(a.convenio_id) as sem_convenio,
    COUNT(CASE WHEN p.convenio_id IS NOT NULL AND a.convenio_id IS NULL THEN 1 END) as ainda_com_problema
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id;

-- 5. Mostrar alguns agendamentos corrigidos
SELECT 
    'AGENDAMENTOS CORRIGIDOS' as tipo,
    a.id,
    p.nome as paciente_nome,
    c.nome as convenio_nome,
    a.data_agendamento,
    a.updated_at
FROM agendamentos a
INNER JOIN pacientes p ON a.paciente_id = p.id
INNER JOIN convenios c ON a.convenio_id = c.id
WHERE a.updated_at > NOW() - INTERVAL '5 minutes'  -- Corrigidos nos últimos 5 minutos
ORDER BY a.updated_at DESC
LIMIT 5;
