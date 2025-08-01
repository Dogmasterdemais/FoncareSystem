-- ============================================================================
-- SCRIPT DE TESTE PARA O SISTEMA DE 30 MINUTOS - VERSÃO CORRIGIDA
-- ============================================================================
-- Execute este script APÓS instalar o sistema_30min_completo_final.sql
-- ============================================================================

-- 1. VERIFICAR SE AS FUNÇÕES FORAM INSTALADAS
SELECT '🔍 VERIFICANDO FUNÇÕES INSTALADAS' as verificacao;
SELECT 
    routine_name,
    routine_type,
    created
FROM information_schema.routines 
WHERE routine_name IN ('executar_processamento_automatico', 'iniciar_atendimento_manual', 'concluir_atendimento_manual')
AND routine_schema = 'public';

-- 2. TESTAR A FUNÇÃO PRINCIPAL
SELECT '🧪 TESTANDO FUNÇÃO PRINCIPAL' as teste;
SELECT executar_processamento_automatico();

-- 3. VERIFICAR AGENDAMENTOS EM ATENDIMENTO HOJE
SELECT '📋 AGENDAMENTOS EM ATENDIMENTO HOJE' as verificacao;
SELECT 
    a.id,
    p.nome as paciente_nome,
    a.tipo_sessao,
    a.profissional_ativo,
    a.sessao_iniciada_em,
    EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 as minutos_decorridos,
    a.tempo_profissional_1,
    a.tempo_profissional_2,
    a.tempo_profissional_3,
    s.numero as sala_numero
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN salas s ON a.sala_id = s.id
WHERE a.status = 'em_atendimento' 
AND a.data_agendamento = CURRENT_DATE
ORDER BY a.sessao_iniciada_em;

-- 4. SIMULAR INÍCIO DE ATENDIMENTO (PARA TESTE)
-- Descomente as linhas abaixo se quiser criar um atendimento de teste

/*
-- Encontrar um agendamento para testar
SELECT '🎭 CRIANDO ATENDIMENTO DE TESTE' as simulacao;

-- Usar função manual para iniciar atendimento
SELECT iniciar_atendimento_manual(
    (SELECT id FROM agendamentos 
     WHERE data_agendamento = CURRENT_DATE 
     AND status IN ('agendado', 'pronto_para_terapia', 'concluido')
     LIMIT 1), 
    'tripla'
);

-- Simular tempo passado (atualizar diretamente para teste)
UPDATE agendamentos 
SET sessao_iniciada_em = NOW() - INTERVAL '35 minutes'
WHERE data_agendamento = CURRENT_DATE 
AND status = 'em_atendimento'
AND id = (
    SELECT id FROM agendamentos 
    WHERE data_agendamento = CURRENT_DATE 
    AND status = 'em_atendimento'
    LIMIT 1
);

-- Testar novamente após simular
SELECT 'Testando após simulação...' as teste;
SELECT executar_processamento_automatico();
*/

-- 4. VERIFICAR LOGS DE HOJE
SELECT '📝 RESUMO DE AGENDAMENTOS HOJE' as resumo;
SELECT 
    status,
    COUNT(*) as quantidade,
    STRING_AGG(DISTINCT tipo_sessao, ', ') as tipos_sessao
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'em_atendimento' THEN 1
        WHEN 'pronto_para_terapia' THEN 2  
        WHEN 'agendado' THEN 3
        WHEN 'concluido' THEN 4
        ELSE 5
    END;

-- 5. VERIFICAR SE AS FUNÇÕES EXISTEM
SELECT '🔍 VERIFICANDO FUNÇÕES INSTALADAS' as verificacao;
SELECT 
    routine_name,
    routine_type,
    created
FROM information_schema.routines 
WHERE routine_name IN ('processar_transicoes_automaticas', 'executar_processamento_automatico')
AND routine_schema = 'public';

-- ============================================================================
-- MENSAGENS FINAIS
-- ============================================================================

SELECT '✅ TESTE COMPLETO FINALIZADO!' as resultado;
SELECT '💡 O sistema está pronto para funcionar automaticamente no frontend' as info;
SELECT '⚡ O componente React executa a função a cada 30 segundos' as frontend;
