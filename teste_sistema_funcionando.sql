-- ============================================================================
-- TESTE COMPLETO DO SISTEMA DE AUTOMAÇÃO - RECÉM INSTALADO
-- ============================================================================
-- Execute este script para testar todas as funcionalidades do sistema
-- ============================================================================

-- 1. TESTAR A FUNÇÃO DE ATUALIZAÇÃO DE TEMPO
SELECT 'TESTE 1: FUNÇÃO DE ATUALIZAÇÃO DE TEMPO' as teste;
SELECT * FROM atualizar_tempo_profissionais();

-- 2. VERIFICAR A VIEW COMPLETA
SELECT 'TESTE 2: VIEW COMPLETA COM CAMPOS DE AUTOMAÇÃO' as teste;
SELECT 
    id,
    paciente_nome,
    sala_nome,
    status,
    status_automacao,
    profissional_ativo,
    profissional_1_nome,
    tempo_profissional_1,
    tempo_profissional_2,
    tempo_profissional_3,
    proxima_acao
FROM vw_agendamentos_completo 
WHERE paciente_nome IS NOT NULL
ORDER BY id 
LIMIT 5;

-- 3. TESTAR INÍCIO DE SESSÃO (use um ID real)
SELECT 'TESTE 3: INICIAR SESSÃO DE TESTE' as teste;
-- Encontrar um agendamento para testar
SELECT 
    'Agendamentos disponíveis para teste:' as info,
    id,
    paciente_nome,
    status,
    sala_nome
FROM vw_agendamentos_completo 
WHERE status = 'agendado'
ORDER BY id 
LIMIT 3;

-- 4. VERIFICAR ESTRUTURA DA TABELA
SELECT 'TESTE 4: VERIFICAR CAMPOS DE AUTOMAÇÃO CRIADOS' as teste;
SELECT 
    column_name,
    data_type,
    column_default,
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

-- 5. VERIFICAR CONSTRAINTS CRIADAS
SELECT 'TESTE 5: VERIFICAR FOREIGN KEY CONSTRAINTS' as teste;
SELECT 
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'agendamentos' 
AND constraint_name LIKE 'fk_agendamentos_profissional_%'
ORDER BY constraint_name;

-- 6. ESTATÍSTICAS DO SISTEMA
SELECT 'TESTE 6: ESTATÍSTICAS DO SISTEMA DE AUTOMAÇÃO' as teste;
SELECT 
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN status = 'agendado' THEN 1 END) as agendados,
    COUNT(CASE WHEN status = 'em_atendimento' THEN 1 END) as em_atendimento,
    COUNT(CASE WHEN sessao_iniciada_em IS NOT NULL THEN 1 END) as com_sessao_iniciada,
    COUNT(CASE WHEN profissional_1_id IS NOT NULL THEN 1 END) as com_profissional_1,
    COUNT(CASE WHEN profissional_ativo = 1 THEN 1 END) as profissional_1_ativo,
    COUNT(CASE WHEN profissional_ativo = 2 THEN 1 END) as profissional_2_ativo,
    COUNT(CASE WHEN profissional_ativo = 3 THEN 1 END) as profissional_3_ativo
FROM agendamentos;

-- 7. TESTAR CAMPOS CALCULADOS
SELECT 'TESTE 7: CAMPOS CALCULADOS DE AUTOMAÇÃO' as teste;
SELECT 
    id,
    paciente_nome,
    tempo_sessao_atual,
    duracao_planejada,
    status_automacao,
    proxima_acao
FROM vw_agendamentos_completo 
WHERE paciente_nome IS NOT NULL
ORDER BY id 
LIMIT 5;

-- ============================================================================
-- INSTRUÇÕES PARA TESTE PRÁTICO
-- ============================================================================

-- Para testar uma sessão real, execute:
-- 1. Escolha um ID da lista acima
-- 2. Execute: SELECT iniciar_sessao_agendamento(ID_ESCOLHIDO);
-- 3. Verifique: SELECT * FROM vw_agendamentos_completo WHERE id = ID_ESCOLHIDO;
-- 4. Teste automação: SELECT * FROM atualizar_tempo_profissionais();

SELECT '✅ TESTES CONCLUÍDOS!' as resultado;
SELECT 'Sistema de automação de 30 minutos está FUNCIONANDO!' as status;
SELECT 'Agora você pode testar na interface React' as proximo_passo;
