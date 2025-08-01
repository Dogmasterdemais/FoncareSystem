-- Sistema de Controle de Status dos Pacientes - Agenda
-- Este script adiciona campos necessários para controle de sessões terapêuticas

-- 1. Adicionar campos para controle de sessões terapêuticas
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS sessao_iniciada_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sessao_pausada_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sessao_finalizada_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tempo_sessao_minutos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profissional_1_id UUID REFERENCES colaboradores(id),
ADD COLUMN IF NOT EXISTS profissional_2_id UUID REFERENCES colaboradores(id),
ADD COLUMN IF NOT EXISTS tempo_profissional_1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tempo_profissional_2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profissional_ativo INTEGER DEFAULT 1, -- 1 ou 2 (qual profissional está ativo)
ADD COLUMN IF NOT EXISTS duracao_planejada INTEGER DEFAULT 60, -- duração em minutos
ADD COLUMN IF NOT EXISTS tipo_sessao VARCHAR(20) DEFAULT 'individual', -- 'individual' ou 'compartilhada'
ADD COLUMN IF NOT EXISTS observacoes_sessao TEXT;

-- 2. Atualizar status permitidos para incluir novos estados
-- Comentário: Os status serão: 'agendado', 'chegou', 'pronto_para_terapia', 'em_atendimento', 'sessao_pausada', 'concluido', 'faltou', 'cancelado'

-- 3. Criar tabela de log de mudanças de status para auditoria
CREATE TABLE IF NOT EXISTS agendamentos_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES colaboradores(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    observacoes TEXT,
    tempo_sessao_atual INTEGER DEFAULT 0,
    profissional_ativo INTEGER DEFAULT 1
);

-- 4. Criar função para calcular tempo de sessão automaticamente
CREATE OR REPLACE FUNCTION calcular_tempo_sessao(
    p_agendamento_id UUID
) RETURNS TABLE (
    tempo_total INTEGER,
    tempo_prof_1 INTEGER,
    tempo_prof_2 INTEGER,
    status_atual VARCHAR(50)
) AS $$
DECLARE
    rec RECORD;
    tempo_calculado INTEGER := 0;
    tempo_p1 INTEGER := 0;
    tempo_p2 INTEGER := 0;
BEGIN
    -- Buscar dados do agendamento
    SELECT 
        a.sessao_iniciada_em,
        a.sessao_pausada_em,
        a.sessao_finalizada_em,
        a.tempo_profissional_1,
        a.tempo_profissional_2,
        a.profissional_ativo,
        a.status,
        a.duracao_planejada,
        a.tipo_sessao
    INTO rec
    FROM agendamentos a
    WHERE a.id = p_agendamento_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0, 0, 0, 'not_found'::VARCHAR(50);
        RETURN;
    END IF;
    
    -- Calcular tempo baseado no status atual
    IF rec.status = 'em_atendimento' AND rec.sessao_iniciada_em IS NOT NULL THEN
        -- Sessão em andamento
        tempo_calculado := EXTRACT(EPOCH FROM (NOW() - rec.sessao_iniciada_em)) / 60;
        
        -- Para sessão compartilhada (30min cada profissional)
        IF rec.tipo_sessao = 'compartilhada' THEN
            IF tempo_calculado <= 30 THEN
                -- Primeiro profissional ativo
                tempo_p1 := tempo_calculado;
                tempo_p2 := rec.tempo_profissional_2;
            ELSE
                -- Segundo profissional ativo
                tempo_p1 := 30; -- máximo do primeiro
                tempo_p2 := LEAST(tempo_calculado - 30, 30); -- até 30min para o segundo
            END IF;
        ELSE
            -- Sessão individual (60min)
            tempo_p1 := LEAST(tempo_calculado, 60);
            tempo_p2 := 0;
        END IF;
        
    ELSIF rec.status = 'concluido' AND rec.sessao_finalizada_em IS NOT NULL THEN
        -- Sessão finalizada
        tempo_calculado := EXTRACT(EPOCH FROM (rec.sessao_finalizada_em - rec.sessao_iniciada_em)) / 60;
        tempo_p1 := rec.tempo_profissional_1;
        tempo_p2 := rec.tempo_profissional_2;
        
    ELSE
        -- Outros status
        tempo_p1 := rec.tempo_profissional_1;
        tempo_p2 := rec.tempo_profissional_2;
        tempo_calculado := tempo_p1 + tempo_p2;
    END IF;
    
    RETURN QUERY SELECT 
        tempo_calculado::INTEGER,
        tempo_p1::INTEGER,
        tempo_p2::INTEGER,
        rec.status;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar função para mudança de status com log automático
