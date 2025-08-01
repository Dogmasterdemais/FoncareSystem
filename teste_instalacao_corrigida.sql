-- ============================================================================
-- TESTE PÓS-INSTALAÇÃO DO SISTEMA DE AUTOMAÇÃO - VERSÃO CORRIGIDA
-- ============================================================================
-- Execute este script após a instalação para verificar se tudo está funcionando
-- ============================================================================

-- 1. VERIFICAR SE TODAS AS COLUNAS FORAM CRIADAS
SELECT 
    'Colunas de automação criadas:' as verificacao,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND column_name IN (
    'sessao_iniciada_em', 'profissional_ativo', 'tipo_sessao',
    'tempo_profissional_1', 'tempo_profissional_2', 'tempo_profissional_3',
    'profissional_1_id', 'profissional_2_id', 'profissional_3_id',
    'ultima_rotacao', 'notificacao_enviada'
)
ORDER BY column_name;

-- 2. VERIFICAR SE A VIEW FOI CRIADA CORRETAMENTE
SELECT 
    'View vw_agendamentos_completo:' as verificacao,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'vw_agendamentos_completo';

-- 3. VERIFICAR FUNÇÕES CRIADAS
SELECT 
    'Funções de automação criadas:' as verificacao,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN (
    'atualizar_tempo_profissionais',
    'executar_rotacao_automatica', 
    'iniciar_sessao_agendamento',
    'trigger_atualizar_tempo_automatico'
)
ORDER BY routine_name;

-- 4. TESTAR A VIEW COM DADOS EXISTENTES
SELECT 
    'Teste da view - Primeiros 3 agendamentos:' as verificacao;

SELECT 
    id,
    paciente_nome,
    sala_nome,
    status,
    profissional_1_nome,
    sessao_iniciada_em,
    profissional_ativo,
    tipo_sessao,
    tempo_profissional_1,
    status_automacao,
    proxima_acao
FROM vw_agendamentos_completo 
ORDER BY id 
LIMIT 3;

-- 5. TESTAR FUNÇÃO DE ATUALIZAÇÃO DE TEMPO
SELECT 
    'Teste da função atualizar_tempo_profissionais():' as verificacao;

SELECT * FROM atualizar_tempo_profissionais();

-- 6. VERIFICAR AGENDAMENTOS QUE PODEM SER TESTADOS
SELECT 
    'Agendamentos disponíveis para teste:' as verificacao,
    id,
    paciente_nome,
    status,
    profissional_1_nome,
    sala_nome
FROM vw_agendamentos_completo 
WHERE status IN ('agendado', 'em_atendimento')
ORDER BY id
LIMIT 5;

-- 7. ESTATÍSTICAS DO SISTEMA
SELECT 
    'Estatísticas do sistema:' as verificacao;

SELECT 
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN status = 'agendado' THEN 1 END) as agendados,
    COUNT(CASE WHEN status = 'em_atendimento' THEN 1 END) as em_atendimento,
    COUNT(CASE WHEN sessao_iniciada_em IS NOT NULL THEN 1 END) as com_sessao_iniciada,
    COUNT(CASE WHEN profissional_1_id IS NOT NULL THEN 1 END) as com_profissional_1,
    COUNT(CASE WHEN profissional_2_id IS NOT NULL THEN 1 END) as com_profissional_2,
    COUNT(CASE WHEN profissional_3_id IS NOT NULL THEN 1 END) as com_profissional_3
FROM agendamentos;

-- 8. VERIFICAR TRIGGERS
SELECT 
    'Triggers criados:' as verificacao,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_agendamentos_tempo_automatico';

-- 9. EXEMPLO DE COMO INICIAR UMA SESSÃO (COMENTADO - DESCOMENTE PARA TESTAR)
/*
-- Para testar, substitua XXX pelo ID de um agendamento real
-- SELECT iniciar_sessao_agendamento(XXX);
-- SELECT * FROM vw_agendamentos_completo WHERE id = XXX;
*/

-- ============================================================================
-- RESULTADOS ESPERADOS:
-- ============================================================================
-- ✅ 11 colunas de automação devem estar criadas
-- ✅ View vw_agendamentos_completo deve ter ~40+ colunas
-- ✅ 4 funções devem estar criadas
-- ✅ 1 trigger deve estar ativo
-- ✅ Dados existentes devem aparecer na view
-- ============================================================================

SELECT '✅ VERIFICAÇÃO DE INSTALAÇÃO CONCLUÍDA!' as resultado;
SELECT 'Se todos os resultados acima estão corretos, o sistema está pronto!' as status;
SELECT 'Use as funções criadas para gerenciar a automação de 30 minutos' as próximo_passo;
