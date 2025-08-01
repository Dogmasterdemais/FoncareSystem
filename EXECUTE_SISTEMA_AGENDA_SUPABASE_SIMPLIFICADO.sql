-- ========================================
-- SISTEMA DE CONTROLE DE STATUS DOS PACIENTES - AGENDA
-- SCRIPT SIMPLIFICADO PARA SUPABASE
-- ========================================

-- 1. ADICIONAR CAMPOS PARA CONTROLE DE SESSÕES TERAPÊUTICAS
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS sessao_iniciada_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sessao_pausada_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sessao_finalizada_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tempo_sessao_minutos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profissional_1_id UUID REFERENCES colaboradores(id),
ADD COLUMN IF NOT EXISTS profissional_2_id UUID REFERENCES colaboradores(id),
ADD COLUMN IF NOT EXISTS tempo_profissional_1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tempo_profissional_2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profissional_ativo INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS duracao_planejada INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS tipo_sessao VARCHAR(20) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS observacoes_sessao TEXT;

-- 2. CRIAR TABELA DE LOG DE STATUS PARA AUDITORIA
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

-- 3. FUNÇÃO PARA CALCULAR TEMPO DE SESSÃO AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION calcular_tempo_sessao(p_agendamento_id UUID)
RETURNS TABLE (
    tempo_total INTEGER,
    tempo_prof_1 INTEGER,
    tempo_prof_2 INTEGER,
    status_atual VARCHAR(50)
) 
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    tempo_calculado INTEGER := 0;
    tempo_p1 INTEGER := 0;
    tempo_p2 INTEGER := 0;
BEGIN
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
    
    IF rec.status = 'em_atendimento' AND rec.sessao_iniciada_em IS NOT NULL THEN
        tempo_calculado := EXTRACT(EPOCH FROM (NOW() - rec.sessao_iniciada_em)) / 60;
        
        IF rec.tipo_sessao = 'compartilhada' THEN
            IF tempo_calculado <= 30 THEN
                tempo_p1 := tempo_calculado;
                tempo_p2 := rec.tempo_profissional_2;
            ELSE
                tempo_p1 := 30;
                tempo_p2 := LEAST(tempo_calculado - 30, 30);
            END IF;
        ELSE
            tempo_p1 := LEAST(tempo_calculado, 60);
            tempo_p2 := 0;
        END IF;
        
    ELSIF rec.status = 'concluido' AND rec.sessao_finalizada_em IS NOT NULL THEN
        tempo_calculado := EXTRACT(EPOCH FROM (rec.sessao_finalizada_em - rec.sessao_iniciada_em)) / 60;
        tempo_p1 := rec.tempo_profissional_1;
        tempo_p2 := rec.tempo_profissional_2;
    ELSE
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
$$;

