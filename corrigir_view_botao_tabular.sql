-- Corrigir a view para incluir campos essenciais do botão "Tabular Guia"
-- Execute no Supabase SQL Editor

-- 1. Remover view existente
DROP VIEW IF EXISTS vw_agendamentos_completo;

-- 2. Recriar view com TODOS os campos necessários
CREATE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.numero_agendamento,
    a.paciente_id,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.data_agendamento,
    a.sala_id,
    a.profissional_id,
    a.convenio_id,
    a.observacoes,
    a.created_at,
    a.updated_at,
    -- CAMPOS DE CHEGADA E GUIA (ESSENCIAIS PARA SALA DE ESPERA)
    a.data_chegada,
    a.codigo_autorizacao,
    a.numero_guia,
    a.data_autorizacao,
    a.validade_autorizacao,
    -- CAMPOS DE AUTOMAÇÃO
    a.sessao_iniciada_em,
    a.profissional_ativo,
    a.tipo_sessao,
    a.tempo_profissional_1,
    a.tempo_profissional_2,
    a.tempo_profissional_3,
    a.profissional_1_id,
    a.profissional_2_id,
    a.profissional_3_id,
    a.ultima_rotacao,
    a.notificacao_enviada,
    -- DADOS DA SALA
    s.numero as sala_numero,
    s.nome as sala_nome,
    s.cor as sala_cor,
    s.capacidade_maxima,
    s.unidade_id,
    u.nome as unidade_nome,
    -- DADOS DOS PROFISSIONAIS
    c1.nome_completo as profissional_1_nome,
    c1.cargo as profissional_1_especialidade,
    c2.nome_completo as profissional_2_nome,
    c2.cargo as profissional_2_especialidade,
    c3.nome_completo as profissional_3_nome,
    c3.cargo as profissional_3_especialidade,
    -- DADOS DO PACIENTE
    p.nome as paciente_nome,
    p.data_nascimento as paciente_nascimento,
    p.telefone as paciente_telefone,
    -- DADOS DO CONVÊNIO
    cv.nome as convenio_nome,
    -- DADOS DA ESPECIALIDADE (para sala de espera)
    e.nome as especialidade_nome,
    -- DADOS DO PROFISSIONAL PRINCIPAL (para sala de espera)
    c.nome_completo as profissional_nome,
    -- CAMPOS CALCULADOS PARA AUTOMAÇÃO
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 
        ELSE 0 
    END as tempo_sessao_atual,
    CASE 
        WHEN a.tipo_sessao = 'individual' THEN 30
        WHEN a.tipo_sessao = 'compartilhada' THEN 60  
        WHEN a.tipo_sessao = 'tripla' THEN 90
        ELSE 60
    END as duracao_planejada,
    -- Status dinâmico baseado na automação
    CASE 
        WHEN a.status != 'em_atendimento' THEN a.status
        WHEN a.sessao_iniciada_em IS NULL THEN 'aguardando_inicio'
        WHEN a.profissional_ativo = 1 AND a.tempo_profissional_1 < 30 THEN 'com_profissional_1'
        WHEN a.profissional_ativo = 2 AND a.tempo_profissional_2 < 30 THEN 'com_profissional_2'
        WHEN a.profissional_ativo = 3 AND a.tempo_profissional_3 < 30 THEN 'com_profissional_3'
        ELSE 'necessita_rotacao'
    END as status_automacao,
    -- Próxima ação recomendada
    CASE 
        WHEN a.status != 'em_atendimento' THEN 'nenhuma'
        WHEN a.sessao_iniciada_em IS NULL THEN 'iniciar_sessao'
        WHEN a.tempo_profissional_1 >= 30 AND a.profissional_ativo = 1 THEN 'trocar_para_profissional_2'
        WHEN a.tempo_profissional_2 >= 30 AND a.profissional_ativo = 2 THEN 'trocar_para_profissional_3'
        WHEN a.tempo_profissional_3 >= 30 AND a.profissional_ativo = 3 THEN 'finalizar_sessao'
        ELSE 'continuar'
    END as proxima_acao
FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN unidades u ON s.unidade_id = u.id
LEFT JOIN colaboradores c1 ON a.profissional_1_id = c1.id
LEFT JOIN colaboradores c2 ON a.profissional_2_id = c2.id
LEFT JOIN colaboradores c3 ON a.profissional_3_id = c3.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN convenios cv ON a.convenio_id = cv.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN colaboradores c ON a.profissional_id = c.id;

-- 3. Verificar se os campos essenciais estão presentes
SELECT 
    'Verificação dos campos essenciais:' as titulo,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'vw_agendamentos_completo'
AND column_name IN ('data_chegada', 'codigo_autorizacao', 'numero_guia', 'paciente_nome', 'especialidade_nome')
ORDER BY column_name;

-- 4. Testar a view com dados de hoje
SELECT 
    'Teste da view corrigida:' as info,
    COUNT(*) as total_registros,
    COUNT(data_chegada) as com_chegada,
    COUNT(codigo_autorizacao) as com_codigo
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE;

-- Mensagem final
SELECT '✅ VIEW CORRIGIDA!' as resultado;
SELECT 'Agora a view inclui os campos: data_chegada, codigo_autorizacao, numero_guia' as info;
SELECT 'O botão "Tabular Guia" deve funcionar corretamente' as conclusao;
