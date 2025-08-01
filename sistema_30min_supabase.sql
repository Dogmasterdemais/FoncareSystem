-- ============================================================================
-- SISTEMA AUTOMATIZADO DE 30 MINUTOS - VERSÃO FINAL
-- ============================================================================
-- Execute este script completo no Supabase Dashboard > SQL Editor
-- 
-- FUNCIONALIDADES:
-- • Individual: 30min → concluído
-- • Compartilhada: 30min → Prof.2, 60min → concluído  
-- • Tripla: 30min → Prof.2, 60min → Prof.3, 90min → concluído
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
            a.id,
            p.nome as paciente_nome,
            a.tipo_sessao,
            a.profissional_ativo,
            a.sessao_iniciada_em,
            a.tempo_profissional_1,
            a.tempo_profissional_2,
            a.tempo_profissional_3,
            EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 as tempo_decorrido_minutos
        FROM agendamentos a
        LEFT JOIN pacientes p ON a.paciente_id = p.id
        WHERE a.status = 'em_atendimento' 
        AND a.sessao_iniciada_em IS NOT NULL
    LOOP
        tempo_atual := agendamento_record.tempo_decorrido_minutos;
        observacao_log := '';

        -- LÓGICA PARA SESSÕES INDIVIDUAIS (30min total)
        IF agendamento_record.tipo_sessao = 'individual' OR agendamento_record.tipo_sessao IS NULL THEN
            IF tempo_atual >= 30 THEN
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

        -- LÓGICA PARA SESSÕES COMPARTILHADAS (60min total)
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
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão compartilhada concluída aos 60min';
                contador_processados := contador_processados + 1;
            END IF;

        -- LÓGICA PARA SESSÕES TRIPLAS (90min total)
        ELSIF agendamento_record.tipo_sessao = 'tripla' THEN
            IF tempo_atual >= 30 AND tempo_atual < 60 AND agendamento_record.profissional_ativo = 1 THEN
                -- Trocar para profissional 2 aos 30 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 2 assumiu aos 30min (tripla)';
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
                observacao_log := 'AUTO: Profissional 3 assumiu aos 60min (tripla)';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 90 AND agendamento_record.profissional_ativo = 3 THEN
                -- Concluir sessão tripla aos 90 minutos
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
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
        END IF;

        -- Adicionar ao resultado se houve mudança
        IF observacao_log != '' THEN
            resultado := resultado || 'Paciente: ' || COALESCE(agendamento_record.paciente_nome, 'SEM NOME') || ' - ' || observacao_log || E'\n';
            RAISE NOTICE 'Transição: % - % - %', agendamento_record.id, agendamento_record.paciente_nome, observacao_log;
        END IF;
    END LOOP;

    -- Resultado final
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
    
    -- Log no console do Supabase
    RAISE NOTICE 'PROCESSAMENTO AUTOMÁTICO: %', resultado;
    
    RETURN resultado;
END;
$$;

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON FUNCTION processar_transicoes_automaticas() IS 
'Processa transições automáticas baseadas no tempo decorrido:
- Individual: 30min → concluído
- Compartilhada: 30min → Prof.2, 60min → concluído  
- Tripla: 30min → Prof.2, 60min → Prof.3, 90min → concluído';

COMMENT ON FUNCTION executar_processamento_automatico() IS 
'Função principal que executa o processamento automático de transições.
Chamada automaticamente pelo frontend a cada 30 segundos.
Retorna texto com resumo das transições processadas.';

-- ============================================================================
-- TESTE E VALIDAÇÃO
-- ============================================================================

-- Execute este comando para testar a função:
-- SELECT executar_processamento_automatico();

-- Para verificar agendamentos em atendimento:
-- SELECT id, paciente_id, tipo_sessao, profissional_ativo, sessao_iniciada_em,
--        EXTRACT(EPOCH FROM (NOW() - sessao_iniciada_em))::INTEGER / 60 as minutos_decorridos
-- FROM agendamentos 
-- WHERE status = 'em_atendimento' 
-- AND sessao_iniciada_em IS NOT NULL;

-- ============================================================================
-- MENSAGEM DE SUCESSO
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ SISTEMA DE 30 MINUTOS INSTALADO COM SUCESSO!';
    RAISE NOTICE '🔧 Funções criadas: processar_transicoes_automaticas(), executar_processamento_automatico()';
    RAISE NOTICE '🧪 Teste com: SELECT executar_processamento_automatico();';
    RAISE NOTICE '⚡ O frontend já está configurado para executar automaticamente a cada 30s';
END;
$$;
