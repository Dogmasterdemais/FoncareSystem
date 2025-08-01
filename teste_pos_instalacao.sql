-- ============================================================================
-- TESTE COMPLETO APÓS INSTALAÇÃO DO SISTEMA DE AUTOMAÇÃO
-- ============================================================================
-- Execute este script APÓS executar instalacao_completa_automacao.sql
-- ============================================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA AGENDAMENTOS
SELECT '🔍 1. VERIFICANDO ESTRUTURA DA TABELA AGENDAMENTOS' as teste;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
AND column_name IN (
    'sessao_iniciada_em', 
    'profissional_ativo', 
    'tipo_sessao', 
    'tempo_profissional_1', 
    'tempo_profissional_2', 
    'tempo_profissional_3',
    'profissional_1_id',
    'profissional_2_id', 
    'profissional_3_id'
)
ORDER BY column_name;

-- 2. VERIFICAR SE AS FUNÇÕES FORAM INSTALADAS
SELECT '🔍 2. VERIFICANDO FUNÇÕES INSTALADAS' as teste;
SELECT 
    routine_name,
    routine_type,
    created
FROM information_schema.routines 
WHERE routine_name IN (
    'executar_processamento_automatico', 
    'iniciar_atendimento_manual', 
    'concluir_atendimento_manual'
)
AND routine_schema = 'public'
ORDER BY routine_name;

-- 3. VERIFICAR VIEW ATUALIZADA
SELECT '🔍 3. VERIFICANDO VIEW vw_agendamentos_completo' as teste;
SELECT 
    column_name
FROM information_schema.columns 
WHERE table_name = 'vw_agendamentos_completo'
AND column_name IN (
    'sessao_iniciada_em', 
    'profissional_ativo', 
    'tipo_sessao',
    'profissional_2_nome',
    'profissional_3_nome',
    'tempo_sessao_atual',
    'duracao_planejada'
)
ORDER BY column_name;

-- 4. TESTAR FUNÇÃO DE AUTOMAÇÃO
SELECT '🔍 4. TESTANDO FUNÇÃO DE AUTOMAÇÃO' as teste;
SELECT executar_processamento_automatico();

-- 5. VERIFICAR AGENDAMENTOS DE HOJE
SELECT '🔍 5. AGENDAMENTOS DE HOJE COM NOVOS CAMPOS' as teste;
SELECT 
    id,
    paciente_nome,
    status,
    tipo_sessao,
    profissional_ativo,
    sessao_iniciada_em,
    CASE 
        WHEN sessao_iniciada_em IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - sessao_iniciada_em))::INTEGER / 60 
        ELSE NULL 
    END as minutos_decorridos,
    profissional_1_id,
    profissional_2_id,
    profissional_3_id
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE
ORDER BY status, horario_inicio;

-- 6. TESTAR VIEW COMPLETA
SELECT '🔍 6. TESTANDO VIEW COMPLETA' as teste;
SELECT 
    id,
    paciente_nome,
    status,
    tipo_sessao,
    profissional_ativo,
    profissional_nome,
    profissional_2_nome,
    profissional_3_nome,
    tempo_sessao_atual,
    duracao_planejada
FROM vw_agendamentos_completo 
WHERE data_agendamento = CURRENT_DATE
LIMIT 5;

-- 7. SIMULAR TESTE DE ATENDIMENTO (DESCOMENTE PARA TESTAR)
/*
-- Encontrar um agendamento para testar
SELECT '🎭 7. TESTE DE SIMULAÇÃO' as teste;

-- Criar um agendamento de teste se não existir
INSERT INTO agendamentos (
    paciente_nome,
    horario_inicio,
    horario_fim,
    status,
    data_agendamento,
    sala_id,
    tipo_sessao,
    profissional_1_id
) 
SELECT 
    'Paciente Teste Automação',
    '14:00:00',
    '15:30:00',
    'pronto_para_terapia',
    CURRENT_DATE,
    (SELECT id FROM salas LIMIT 1),
    'tripla',
    (SELECT id FROM colaboradores WHERE status = 'ativo' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE paciente_nome = 'Paciente Teste Automação' 
    AND data_agendamento = CURRENT_DATE
);

-- Iniciar atendimento de teste
SELECT iniciar_atendimento_manual(
    (SELECT id FROM agendamentos 
     WHERE paciente_nome = 'Paciente Teste Automação' 
     AND data_agendamento = CURRENT_DATE 
     LIMIT 1), 
    'tripla'
);

-- Simular 35 minutos de atendimento
UPDATE agendamentos 
SET sessao_iniciada_em = NOW() - INTERVAL '35 minutes'
WHERE paciente_nome = 'Paciente Teste Automação' 
AND data_agendamento = CURRENT_DATE;

-- Testar automação após simulação
SELECT 'Testando automação após 35 minutos...' as teste;
SELECT executar_processamento_automatico();

-- Verificar resultado
SELECT 
    paciente_nome,
    status,
    profissional_ativo,
    sessao_iniciada_em,
    EXTRACT(EPOCH FROM (NOW() - sessao_iniciada_em))::INTEGER / 60 as minutos_decorridos
FROM agendamentos 
WHERE paciente_nome = 'Paciente Teste Automação' 
AND data_agendamento = CURRENT_DATE;
*/

-- ============================================================================
-- RESULTADO FINAL
-- ============================================================================
SELECT '✅ TESTE COMPLETO FINALIZADO!' as resultado;
SELECT 'Se todos os testes passaram, o sistema está funcionando!' as status;
SELECT 'Agora teste o frontend em http://localhost:3000/agenda' as proximo_passo;