-- 4. FUNÇÃO PARA ATUALIZAR STATUS COM LOG AUTOMÁTICO
CREATE OR REPLACE FUNCTION atualizar_status_agendamento(
    p_agendamento_id UUID,
    p_novo_status VARCHAR(50),
    p_user_id UUID DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE
    status_anterior VARCHAR(50);
    tempo_atual INTEGER;
    prof_ativo INTEGER;
BEGIN
    SELECT status, profissional_ativo 
    INTO status_anterior, prof_ativo
    FROM agendamentos 
    WHERE id = p_agendamento_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    SELECT tempo_total INTO tempo_atual
    FROM calcular_tempo_sessao(p_agendamento_id);
    
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
$$;

-- 5. VIEW AGENDAMENTOS COMPLETO COM NOVOS CAMPOS
-- Remover view existente para evitar conflitos de colunas
DROP VIEW IF EXISTS vw_agendamentos_completo CASCADE;

CREATE VIEW vw_agendamentos_completo AS
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
    
    -- Campos de sessão
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
    
    -- Dados relacionados
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    
    p.nome as paciente_nome,
    p.telefone as paciente_telefone,
    p.data_nascimento as paciente_nascimento,
    
    u.nome as unidade_nome,
    conv.nome as convenio_nome,
    e.nome as especialidade_nome,
    
    c_principal.nome_completo as profissional_nome,
    c1.nome_completo as profissional_1_nome,
    c1.cargo as profissional_1_cargo,
    c2.nome_completo as profissional_2_nome,
    c2.cargo as profissional_2_cargo,
    
    -- Tempo em tempo real
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

-- 6. VIEW AGENDA EM TEMPO REAL
-- Remover view existente para evitar conflitos
DROP VIEW IF EXISTS vw_agenda_tempo_real CASCADE;

CREATE VIEW vw_agenda_tempo_real AS
SELECT 
    a.*,
    
    -- Status dinâmico
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
    
    -- Próxima ação
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

-- 7. VIEW PARA SUPERVISÃO (ATENDIMENTOS POR SALA E PROFISSIONAL)
-- Remover view existente para evitar conflitos
DROP VIEW IF EXISTS vw_supervisao_atendimentos CASCADE;

CREATE VIEW vw_supervisao_atendimentos AS
SELECT 
    u.nome as unidade_nome,
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    
    -- Contadores de hoje
    COUNT(CASE WHEN a.data_agendamento = CURRENT_DATE THEN 1 END) as agendados_hoje,
    COUNT(CASE WHEN a.data_agendamento = CURRENT_DATE AND a.status = 'chegou' THEN 1 END) as chegaram_hoje,
    COUNT(CASE WHEN a.data_agendamento = CURRENT_DATE AND a.status = 'em_atendimento' THEN 1 END) as em_atendimento_agora,
    COUNT(CASE WHEN a.data_agendamento = CURRENT_DATE AND a.status = 'concluido' THEN 1 END) as concluidos_hoje,
    
    -- Profissionais na sala hoje
    STRING_AGG(DISTINCT c1.nome_completo, ', ') as profissionais_sala,
    
    -- Tempo médio de sessão hoje
    AVG(CASE WHEN a.data_agendamento = CURRENT_DATE AND a.status = 'concluido' THEN a.tempo_sessao_minutos END)::INTEGER as tempo_medio_sessao,
    
    -- Sessões em andamento com tempo
    STRING_AGG(
        CASE WHEN a.status = 'em_atendimento' THEN 
            p.nome || ' (' || a.tempo_sessao_atual || 'min)'
        END, 
        ', '
    ) as pacientes_em_atendimento,
    
    -- Próximos agendamentos
    COUNT(CASE WHEN a.data_agendamento = CURRENT_DATE AND a.horario_inicio > NOW()::TIME THEN 1 END) as proximos_agendamentos

FROM salas s
LEFT JOIN agendamentos a ON s.id = a.sala_id
LEFT JOIN unidades u ON s.unidade_id = u.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN colaboradores c1 ON (a.profissional_1_id = c1.id OR a.profissional_id = c1.id)
WHERE s.ativo = true
GROUP BY u.id, u.nome, s.id, s.nome, s.numero, s.tipo
ORDER BY u.nome, s.numero;

-- 8. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_status ON agendamentos(data_agendamento, status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_unidade_data ON agendamentos(unidade_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_sala_data ON agendamentos(sala_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_sessao_ativa ON agendamentos(status) WHERE status = 'em_atendimento';
CREATE INDEX IF NOT EXISTS idx_status_log_agendamento ON agendamentos_status_log(agendamento_id, changed_at);

-- 9. COMENTÁRIOS
COMMENT ON COLUMN agendamentos.sessao_iniciada_em IS 'Timestamp do início da sessão terapêutica';
COMMENT ON COLUMN agendamentos.profissional_1_id IS 'Primeiro profissional (sessões compartilhadas)';
COMMENT ON COLUMN agendamentos.profissional_2_id IS 'Segundo profissional (sessões compartilhadas)';
COMMENT ON COLUMN agendamentos.tipo_sessao IS 'individual (60min) ou compartilhada (30min cada)';
COMMENT ON VIEW vw_agenda_tempo_real IS 'Agenda em tempo real com cálculos dinâmicos';
COMMENT ON VIEW vw_supervisao_atendimentos IS 'Supervisão de atendimentos por sala e profissional';

-- ========================================
-- SCRIPT EXECUTADO COM SUCESSO!
-- ========================================

SELECT 
    'Sistema de controle de status implementado!' as resultado,
    '✅ Campos adicionados na tabela agendamentos' as step_1,
    '✅ Tabela de log criada' as step_2,
    '✅ Funções de cálculo criadas' as step_3,
    '✅ Views atualizadas' as step_4,
    '✅ Índices de performance criados' as step_5;
