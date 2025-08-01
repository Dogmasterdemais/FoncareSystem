-- ============================================================================
-- LIMPEZA COMPLETA E INSTALAÇÃO DO SISTEMA DE 30 MINUTOS
-- ============================================================================
-- Execute este script COMPLETO no Supabase Dashboard
-- Ele vai limpar as funções antigas e instalar as corretas
-- ============================================================================

-- 1. REMOVER FUNÇÕES ANTIGAS (se existirem)
DROP FUNCTION IF EXISTS processar_transicoes_automaticas() CASCADE;
DROP FUNCTION IF EXISTS executar_processamento_automatico() CASCADE;
DROP FUNCTION IF EXISTS alocar_paciente_profissional(UUID, INTEGER, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS rotacionar_paciente_profissional(UUID, INTEGER, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS verificar_rotacoes_automaticas() CASCADE;
DROP FUNCTION IF EXISTS obter_estatisticas_sala(UUID) CASCADE;

SELECT '🧹 LIMPEZA CONCLUÍDA - Funções antigas removidas' as limpeza;

-- ============================================================================
-- 2. CRIAR FUNÇÃO PRINCIPAL DE PROCESSAMENTO DE 30 MINUTOS
-- ============================================================================

CREATE OR REPLACE FUNCTION executar_processamento_automatico()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    agendamento_record RECORD;
    tempo_atual INTEGER;
    observacao_log TEXT;
    contador_processados INTEGER := 0;
    resultado TEXT := '';
BEGIN
    -- Log de início
    RAISE NOTICE 'Iniciando processamento automático de transições...';
    
    -- Processar todos os agendamentos em atendimento
    FOR agendamento_record IN 
        SELECT 
            a.id,
            p.nome as paciente_nome,
            COALESCE(a.tipo_sessao, 'individual') as tipo_sessao,
            COALESCE(a.profissional_ativo, 1) as profissional_ativo,
            a.sessao_iniciada_em,
            a.tempo_profissional_1,
            a.tempo_profissional_2,
            a.tempo_profissional_3,
            EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 as tempo_decorrido_minutos,
            s.numero as sala_numero
        FROM agendamentos a
        LEFT JOIN pacientes p ON a.paciente_id = p.id
        LEFT JOIN salas s ON a.sala_id = s.id
        WHERE a.status = 'em_atendimento' 
        AND a.sessao_iniciada_em IS NOT NULL
        AND a.data_agendamento = CURRENT_DATE
    LOOP
        tempo_atual := agendamento_record.tempo_decorrido_minutos;
        observacao_log := '';

        -- LÓGICA PARA SESSÕES INDIVIDUAIS (30min total)
        IF agendamento_record.tipo_sessao = 'individual' THEN
            IF tempo_atual >= 30 THEN
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW(),
                    observacoes = COALESCE(observacoes, '') || 
                        format(' [%s] AUTO: Sessão individual concluída aos %smin', NOW()::text, tempo_atual)
                WHERE id = agendamento_record.id;
                
                observacao_log := format('AUTO: Sessão individual concluída aos %smin', tempo_atual);
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
                    updated_at = NOW(),
                    observacoes = COALESCE(observacoes, '') || 
                        format(' [%s] AUTO: Profissional 2 assumiu aos %smin', NOW()::text, tempo_atual)
                WHERE id = agendamento_record.id;
                
                observacao_log := format('AUTO: Profissional 2 assumiu aos %smin (compartilhada)', tempo_atual);
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
                    updated_at = NOW(),
                    observacoes = COALESCE(observacoes, '') || 
                        format(' [%s] AUTO: Sessão compartilhada concluída aos %smin', NOW()::text, tempo_atual)
                WHERE id = agendamento_record.id;
                
                observacao_log := format('AUTO: Sessão compartilhada concluída aos %smin', tempo_atual);
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
                    updated_at = NOW(),
                    observacoes = COALESCE(observacoes, '') || 
                        format(' [%s] AUTO: Profissional 2 assumiu aos %smin', NOW()::text, tempo_atual)
                WHERE id = agendamento_record.id;
                
                observacao_log := format('AUTO: Profissional 2 assumiu aos %smin (tripla)', tempo_atual);
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 60 AND tempo_atual < 90 AND agendamento_record.profissional_ativo = 2 THEN
                -- Trocar para profissional 3 aos 60 minutos
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 3,
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW(),
                    observacoes = COALESCE(observacoes, '') || 
                        format(' [%s] AUTO: Profissional 3 assumiu aos %smin', NOW()::text, tempo_atual)
                WHERE id = agendamento_record.id;
                
                observacao_log := format('AUTO: Profissional 3 assumiu aos %smin (tripla)', tempo_atual);
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
                    updated_at = NOW(),
                    observacoes = COALESCE(observacoes, '') || 
                        format(' [%s] AUTO: Sessão tripla concluída aos %smin', NOW()::text, tempo_atual)
                WHERE id = agendamento_record.id;
                
                observacao_log := format('AUTO: Sessão tripla concluída aos %smin', tempo_atual);
                contador_processados := contador_processados + 1;
            END IF;
        END IF;

        -- Adicionar ao resultado se houve mudança
        IF observacao_log != '' THEN
            resultado := resultado || format('Paciente: %s (Sala %s) - %s', 
                COALESCE(agendamento_record.paciente_nome, 'SEM NOME'), 
                COALESCE(agendamento_record.sala_numero, '?'),
                observacao_log
            ) || E'\n';
            
            RAISE NOTICE 'Transição: % - % - %', agendamento_record.id, agendamento_record.paciente_nome, observacao_log;
        END IF;
    END LOOP;

    -- Resultado final
    IF contador_processados = 0 THEN
        resultado := 'Nenhuma transição automática necessária';
    ELSE
        resultado := format('Processados: %s agendamentos', contador_processados) || E'\n' || resultado;
    END IF;

    -- Adicionar timestamp
    resultado := '[' || NOW()::TEXT || '] ' || resultado;
    
    -- Log final
    RAISE NOTICE 'PROCESSAMENTO AUTOMÁTICO CONCLUÍDO: %', resultado;
    
    RETURN resultado;
END;
$$;

-- ============================================================================
-- 3. CRIAR FUNÇÕES AUXILIARES PARA CONTROLE MANUAL
-- ============================================================================

CREATE OR REPLACE FUNCTION iniciar_atendimento_manual(
    p_agendamento_id UUID,
    p_tipo_sessao TEXT DEFAULT 'individual'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_resultado TEXT;
BEGIN
    UPDATE agendamentos 
    SET 
        status = 'em_atendimento',
        sessao_iniciada_em = NOW(),
        tempo_sessao_atual = 0,
        profissional_ativo = 1,
        tipo_sessao = p_tipo_sessao,
        updated_at = NOW(),
        observacoes = COALESCE(observacoes, '') || 
            format(' [%s] MANUAL: Atendimento iniciado (%s)', NOW()::text, p_tipo_sessao)
    WHERE id = p_agendamento_id;
    
    v_resultado := format('Atendimento iniciado para agendamento %s (tipo: %s)', p_agendamento_id, p_tipo_sessao);
    RAISE NOTICE '%', v_resultado;
    
    RETURN v_resultado;
END;
$$;

CREATE OR REPLACE FUNCTION concluir_atendimento_manual(p_agendamento_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_resultado TEXT;
    v_tempo_atual INTEGER;
BEGIN
    -- Calcular tempo atual
    SELECT EXTRACT(EPOCH FROM (NOW() - sessao_iniciada_em))::INTEGER / 60
    INTO v_tempo_atual
    FROM agendamentos 
    WHERE id = p_agendamento_id;
    
    UPDATE agendamentos 
    SET 
        status = 'concluido',
        sessao_finalizada_em = NOW(),
        tempo_sessao_atual = v_tempo_atual,
        updated_at = NOW(),
        observacoes = COALESCE(observacoes, '') || 
            format(' [%s] MANUAL: Atendimento concluído aos %smin', NOW()::text, v_tempo_atual)
    WHERE id = p_agendamento_id;
    
    v_resultado := format('Atendimento concluído para agendamento %s (%s minutos)', p_agendamento_id, v_tempo_atual);
    RAISE NOTICE '%', v_resultado;
    
    RETURN v_resultado;
END;
$$;

-- ============================================================================
-- 4. COMENTÁRIOS E PERMISSÕES
-- ============================================================================

COMMENT ON FUNCTION executar_processamento_automatico() IS 
'Função principal que executa o processamento automático de transições de 30 minutos.
- Individual: 30min → concluído
- Compartilhada: 30min → Prof.2, 60min → concluído  
- Tripla: 30min → Prof.2, 60min → Prof.3, 90min → concluído
Chamada automaticamente pelo frontend a cada 30 segundos.';

COMMENT ON FUNCTION iniciar_atendimento_manual(UUID, TEXT) IS 
'Inicia um atendimento manualmente com tipo de sessão especificado';

COMMENT ON FUNCTION concluir_atendimento_manual(UUID) IS 
'Conclui um atendimento manualmente';

-- Conceder permissões
GRANT EXECUTE ON FUNCTION executar_processamento_automatico() TO authenticated;
GRANT EXECUTE ON FUNCTION iniciar_atendimento_manual(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION concluir_atendimento_manual(UUID) TO authenticated;

-- ============================================================================
-- 5. MENSAGEM FINAL DE SUCESSO
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ SISTEMA DE 30 MINUTOS INSTALADO COM SUCESSO!';
    RAISE NOTICE '🔧 Função principal: executar_processamento_automatico()';
    RAISE NOTICE '🔧 Funções auxiliares: iniciar_atendimento_manual(), concluir_atendimento_manual()';
    RAISE NOTICE '🧪 Teste com: SELECT executar_processamento_automatico();';
    RAISE NOTICE '⚡ O frontend já está configurado para executar automaticamente a cada 30s';
    RAISE NOTICE '📋 Funcionalidades:';
    RAISE NOTICE '   - Individual: 30min → concluído';
    RAISE NOTICE '   - Compartilhada: 30min → Prof.2, 60min → concluído';
    RAISE NOTICE '   - Tripla: 30min → Prof.2, 60min → Prof.3, 90min → concluído';
END;
$$;
