-- Correção da view vw_agendamentos_completo
-- Adicionar campos essenciais para o funcionamento da sala de espera

-- Remover view existente
DROP VIEW IF EXISTS vw_agendamentos_completo;

-- Recriar a view com TODOS os campos necessários
CREATE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.tipo_sessao,
    a.duracao_planejada,
    a.observacoes,
    a.created_at,
    a.updated_at,
    
    -- Campos essenciais para sala de espera que estavam faltando
    a.data_chegada,
    a.codigo_autorizacao,
    a.numero_guia,
    a.data_autorizacao,
    a.validade_autorizacao,
    a.numero_agendamento,
    
    -- Paciente
    p.nome as paciente_nome,
    p.cpf as paciente_cpf,
    p.telefone as paciente_telefone,
    p.data_nascimento as paciente_nascimento,
    p.id as paciente_id,
    
    -- Unidade
    u.nome as unidade_nome,
    u.id as unidade_id,
    
    -- Sala
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.capacidade_maxima as sala_capacidade,
    s.cor as sala_cor,
    s.id as sala_id,
    
    -- Profissionais
    prof1.nome as profissional_nome,
    prof1.id as profissional_id,
    esp1.nome as profissional_especialidade,
    
    prof2.nome as profissional_2_nome,
    prof2.id as profissional_2_id,
    esp2.nome as profissional_2_especialidade,
    
    prof3.nome as profissional_3_nome,
    prof3.id as profissional_3_id,
    esp3.nome as profissional_3_especialidade,
    
    -- Sistema de Rotação
    a.profissional_ativo,
    a.tempo_profissional_1,
    a.tempo_profissional_2,
    a.tempo_profissional_3,
    a.rotacao_completa,
    a.profissional_inicio_timestamps,
    a.historico_rotacoes,
    
    -- Timer e sessão
    a.sessao_iniciada_em,
    a.sessao_pausada_em,
    a.sessao_finalizada_em,
    
    -- Cálculo do tempo atual da sessão
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_pausada_em IS NULL THEN
            EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60
        WHEN a.status = 'em_atendimento' AND a.sessao_pausada_em IS NOT NULL THEN
            EXTRACT(EPOCH FROM (a.sessao_pausada_em - a.sessao_iniciada_em)) / 60
        WHEN a.status = 'concluido' AND a.sessao_finalizada_em IS NOT NULL THEN
            EXTRACT(EPOCH FROM (a.sessao_finalizada_em - a.sessao_iniciada_em)) / 60
        ELSE 0
    END as tempo_sessao_atual,
    
    -- Status dinâmico baseado no tempo e rotação
    CASE 
        WHEN a.status = 'em_atendimento' AND a.rotacao_completa = TRUE THEN 'sessao_completa'
        WHEN a.status = 'em_atendimento' AND EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 
             AND a.profissional_ativo = 1 THEN 'troca_para_profissional_2'
        WHEN a.status = 'em_atendimento' AND EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 
             AND a.profissional_ativo = 2 THEN 'troca_para_profissional_3'
        WHEN a.status = 'em_atendimento' AND EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 
             AND a.profissional_ativo = 3 THEN 'sessao_completa'
        WHEN a.status = 'em_atendimento' THEN 'em_andamento'
        ELSE NULL
    END as status_dinamico,
    
    -- Próxima ação sugerida
    CASE 
        WHEN a.status = 'agendado' THEN 'Aguardando chegada do paciente'
        WHEN a.status = 'chegou' THEN 'Marcar como pronto para terapia'
        WHEN a.status = 'pronto_para_terapia' THEN 'Iniciar rotação com primeiro profissional'
        WHEN a.status = 'em_atendimento' AND a.rotacao_completa = TRUE THEN 'Finalizar sessão (rotação completa)'
        WHEN a.status = 'em_atendimento' AND a.profissional_ativo = 1 AND 
             EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 THEN 'Rotacionar para profissional 2'
        WHEN a.status = 'em_atendimento' AND a.profissional_ativo = 2 AND 
             EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 THEN 'Rotacionar para profissional 3'
        WHEN a.status = 'em_atendimento' AND a.profissional_ativo = 3 AND 
             EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 THEN 'Finalizar sessão'
        WHEN a.status = 'em_atendimento' THEN 'Em atendimento - aguardar 30 minutos'
        WHEN a.status = 'concluido' THEN 'Sessão finalizada'
        ELSE 'Aguardando ação'
    END as proxima_acao,
    
    -- Informações de progresso
    CASE 
        WHEN a.profissional_ativo = 1 THEN '1/3 - Primeiro Profissional'
        WHEN a.profissional_ativo = 2 THEN '2/3 - Segundo Profissional'
        WHEN a.profissional_ativo = 3 THEN '3/3 - Terceiro Profissional'
        ELSE '0/3 - Não Iniciado'
    END as progresso_rotacao,
    
    -- Convênio (se existir)
    conv.nome as convenio_nome,
    conv.id as convenio_id

FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN unidades u ON a.unidade_id = u.id
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN profissionais prof1 ON a.profissional_id = prof1.id
LEFT JOIN especialidades esp1 ON prof1.especialidade_id = esp1.id
LEFT JOIN profissionais prof2 ON a.profissional_2_id = prof2.id
LEFT JOIN especialidades esp2 ON prof2.especialidade_id = esp2.id
LEFT JOIN profissionais prof3 ON a.profissional_3_id = prof3.id
LEFT JOIN especialidades esp3 ON prof3.especialidade_id = esp3.id
LEFT JOIN convenios conv ON a.convenio_id = conv.id;

-- Comentário na view
COMMENT ON VIEW vw_agendamentos_completo IS 'View completa com informações de rotação de 3 profissionais, timers, status dinâmicos e campos para sala de espera';

-- Verificar se a view foi criada com sucesso
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'vw_agendamentos_completo') THEN
        RAISE NOTICE '✅ View vw_agendamentos_completo corrigida com sucesso!';
        RAISE NOTICE '✅ Campos adicionados: data_chegada, codigo_autorizacao, numero_guia, data_autorizacao, validade_autorizacao, numero_agendamento';
    ELSE
        RAISE NOTICE '⚠️ Erro ao criar view vw_agendamentos_completo!';
    END IF;
END $$;
