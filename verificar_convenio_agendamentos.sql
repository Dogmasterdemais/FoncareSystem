-- 🔍 VERIFICAR CONVÊNIO NOS AGENDAMENTOS

SELECT '=== ANÁLISE DE CONVÊNIOS EM AGENDAMENTOS ===' as titulo;

-- 1. Verificar pacientes e seus convênios
SELECT 
    'PACIENTES COM CONVÊNIO' as tipo,
    p.id,
    p.nome,
    p.convenio_id,
    c.nome as convenio_nome
FROM pacientes p
LEFT JOIN convenios c ON p.convenio_id = c.id
WHERE p.ativo = true
ORDER BY p.nome
LIMIT 5;

-- 2. Verificar agendamentos e seus convênios
SELECT 
    'AGENDAMENTOS COM CONVÊNIO' as tipo,
    a.id,
    a.paciente_id,
    a.convenio_id,
    p.nome as paciente_nome,
    c.nome as convenio_nome,
    a.data_agendamento,
    a.created_at
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN convenios c ON a.convenio_id = c.id
ORDER BY a.created_at DESC
LIMIT 5;

-- 3. Comparar convênio do paciente vs agendamento
SELECT 
    'COMPARAÇÃO PACIENTE vs AGENDAMENTO' as tipo,
    a.id as agendamento_id,
    p.nome as paciente_nome,
    p.convenio_id as paciente_convenio_id,
    a.convenio_id as agendamento_convenio_id,
    CASE 
        WHEN p.convenio_id = a.convenio_id THEN '✅ CORRETO'
        WHEN p.convenio_id IS NOT NULL AND a.convenio_id IS NULL THEN '❌ PERDIDO'
        WHEN p.convenio_id IS NULL AND a.convenio_id IS NULL THEN '⚠️ AMBOS NULL'
        ELSE '❓ DIFERENTE'
    END as status,
    a.created_at
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
ORDER BY a.created_at DESC
LIMIT 10;

-- 4. Contar problemas de convênio
SELECT 
    'ESTATÍSTICAS DE CONVÊNIO' as tipo,
    COUNT(*) as total_agendamentos,
    COUNT(a.convenio_id) as agendamentos_com_convenio,
    COUNT(*) - COUNT(a.convenio_id) as agendamentos_sem_convenio,
    COUNT(CASE WHEN p.convenio_id IS NOT NULL AND a.convenio_id IS NULL THEN 1 END) as perdas_convenio
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id;

-- 5. Verificar último agendamento criado
SELECT 
    'ÚLTIMO AGENDAMENTO' as tipo,
    a.id,
    a.paciente_id,
    p.nome as paciente_nome,
    p.convenio_id as paciente_convenio,
    a.convenio_id as agendamento_convenio,
    pc.nome as paciente_convenio_nome,
    ac.nome as agendamento_convenio_nome,
    a.created_at
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN convenios pc ON p.convenio_id = pc.id
LEFT JOIN convenios ac ON a.convenio_id = ac.id
ORDER BY a.created_at DESC
LIMIT 1;
