-- CORREÇÃO RÁPIDA: Sistema automatizado com nomes corretos das colunas

-- Função para processar transições automáticas de profissionais
CREATE OR REPLACE FUNCTION processar_transicoes_automaticas()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    agendamento_record RECORD;
    tempo_atual INTEGER;
    novo_profissional_ativo INTEGER;
    observacao_log TEXT;
BEGIN
    -- Processar todos os agendamentos em atendimento
    FOR agendamento_record IN 
        SELECT 
            id,
            tipo_sessao,
            profissional_ativo,
            sessao_iniciada_em,
            tempo_profissional_1,
            tempo_profissional_2,
            tempo_profissional_3,
            EXTRACT(EPOCH FROM (NOW() - sessao_iniciada_em))::INTEGER / 60 as tempo_decorrido_minutos
        FROM agendamentos 
        WHERE status = 'em_atendimento' 
        AND sessao_iniciada_em IS NOT NULL
    LOOP
        tempo_atual := agendamento_record.tempo_decorrido_minutos;
        novo_profissional_ativo := agendamento_record.profissional_ativo;
        observacao_log := '';

        -- Lógica para sessões TRIPLAS (3 profissionais × 30min = 90min total)
        IF agendamento_record.tipo_sessao = 'tripla' THEN
            IF tempo_atual >= 30 AND tempo_atual < 60 AND agendamento_record.profissional_ativo = 1 THEN
                -- Trocar para profissional 2 aos 30 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'Transição automática: Profissional 2 assumiu aos 30min';
                
            ELSIF tempo_atual >= 60 AND agendamento_record.profissional_ativo = 2 THEN
                -- Trocar para profissional 3 aos 60 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 3,
                    tempo_profissional_2 = 30,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'Transição automática: Profissional 3 assumiu aos 60min';
            
            ELSIF tempo_atual >= 90 THEN
                -- Marcar sessão como completa aos 90 minutos
                UPDATE agendamentos 
                SET 
                    tempo_profissional_3 = 30,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'Transição automática: Sessão tripla completa aos 90min';
            END IF;

        -- Lógica para sessões COMPARTILHADAS (2 profissionais × 30min = 60min total)
        ELSIF agendamento_record.tipo_sessao = 'compartilhada' THEN
            IF tempo_atual >= 30 AND agendamento_record.profissional_ativo = 1 THEN
                -- Trocar para profissional 2 aos 30 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'Transição automática: Profissional 2 assumiu aos 30min';
            
            ELSIF tempo_atual >= 60 THEN
                -- Marcar sessão como completa aos 60 minutos
                UPDATE agendamentos 
                SET 
                    tempo_profissional_2 = 30,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'Transição automática: Sessão compartilhada completa aos 60min';
            END IF;

        -- Lógica para sessões INDIVIDUAIS (1 profissional × 60min)
        ELSIF agendamento_record.tipo_sessao = 'individual' THEN
            IF tempo_atual >= 60 THEN
                -- Marcar sessão como completa aos 60 minutos
                UPDATE agendamentos 
                SET 
                    tempo_profissional_1 = 60,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'Transição automática: Sessão individual completa aos 60min';
            END IF;
        END IF;

        -- Registrar log da transição se houve mudança
        IF observacao_log != '' THEN
            INSERT INTO logs_agendamentos (
                agendamento_id,
                status_anterior,
                status_novo,
                observacoes,
                usuario_id,
                created_at
            ) VALUES (
                agendamento_record.id,
                'em_atendimento',
                'em_atendimento',
                observacao_log,
                '00000000-0000-0000-0000-000000000000', -- Sistema automático
                NOW()
            );
            
            RAISE NOTICE 'Transição processada: % - %', agendamento_record.id, observacao_log;
        END IF;
    END LOOP;
END;
$$;

-- Função para executar processamento automático
CREATE OR REPLACE FUNCTION executar_processamento_automatico()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    resultado TEXT;
BEGIN
    -- Executar transições automáticas
    PERFORM processar_transicoes_automaticas();
    
    resultado := 'Processamento automático executado em ' || NOW()::TEXT;
    
    RAISE NOTICE '%', resultado;
    RETURN resultado;
END;
$$;

