-- ============================================================================
-- DIAGNÓSTICO COMPLETO DOS PROBLEMAS CRÍTICOS
-- ============================================================================
-- Execute este script para identificar todos os problemas atuais
-- ============================================================================

-- 1. VERIFICAR SE AS FUNÇÕES DE 30MIN ESTÃO INSTALADAS
SELECT '🔍 1. VERIFICANDO FUNÇÕES DE AUTOMAÇÃO' as diagnostico;
SELECT 
    routine_name,
    routine_type,
    created
FROM information_schema.routines 
WHERE routine_name LIKE '%processamento%' OR routine_name LIKE '%automatico%'
AND routine_schema = 'public'
ORDER BY routine_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA AGENDAMENTOS
SELECT '🔍 2. VERIFICANDO CAMPOS DA TABELA AGENDAMENTOS' as diagnostico;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
AND column_name IN ('sessao_iniciada_em', 'profissional_ativo', 'tipo_sessao', 'tempo_profissional_1', 'tempo_profissional_2', 'tempo_profissional_3')
ORDER BY column_name;

-- 3. VERIFICAR AGENDAMENTOS DE HOJE
SELECT '🔍 3. VERIFICANDO AGENDAMENTOS DE HOJE' as diagnostico;
SELECT 
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN status = 'agendado' THEN 1 END) as agendados,
    COUNT(CASE WHEN status = 'pronto_para_terapia' THEN 1 END) as prontos,
    COUNT(CASE WHEN status = 'em_atendimento' THEN 1 END) as em_atendimento,
    COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE;

-- 4. VERIFICAR DETALHES DOS AGENDAMENTOS EM ATENDIMENTO
SELECT '🔍 4. DETALHES DOS AGENDAMENTOS EM ATENDIMENTO' as diagnostico;
SELECT 
    a.id,
    p.nome as paciente_nome,
    a.status,
    a.tipo_sessao,
    a.profissional_ativo,
    a.sessao_iniciada_em,
    CASE 
        WHEN a.sessao_iniciada_em IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 
        ELSE NULL 
    END as minutos_decorridos,
    a.tempo_profissional_1,
    a.tempo_profissional_2,
    a.tempo_profissional_3,
    s.numero as sala_numero,
    u.nome as unidade_nome
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN unidades u ON s.unidade_id = u.id
WHERE a.data_agendamento = CURRENT_DATE
ORDER BY a.status, a.sessao_iniciada_em;

-- 5. VERIFICAR SALAS E PROFISSIONAIS
SELECT '🔍 5. VERIFICANDO SALAS E PROFISSIONAIS' as diagnostico;
SELECT 
    s.numero as sala_numero,
    s.nome as sala_nome,
    s.capacidade_maxima,
    u.nome as unidade_nome,
    COUNT(a.id) as agendamentos_hoje
FROM salas s
LEFT JOIN unidades u ON s.unidade_id = u.id
LEFT JOIN agendamentos a ON s.id = a.sala_id AND a.data_agendamento = CURRENT_DATE
GROUP BY s.id, s.numero, s.nome, s.capacidade_maxima, u.nome
ORDER BY u.nome, s.numero;

-- 6. TESTAR FUNÇÃO DE AUTOMAÇÃO (se existir)
SELECT '🔍 6. TESTANDO FUNÇÃO DE AUTOMAÇÃO' as diagnostico;
DO $$
BEGIN
    -- Tentar executar a função se ela existir
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'executar_processamento_automatico') THEN
        RAISE NOTICE 'Função existe, tentando executar...';
        PERFORM executar_processamento_automatico();
        RAISE NOTICE 'Função executada com sucesso!';
    ELSE
        RAISE NOTICE 'FUNÇÃO executar_processamento_automatico NÃO ENCONTRADA!';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO ao executar função: %', SQLERRM;
END $$;

-- 7. VERIFICAR PROFISSIONAIS ATIVOS
SELECT '🔍 7. VERIFICANDO COLABORADORES ATIVOS' as diagnostico;
SELECT 
    nome_completo,
    cargo,
    status,
    created_at
FROM colaboradores 
WHERE status = 'ativo'
ORDER BY cargo, nome_completo
LIMIT 10;

-- ============================================================================
-- RESUMO FINAL
-- ============================================================================
SELECT '📊 DIAGNÓSTICO FINALIZADO' as resultado;
SELECT 'Verifique os resultados acima para identificar problemas' as instrucao;
