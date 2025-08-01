-- Implementar nova regra de duração de sessões
-- Anamnese e Neuropsicologia: duração flexível baseada no tipo_sessao
-- Demais salas de terapia: duração fixa de 90 minutos
-- Execute no Supabase SQL Editor

-- 1. Primeiro, vamos atualizar a view principal
DROP VIEW IF EXISTS vw_agendamentos_completo;

-- 2. Recriar view com nova regra de duração
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
    
    -- NOVA REGRA DE DURAÇÃO: 90 min para terapias, flexível para anamnese/neuropsicologia
    CASE 
        -- Para Anamnese: duração flexível baseada no tipo_sessao
        WHEN LOWER(s.nome) LIKE '%anamnese%' THEN
            CASE 
                WHEN a.tipo_sessao = 'individual' THEN 30
                WHEN a.tipo_sessao = 'compartilhada' THEN 60  
                WHEN a.tipo_sessao = 'tripla' THEN 90
                ELSE 60
            END
        -- Para Neuropsicologia: duração flexível baseada no tipo_sessao
        WHEN LOWER(s.nome) LIKE '%neuropsicolog%' THEN
            CASE 
                WHEN a.tipo_sessao = 'individual' THEN 30
                WHEN a.tipo_sessao = 'compartilhada' THEN 60  
                WHEN a.tipo_sessao = 'tripla' THEN 90
                ELSE 60
            END
        -- Para todas as outras salas de terapia: duração fixa de 90 minutos
        ELSE 90
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

-- 3. Atualizar também as funções que dependem da duração
-- Função para determinar duração baseada na sala
CREATE OR REPLACE FUNCTION obter_duracao_sessao(sala_nome TEXT, tipo_sessao TEXT DEFAULT 'compartilhada')
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Para Anamnese: duração flexível
    IF LOWER(sala_nome) LIKE '%anamnese%' THEN
        CASE tipo_sessao
            WHEN 'individual' THEN RETURN 30;
            WHEN 'compartilhada' THEN RETURN 60;
            WHEN 'tripla' THEN RETURN 90;
            ELSE RETURN 60;
        END CASE;
    END IF;
    
    -- Para Neuropsicologia: duração flexível
    IF LOWER(sala_nome) LIKE '%neuropsicolog%' THEN
        CASE tipo_sessao
            WHEN 'individual' THEN RETURN 30;
            WHEN 'compartilhada' THEN RETURN 60;
            WHEN 'tripla' THEN RETURN 90;
            ELSE RETURN 60;
        END CASE;
    END IF;
    
    -- Para todas as outras salas de terapia: 90 minutos fixo
    RETURN 90;
END;
$$;

-- 4. Teste da nova regra
SELECT 
    'Teste da nova regra de duração:' as info,
    s.nome as sala,
    'individual' as tipo_sessao,
    obter_duracao_sessao(s.nome, 'individual') as duracao_individual,
    'compartilhada' as tipo_sessao_2,
    obter_duracao_sessao(s.nome, 'compartilhada') as duracao_compartilhada,
    'tripla' as tipo_sessao_3,
    obter_duracao_sessao(s.nome, 'tripla') as duracao_tripla
FROM salas s
WHERE s.ativo = true
AND (LOWER(s.nome) LIKE '%anamnese%' 
     OR LOWER(s.nome) LIKE '%neuropsicolog%' 
     OR LOWER(s.nome) LIKE '%fono%'
     OR LOWER(s.nome) LIKE '%psicolog%')
ORDER BY s.nome
LIMIT 10;

-- 5. Verificar a view atualizada
SELECT 
    'Verificação da view atualizada:' as titulo,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN duracao_planejada = 90 THEN 1 END) as com_90_minutos,
    COUNT(CASE WHEN duracao_planejada != 90 THEN 1 END) as com_duracao_flexivel,
    COUNT(CASE WHEN LOWER(sala_nome) LIKE '%anamnese%' OR LOWER(sala_nome) LIKE '%neuropsicolog%' THEN 1 END) as anamnese_neuropsico
FROM vw_agendamentos_completo
WHERE data_agendamento = CURRENT_DATE;

-- Mensagem final
SELECT '✅ REGRA DE DURAÇÃO IMPLEMENTADA!' as resultado;
SELECT 'Anamnese e Neuropsicologia: duração flexível (30/60/90 min)' as regra_1;
SELECT 'Demais salas de terapia: duração fixa de 90 minutos' as regra_2;
SELECT 'Isso permite rotação de 30 em 30 minutos entre profissionais' as explicacao;
