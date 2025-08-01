-- ============================================================================
-- SISTEMA AUTOMATIZADO DE 30 MINUTOS - VERSÃO CORRIGIDA SEM LOGS
-- ============================================================================

-- Função para processar transições automáticas de profissionais
CREATE OR REPLACE FUNCTION processar_transicoes_automaticas()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    agendamento_record RECORD;
    tempo_atual INTEGER;
    observacao_log TEXT;
    contador_processados INTEGER := 0;
    resultado TEXT := '';
BEGIN
    -- Processar todos os agendamentos em atendimento
    FOR agendamento_record IN 
        SELECT 
            id,
            paciente_nome,
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
        observacao_log := '';

        -- Lógica para sessões TRIPLAS (3 profissionais × 30min = 90min total)
        IF agendamento_record.tipo_sessao = 'tripla' THEN
            IF tempo_atual >= 30 AND tempo_atual < 60 AND agendamento_record.profissional_ativo = 1 THEN
                -- Trocar para profissional 2 aos 30 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 2 assumiu aos 30min';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 60 AND tempo_atual < 90 AND agendamento_record.profissional_ativo = 2 THEN
                -- Trocar para profissional 3 aos 60 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 3,
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 3 assumiu aos 60min';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 90 AND agendamento_record.profissional_ativo = 3 THEN
                -- Concluir sessão tripla aos 90 minutos
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    profissional_ativo = 3,
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_profissional_3 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão tripla concluída aos 90min';
                contador_processados := contador_processados + 1;
            END IF;

        -- Lógica para sessões COMPARTILHADAS (2 profissionais × 30min = 60min total)
        ELSIF agendamento_record.tipo_sessao = 'compartilhada' THEN
            IF tempo_atual >= 30 AND tempo_atual < 60 AND agendamento_record.profissional_ativo = 1 THEN
                -- Trocar para profissional 2 aos 30 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 2 assumiu aos 30min (compartilhada)';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 60 AND agendamento_record.profissional_ativo = 2 THEN
                -- Concluir sessão compartilhada aos 60 minutos
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão compartilhada concluída aos 60min';
                contador_processados := contador_processados + 1;
            END IF;

        -- Lógica para sessões INDIVIDUAIS (1 profissional × 30min = 30min total)
        ELSE -- individual ou qualquer outro tipo
            IF tempo_atual >= 30 THEN
                -- Concluir sessão individual aos 30 minutos
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão individual concluída aos 30min';
                contador_processados := contador_processados + 1;
            END IF;
        END IF;

        -- Adicionar ao resultado se houve mudança
        IF observacao_log != '' THEN
            resultado := resultado || 'Paciente: ' || agendamento_record.paciente_nome || ' - ' || observacao_log || E'\n';
            RAISE NOTICE 'Transição: % - % - %', agendamento_record.id, agendamento_record.paciente_nome, observacao_log;
        END IF;
    END LOOP;

    IF contador_processados = 0 THEN
        resultado := 'Nenhuma transição automática necessária';
    ELSE
        resultado := 'Processados: ' || contador_processados || ' agendamentos' || E'\n' || resultado;
    END IF;

    RETURN resultado;
END;
$$;

-- Função principal para executar processamento automático
CREATE OR REPLACE FUNCTION executar_processamento_automatico()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    resultado TEXT;
BEGIN
    -- Executar transições automáticas
    resultado := processar_transicoes_automaticas();
    
    -- Adicionar timestamp
    resultado := '[' || NOW()::TEXT || '] ' || resultado;
    
    RAISE NOTICE 'PROCESSAMENTO AUTOMÁTICO: %', resultado;
    RETURN resultado;
END;
$$;

-- Comentários sobre o funcionamento
COMMENT ON FUNCTION executar_processamento_automatico() IS 
'Executa processamento automático de transições de profissionais a cada 30 minutos.
- Individual: 30min → concluído
- Compartilhada: 30min → Prof.2, 60min → concluído  
- Tripla: 30min → Prof.2, 60min → Prof.3, 90min → concluído';

-- Instrução de uso
SELECT '🚀 Execute: SELECT executar_processamento_automatico(); para testar' as teste;