CREATE OR REPLACE FUNCTION atualizar_status_agendamento(
    p_agendamento_id UUID,
    p_novo_status VARCHAR(50),
    p_user_id UUID DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    status_anterior VARCHAR(50);
    tempo_atual INTEGER;
    prof_ativo INTEGER;
BEGIN
    -- Buscar status anterior
    SELECT status, profissional_ativo 
    INTO status_anterior, prof_ativo
    FROM agendamentos 
    WHERE id = p_agendamento_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Calcular tempo atual se necessário
    SELECT tempo_total INTO tempo_atual
    FROM calcular_tempo_sessao(p_agendamento_id);
    
    -- Atualizar campos baseado no novo status
    CASE p_novo_status
        WHEN 'em_atendimento' THEN
            UPDATE agendamentos SET
                status = p_novo_status,
                sessao_iniciada_em = COALESCE(sessao_iniciada_em, NOW()),
                updated_at = NOW()
            WHERE id = p_agendamento_id;
            
        WHEN 'sessao_pausada' THEN
            UPDATE agendamentos SET
                status = p_novo_status,
                sessao_pausada_em = NOW(),
                tempo_sessao_minutos = tempo_atual,
                updated_at = NOW()
            WHERE id = p_agendamento_id;
            
        WHEN 'concluido' THEN
            UPDATE agendamentos SET
                status = p_novo_status,
                sessao_finalizada_em = NOW(),
                tempo_sessao_minutos = tempo_atual,
                updated_at = NOW()
            WHERE id = p_agendamento_id;
            
        ELSE
            UPDATE agendamentos SET
                status = p_novo_status,
                updated_at = NOW()
            WHERE id = p_agendamento_id;
    END CASE;
    
    -- Registrar log da mudança
    INSERT INTO agendamentos_status_log (
        agendamento_id,
        status_anterior,
        status_novo,
        changed_by,
        observacoes,
        tempo_sessao_atual,
        profissional_ativo
    ) VALUES (
        p_agendamento_id,
        status_anterior,
        p_novo_status,
        p_user_id,
        p_observacoes,
        tempo_atual,
        prof_ativo
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. Atualizar view completa para incluir novos campos
CREATE OR REPLACE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.paciente_id,
    a.profissional_id,
    a.sala_id,
    a.unidade_id,
    a.convenio_id,
    a.especialidade_id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.observacoes,
    a.created_at,
    a.updated_at,
    a.numero_agendamento,
    a.data_chegada,
    a.codigo_autorizacao,
    a.numero_guia,
    a.data_autorizacao,
    a.validade_autorizacao,
    a.valor_procedimento,
    
    -- Novos campos de sessão
    a.sessao_iniciada_em,
    a.sessao_pausada_em,
    a.sessao_finalizada_em,
    a.tempo_sessao_minutos,
    a.profissional_1_id,
    a.profissional_2_id,
    a.tempo_profissional_1,
    a.tempo_profissional_2,
    a.profissional_ativo,
    a.duracao_planejada,
    a.tipo_sessao,
    a.observacoes_sessao,
    
    -- Dados da sala
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    
    -- Dados do paciente
    p.nome as paciente_nome,
    p.telefone as paciente_telefone,
    
    -- Dados da unidade
    u.nome as unidade_nome,
    
    -- Dados do convênio
    conv.nome as convenio_nome,
    
    -- Dados da especialidade
    e.nome as especialidade_nome,
    
    -- Profissional principal
    c_principal.nome_completo as profissional_nome,
    
    -- Profissional 1 (para sessões compartilhadas)
    c1.nome_completo as profissional_1_nome,
    c1.cargo as profissional_1_cargo,
    
    -- Profissional 2 (para sessões compartilhadas)
    c2.nome_completo as profissional_2_nome,
    c2.cargo as profissional_2_cargo,
    
    -- Cálculo de tempo em tempo real
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL THEN
            EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60
        WHEN a.status = 'concluido' AND a.sessao_finalizada_em IS NOT NULL THEN
            EXTRACT(EPOCH FROM (a.sessao_finalizada_em - a.sessao_iniciada_em)) / 60
        ELSE a.tempo_sessao_minutos
    END::INTEGER as tempo_sessao_atual

FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN unidades u ON a.unidade_id = u.id
LEFT JOIN convenios conv ON a.convenio_id = conv.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN colaboradores c_principal ON a.profissional_id = c_principal.id
LEFT JOIN colaboradores c1 ON a.profissional_1_id = c1.id
LEFT JOIN colaboradores c2 ON a.profissional_2_id = c2.id;

-- 7. Criar view para agenda em tempo real por unidade
CREATE OR REPLACE VIEW vw_agenda_tempo_real AS
SELECT 
    a.*,
    -- Status dinâmico para a agenda
    CASE 
        WHEN a.status = 'em_atendimento' THEN 
            CASE 
                WHEN a.tipo_sessao = 'compartilhada' AND a.tempo_sessao_atual >= 30 AND a.profissional_ativo = 1 THEN 'troca_profissional'
                WHEN a.tempo_sessao_atual >= a.duracao_planejada THEN 'sessao_completa'
                ELSE 'em_andamento'
            END
        ELSE a.status
    END as status_dinamico,
    
    -- Tempo restante
    CASE 
        WHEN a.status = 'em_atendimento' THEN 
            GREATEST(0, a.duracao_planejada - a.tempo_sessao_atual)
        ELSE 0
    END as tempo_restante_minutos,
    
    -- Próxima ação necessária
    CASE 
        WHEN a.status = 'agendado' THEN 'Aguardando chegada'
        WHEN a.status = 'chegou' THEN 'Tabular guia'
        WHEN a.status = 'pronto_para_terapia' THEN 'Iniciar sessão'
        WHEN a.status = 'em_atendimento' AND a.tipo_sessao = 'compartilhada' AND a.tempo_sessao_atual >= 30 AND a.profissional_ativo = 1 THEN 'Trocar profissional'
        WHEN a.status = 'em_atendimento' AND a.tempo_sessao_atual >= a.duracao_planejada THEN 'Finalizar sessão'
        WHEN a.status = 'em_atendimento' THEN 'Sessão em andamento'
        WHEN a.status = 'concluido' THEN 'Sessão concluída'
        ELSE 'Verificar status'
    END as proxima_acao

FROM vw_agendamentos_completo a
WHERE a.data_agendamento = CURRENT_DATE
  AND a.status NOT IN ('cancelado', 'faltou')
ORDER BY a.unidade_nome, a.sala_numero, a.horario_inicio;

-- 8. Comentários e documentação
COMMENT ON COLUMN agendamentos.sessao_iniciada_em IS 'Timestamp do início da sessão terapêutica';
COMMENT ON COLUMN agendamentos.profissional_1_id IS 'ID do primeiro profissional (em sessões compartilhadas)';
COMMENT ON COLUMN agendamentos.profissional_2_id IS 'ID do segundo profissional (em sessões compartilhadas)';
COMMENT ON COLUMN agendamentos.tempo_profissional_1 IS 'Tempo em minutos do primeiro profissional';
COMMENT ON COLUMN agendamentos.tempo_profissional_2 IS 'Tempo em minutos do segundo profissional';
COMMENT ON COLUMN agendamentos.profissional_ativo IS '1 = profissional_1 ativo, 2 = profissional_2 ativo';
COMMENT ON COLUMN agendamentos.tipo_sessao IS 'individual (60min) ou compartilhada (30min cada)';

COMMENT ON VIEW vw_agenda_tempo_real IS 'View para agenda em tempo real com cálculos dinâmicos de tempo e status';
COMMENT ON TABLE agendamentos_status_log IS 'Log de mudanças de status dos agendamentos para auditoria';

-- 9. Índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_status ON agendamentos(data_agendamento, status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_unidade_data ON agendamentos(unidade_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_sala_data ON agendamentos(sala_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_sessao_ativa ON agendamentos(status) WHERE status = 'em_atendimento';
CREATE INDEX IF NOT EXISTS idx_status_log_agendamento ON agendamentos_status_log(agendamento_id, changed_at);

-- Finalização
SELECT 'Sistema de controle de status implementado com sucesso!' as resultado;
SELECT 'Views criadas: vw_agendamentos_completo, vw_agenda_tempo_real' as views;
SELECT 'Funções criadas: calcular_tempo_sessao, atualizar_status_agendamento' as funcoes;
