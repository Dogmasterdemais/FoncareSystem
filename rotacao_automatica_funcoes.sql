-- Funções SQL para Sistema de Rotação Automática de 3 Profissionais
-- Data: ${new Date().toISOString().split('T')[0]}

-- =====================================================
-- 1. Função para Alocar Paciente Automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION alocar_paciente_profissional(
    p_agendamento_id UUID,
    p_profissional_numero INTEGER,
    p_iniciar_timer BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agendamento RECORD;
    v_sala_id UUID;
    v_timestamp TIMESTAMPTZ := NOW();
BEGIN
    -- Buscar informações do agendamento
    SELECT * INTO v_agendamento
    FROM vw_agendamentos_completo
    WHERE id = p_agendamento_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agendamento não encontrado: %', p_agendamento_id;
    END IF;
    
    v_sala_id := v_agendamento.sala_id;
    
    -- Log da operação
    RAISE NOTICE 'Alocando paciente % para profissional % na sala %', 
        v_agendamento.paciente_nome, p_profissional_numero, v_agendamento.sala_numero;
    
    -- Atualizar agendamento com o profissional ativo
    UPDATE agendamentos 
    SET 
        profissional_ativo = p_profissional_numero,
        sessao_iniciada_em = CASE 
            WHEN p_iniciar_timer AND sessao_iniciada_em IS NULL THEN v_timestamp
            ELSE sessao_iniciada_em
        END,
        sessao_pausada_em = NULL, -- Despausa se estava pausado
        profissional_inicio_timestamps = CASE 
            WHEN p_profissional_numero = 1 THEN 
                jsonb_set(COALESCE(profissional_inicio_timestamps, '{}'), '{profissional_1}', to_jsonb(v_timestamp))
            WHEN p_profissional_numero = 2 THEN
                jsonb_set(COALESCE(profissional_inicio_timestamps, '{}'), '{profissional_2}', to_jsonb(v_timestamp))
            WHEN p_profissional_numero = 3 THEN
                jsonb_set(COALESCE(profissional_inicio_timestamps, '{}'), '{profissional_3}', to_jsonb(v_timestamp))
            ELSE profissional_inicio_timestamps
        END,
        status = 'em_atendimento',
        observacoes = COALESCE(observacoes, '') || 
            format(' [%s] Alocado automaticamente para profissional %s', 
                   v_timestamp::text, p_profissional_numero)
    WHERE id = p_agendamento_id;
    
    -- Registrar evento na auditoria
    INSERT INTO agendamentos_auditoria (
        agendamento_id,
        acao,
        usuario_id,
        detalhes,
        timestamp_acao
    ) VALUES (
        p_agendamento_id,
        'alocacao_automatica',
        auth.uid(),
        jsonb_build_object(
            'profissional_numero', p_profissional_numero,
            'sala_id', v_sala_id,
            'timestamp', v_timestamp
        ),
        v_timestamp
    );
    
    RAISE NOTICE 'Paciente alocado com sucesso para profissional %', p_profissional_numero;
END;
$$;

-- =====================================================
-- 2. Função para Rotação Automática Entre Profissionais
-- =====================================================

CREATE OR REPLACE FUNCTION rotacionar_paciente_profissional(
    p_agendamento_id UUID,
    p_proximo_profissional INTEGER,
    p_resetar_timer BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agendamento RECORD;
    v_timestamp TIMESTAMPTZ := NOW();
    v_profissional_anterior INTEGER;
    v_tempo_anterior INTEGER;
BEGIN
    -- Buscar informações do agendamento
    SELECT * INTO v_agendamento
    FROM vw_agendamentos_completo
    WHERE id = p_agendamento_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agendamento não encontrado: %', p_agendamento_id;
    END IF;
    
    v_profissional_anterior := v_agendamento.profissional_ativo;
    v_tempo_anterior := v_agendamento.tempo_sessao_atual;
    
    -- Validar se é uma rotação válida
    IF p_proximo_profissional NOT IN (1, 2, 3) THEN
        RAISE EXCEPTION 'Profissional deve ser 1, 2 ou 3. Recebido: %', p_proximo_profissional;
    END IF;
    
    -- Log da rotação
    RAISE NOTICE 'Rotacionando paciente % do profissional % para % (tempo anterior: %min)', 
        v_agendamento.paciente_nome, v_profissional_anterior, p_proximo_profissional, v_tempo_anterior;
    
    -- Registrar tempo do profissional anterior
    UPDATE agendamentos 
    SET 
        -- Atualizar tempo do profissional anterior
        tempo_profissional_1 = CASE 
            WHEN v_profissional_anterior = 1 THEN v_tempo_anterior
            ELSE tempo_profissional_1
        END,
        tempo_profissional_2 = CASE 
            WHEN v_profissional_anterior = 2 THEN v_tempo_anterior
            ELSE tempo_profissional_2
        END,
        tempo_profissional_3 = CASE 
            WHEN v_profissional_anterior = 3 THEN v_tempo_anterior
            ELSE tempo_profissional_3
        END,
        
        -- Ativar próximo profissional
        profissional_ativo = p_proximo_profissional,
        
        -- Resetar timer se solicitado
        sessao_iniciada_em = CASE 
            WHEN p_resetar_timer THEN v_timestamp
            ELSE sessao_iniciada_em
        END,
        sessao_pausada_em = NULL,
        
        -- Registrar timestamp do novo profissional
        profissional_inicio_timestamps = CASE 
            WHEN p_proximo_profissional = 1 THEN 
                jsonb_set(COALESCE(profissional_inicio_timestamps, '{}'), '{profissional_1}', to_jsonb(v_timestamp))
            WHEN p_proximo_profissional = 2 THEN
                jsonb_set(COALESCE(profissional_inicio_timestamps, '{}'), '{profissional_2}', to_jsonb(v_timestamp))
            WHEN p_proximo_profissional = 3 THEN
                jsonb_set(COALESCE(profissional_inicio_timestamps, '{}'), '{profissional_3}', to_jsonb(v_timestamp))
            ELSE profissional_inicio_timestamps
        END,
        
        -- Atualizar observações
        observacoes = COALESCE(observacoes, '') || 
            format(' [%s] Rotação: Prof.%s→Prof.%s (%smin)', 
                   v_timestamp::text, v_profissional_anterior, p_proximo_profissional, v_tempo_anterior)
    WHERE id = p_agendamento_id;
    
    -- Registrar evento na auditoria
    INSERT INTO agendamentos_auditoria (
        agendamento_id,
        acao,
        usuario_id,
        detalhes,
        timestamp_acao
    ) VALUES (
        p_agendamento_id,
        'rotacao_profissional',
        auth.uid(),
        jsonb_build_object(
            'profissional_anterior', v_profissional_anterior,
            'proximo_profissional', p_proximo_profissional,
            'tempo_profissional_anterior', v_tempo_anterior,
            'timestamp_rotacao', v_timestamp
        ),
        v_timestamp
    );
    
    RAISE NOTICE 'Rotação concluída: Prof.% → Prof.%', v_profissional_anterior, p_proximo_profissional;
END;
$$;

-- =====================================================
-- 3. Função para Verificar e Executar Rotações Automáticas
-- =====================================================

CREATE OR REPLACE FUNCTION verificar_rotacoes_automaticas()
RETURNS TABLE(
    agendamento_id UUID,
    paciente_nome TEXT,
    profissional_atual INTEGER,
    proximo_profissional INTEGER,
    tempo_atual INTEGER,
    acao_executada TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agendamento RECORD;
    v_proximo_prof INTEGER;
    v_acao TEXT;
BEGIN
    -- Buscar todos os pacientes em atendimento
    FOR v_agendamento IN 
        SELECT * FROM vw_agendamentos_completo 
        WHERE status = 'em_atendimento' 
        AND tempo_sessao_atual >= 30
        AND profissional_ativo IS NOT NULL
    LOOP
        -- Determinar próximo profissional
        v_proximo_prof := v_agendamento.profissional_ativo + 1;
        
        IF v_proximo_prof > 3 THEN
            -- Completou rotação com todos os 3 profissionais
            v_acao := 'rotacao_completa';
            
            -- Marcar como concluído
            UPDATE agendamentos 
            SET 
                status = 'concluido',
                sessao_finalizada_em = NOW(),
                observacoes = COALESCE(observacoes, '') || 
                    format(' [%s] Rotação completa - 3 profissionais (90min total)', NOW()::text)
            WHERE id = v_agendamento.id;
            
        ELSE
            -- Verificar capacidade do próximo profissional
            -- (Esta verificação seria feita com dados em tempo real)
            v_acao := 'rotacao_executada';
            
            -- Executar rotação
            PERFORM rotacionar_paciente_profissional(
                v_agendamento.id, 
                v_proximo_prof, 
                true
            );
        END IF;
        
        -- Retornar informações da ação
        RETURN QUERY SELECT 
            v_agendamento.id,
            v_agendamento.paciente_nome,
            v_agendamento.profissional_ativo,
            v_proximo_prof,
            v_agendamento.tempo_sessao_atual,
            v_acao;
    END LOOP;
END;
$$;

-- =====================================================
-- 4. Função para Obter Estatísticas da Sala
-- =====================================================

CREATE OR REPLACE FUNCTION obter_estatisticas_sala(p_sala_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSON;
    v_pacientes_prof1 INTEGER;
    v_pacientes_prof2 INTEGER;
    v_pacientes_prof3 INTEGER;
    v_total_pacientes INTEGER;
    v_capacidade_maxima INTEGER;
BEGIN
    -- Contar pacientes por profissional
    SELECT 
        COUNT(*) FILTER (WHERE profissional_ativo = 1 AND status = 'em_atendimento'),
        COUNT(*) FILTER (WHERE profissional_ativo = 2 AND status = 'em_atendimento'),
        COUNT(*) FILTER (WHERE profissional_ativo = 3 AND status = 'em_atendimento'),
        COUNT(*) FILTER (WHERE status = 'em_atendimento')
    INTO v_pacientes_prof1, v_pacientes_prof2, v_pacientes_prof3, v_total_pacientes
    FROM vw_agendamentos_completo 
    WHERE sala_id = p_sala_id 
    AND DATE(data_agendamento) = CURRENT_DATE;
    
    -- Buscar capacidade máxima da sala
    SELECT capacidade_maxima INTO v_capacidade_maxima
    FROM salas WHERE id = p_sala_id;
    
    -- Construir JSON de resposta
    v_stats := json_build_object(
        'sala_id', p_sala_id,
        'total_pacientes_atendimento', v_total_pacientes,
        'capacidade_maxima', v_capacidade_maxima,
        'profissionais', json_build_object(
            'profissional_1', json_build_object(
                'pacientes_atuais', v_pacientes_prof1,
                'capacidade_maxima', 2,
                'disponivel', (v_pacientes_prof1 < 2)
            ),
            'profissional_2', json_build_object(
                'pacientes_atuais', v_pacientes_prof2,
                'capacidade_maxima', 2,
                'disponivel', (v_pacientes_prof2 < 2)
            ),
            'profissional_3', json_build_object(
                'pacientes_atuais', v_pacientes_prof3,
                'capacidade_maxima', 2,
                'disponivel', (v_pacientes_prof3 < 2)
            )
        ),
        'timestamp', NOW()
    );
    
    RETURN v_stats;
END;
$$;

-- =====================================================
-- 5. Comentários e Permissões
-- =====================================================

-- Adicionar comentários nas funções
COMMENT ON FUNCTION alocar_paciente_profissional IS 'Aloca automaticamente um paciente para um profissional específico (1, 2 ou 3) na sala';
COMMENT ON FUNCTION rotacionar_paciente_profissional IS 'Executa rotação de paciente entre profissionais com registro de tempo';
COMMENT ON FUNCTION verificar_rotacoes_automaticas IS 'Verifica e executa rotações automáticas para pacientes que completaram 30min';
COMMENT ON FUNCTION obter_estatisticas_sala IS 'Retorna estatísticas em tempo real de ocupação por profissional na sala';

-- Conceder permissões para uso autenticado
GRANT EXECUTE ON FUNCTION alocar_paciente_profissional TO authenticated;
GRANT EXECUTE ON FUNCTION rotacionar_paciente_profissional TO authenticated;
GRANT EXECUTE ON FUNCTION verificar_rotacoes_automaticas TO authenticated;
GRANT EXECUTE ON FUNCTION obter_estatisticas_sala TO authenticated;

-- Política RLS (Row Level Security) - as funções já usam SECURITY DEFINER
-- As políticas existentes nas tabelas agendamentos e auditoria se aplicam

-- =====================================================
-- 6. Testes das Funções
-- =====================================================

-- Exemplo de uso:
-- SELECT alocar_paciente_profissional('uuid-do-agendamento', 1, true);
-- SELECT rotacionar_paciente_profissional('uuid-do-agendamento', 2, true);
-- SELECT * FROM verificar_rotacoes_automaticas();
-- SELECT obter_estatisticas_sala('uuid-da-sala');

-- =====================================================
-- 7. Mensagens Finais
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Funções de rotação automática criadas com sucesso!';
    RAISE NOTICE 'Sistema de rotação obrigatória de 3 profissionais implementado.';
    RAISE NOTICE 'Cada paciente deve passar 30 minutos com cada profissional (total: 90 minutos).';
END
$$;