-- Criar view atualizada com detecção automática de status (NOMES CORRETOS)
CREATE OR REPLACE VIEW vw_agenda_tempo_real_automatica AS
SELECT 
    a.id,
    a.paciente_id,
    p.nome as paciente_nome,
    a.sala_id,
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.cor as sala_cor,
    a.unidade_id,
    u.nome as unidade_nome,
    a.especialidade_id,
    e.nome as especialidade_nome,
    e.cor as especialidade_cor,
    a.horario_inicio::TEXT,
    a.horario_fim::TEXT,
    a.status,
    
    -- STATUS DINÂMICO AUTOMÁTICO baseado no tempo
    CASE 
        WHEN a.status != 'em_atendimento' THEN a.status
        WHEN a.sessao_iniciada_em IS NULL THEN 'em_atendimento'
        ELSE 
            CASE a.tipo_sessao
                WHEN 'tripla' THEN
                    CASE 
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 30 THEN 'em_andamento'
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 60 THEN 'troca_para_profissional_2'
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 90 THEN 'troca_para_profissional_3'
                        ELSE 'sessao_completa'
                    END
                WHEN 'compartilhada' THEN
                    CASE 
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 30 THEN 'em_andamento'
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 60 THEN 'troca_para_profissional_2'
                        ELSE 'sessao_completa'
                    END
                WHEN 'individual' THEN
                    CASE 
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 60 THEN 'em_andamento'
                        ELSE 'sessao_completa'
                    END
                ELSE 'em_andamento'
            END
    END as status_dinamico,

    -- TEMPO ATUAL DA SESSÃO
    CASE 
        WHEN a.sessao_iniciada_em IS NULL THEN 0
        ELSE GREATEST(0, EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60)
    END as tempo_sessao_atual,

    -- TEMPO RESTANTE
    CASE a.tipo_sessao
        WHEN 'tripla' THEN GREATEST(0, 90 - COALESCE(EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60, 0))
        WHEN 'compartilhada' THEN GREATEST(0, 60 - COALESCE(EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60, 0))
        WHEN 'individual' THEN GREATEST(0, 60 - COALESCE(EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60, 0))
        ELSE 60
    END as tempo_restante_minutos,

    -- DURAÇÃO PLANEJADA
    CASE a.tipo_sessao
        WHEN 'tripla' THEN 90
        WHEN 'compartilhada' THEN 60
        WHEN 'individual' THEN 60
        ELSE 60
    END as duracao_planejada,

    a.tipo_sessao,
    
    -- PROFISSIONAL ATIVO AUTOMÁTICO
    CASE 
        WHEN a.status != 'em_atendimento' THEN a.profissional_ativo
        WHEN a.sessao_iniciada_em IS NULL THEN a.profissional_ativo
        ELSE 
            CASE a.tipo_sessao
                WHEN 'tripla' THEN
                    CASE 
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 30 THEN 1
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 60 THEN 2
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 90 THEN 3
                        ELSE 3
                    END
                WHEN 'compartilhada' THEN
                    CASE 
                        WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 30 THEN 1
                        ELSE 2
                    END
                ELSE 1
            END
    END as profissional_ativo,

    -- Nomes dos profissionais (CORRIGIDO)
    c1.nome as profissional_nome,
    c2.nome as profissional_2_nome,
    c3.nome as profissional_3_nome,
    
    -- Próxima ação
    CASE a.status
        WHEN 'agendado' THEN 'Aguardando chegada do paciente'
        WHEN 'chegou' THEN 'Tabular guia na recepção'
        WHEN 'pronto_para_terapia' THEN 'Iniciar sessão de terapia'
        WHEN 'em_atendimento' THEN 
            CASE 
                WHEN a.sessao_iniciada_em IS NULL THEN 'Registrar início da sessão'
                ELSE 
                    CASE a.tipo_sessao
                        WHEN 'tripla' THEN
                            CASE 
                                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 30 THEN 'Em andamento com Profissional 1'
                                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 60 THEN 'Transição automática para Profissional 2'
                                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 90 THEN 'Transição automática para Profissional 3'
                                ELSE 'Sessão completa - Finalizar'
                            END
                        WHEN 'compartilhada' THEN
                            CASE 
                                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 30 THEN 'Em andamento com Profissional 1'
                                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 60 THEN 'Transição automática para Profissional 2'
                                ELSE 'Sessão completa - Finalizar'
                            END
                        ELSE 
                            CASE 
                                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 < 60 THEN 'Em andamento'
                                ELSE 'Sessão completa - Finalizar'
                            END
                    END
            END
        WHEN 'concluido' THEN 'Sessão finalizada'
        ELSE 'Status indefinido'
    END as proxima_acao,

    a.sessao_iniciada_em,
    a.created_at,
    a.updated_at

FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
JOIN salas s ON a.sala_id = s.id
JOIN unidades u ON a.unidade_id = u.id
JOIN especialidades e ON a.especialidade_id = e.id
JOIN colaboradores c1 ON a.profissional_id = c1.id
LEFT JOIN colaboradores c2 ON a.profissional_2_id = c2.id
LEFT JOIN colaboradores c3 ON a.profissional_3_id = c3.id
WHERE DATE(a.horario_inicio) = CURRENT_DATE
ORDER BY a.horario_inicio;

SELECT 'Sistema automatizado corrigido com sucesso!' as status;
SELECT 'Execute: SELECT executar_processamento_automatico(); para testar' as teste;
