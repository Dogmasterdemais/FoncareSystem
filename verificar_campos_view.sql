-- Verificar se a view tem os campos necessários para o botão tabular guia
-- Execute no Supabase SQL Editor

-- 1. Verificar estrutura da view
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vw_agendamentos_completo'
AND column_name IN ('data_chegada', 'codigo_autorizacao', 'numero_guia')
ORDER BY column_name;

-- 2. Verificar se há agendamentos de hoje
SELECT 
    'Agendamentos de hoje na view:' as info,
    COUNT(*) as total
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE;

-- 3. Mostrar os agendamentos de hoje com campos relevantes
SELECT 
    id,
    paciente_nome,
    status,
    data_chegada,
    codigo_autorizacao,
    numero_guia,
    CASE 
        WHEN data_chegada IS NOT NULL AND codigo_autorizacao IS NULL 
        THEN '🚨 DEVE MOSTRAR BOTÃO!'
        WHEN data_chegada IS NOT NULL AND codigo_autorizacao IS NOT NULL
        THEN '✅ Guia tabulada'
        ELSE '⏳ Aguardando chegada'
    END as status_botao
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE
ORDER BY horario_inicio;

-- 4. Verificar se a tabela agendamentos tem os campos necessários
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agendamentos'
AND column_name IN ('data_chegada', 'codigo_autorizacao', 'numero_guia')
ORDER BY column_name;

-- 5. Testar dados direto da tabela agendamentos
SELECT 
    'Dados direto da tabela agendamentos:' as fonte,
    id,
    status,
    data_chegada,
    codigo_autorizacao,
    numero_guia
FROM agendamentos
WHERE data_agendamento = CURRENT_DATE
ORDER BY horario_inicio;
