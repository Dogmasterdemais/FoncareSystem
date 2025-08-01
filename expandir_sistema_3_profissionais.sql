-- =====================================================
-- SCRIPT: Expandir Sistema para 3 Profissionais por Sala
-- DESCRIÇÃO: Adiciona suporte para sessões com até 3 profissionais
-- DATA: 2025-07-29
-- =====================================================

-- 1. ADICIONAR TERCEIRO PROFISSIONAL NA TABELA AGENDAMENTOS
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS profissional_3_id UUID REFERENCES colaboradores(id),
ADD COLUMN IF NOT EXISTS tempo_profissional_3 INTEGER DEFAULT 0;

-- 2. ATUALIZAR COMENTÁRIOS PARA DOCUMENTAR OS 3 PROFISSIONAIS
COMMENT ON COLUMN agendamentos.profissional_1_id IS 'Primeiro profissional (0-30min em sessão tripla, 0-30min em dupla)';
COMMENT ON COLUMN agendamentos.profissional_2_id IS 'Segundo profissional (30-60min em sessão tripla, 30-60min em dupla)';
COMMENT ON COLUMN agendamentos.profissional_3_id IS 'Terceiro profissional (60-90min em sessão tripla)';

-- 3. EXPANDIR TIPOS DE SESSÃO
-- Primeiro verificar valores existentes na tabela
SELECT DISTINCT tipo_sessao, COUNT(*) as quantidade
FROM agendamentos 
WHERE tipo_sessao IS NOT NULL
GROUP BY tipo_sessao;

-- Atualizar valores NULL ou inválidos para 'individual'
UPDATE agendamentos 
SET tipo_sessao = 'individual' 
WHERE tipo_sessao IS NULL OR tipo_sessao NOT IN ('individual', 'compartilhada', 'tripla');

-- Dropar constraint existente se houver
ALTER TABLE agendamentos 
DROP CONSTRAINT IF EXISTS agendamentos_tipo_sessao_check;

-- Criar nova constraint para incluir 'tripla'
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_tipo_sessao_check 
CHECK (tipo_sessao IN ('individual', 'compartilhada', 'tripla'));

-- 4. ATUALIZAR FUNÇÃO DE CÁLCULO DE TEMPO PARA 3 PROFISSIONAIS
CREATE OR REPLACE FUNCTION calcular_tempo_sessao_3_profissionais(p_agendamento_id UUID)
RETURNS TABLE (
    tempo_total INTEGER,
    tempo_prof_1 INTEGER,
    tempo_prof_2 INTEGER,
    tempo_prof_3 INTEGER,
    profissional_ativo INTEGER,
    status_atual VARCHAR(50)
) 
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    tempo_calculado INTEGER := 0;
    tempo_p1 INTEGER := 0;
    tempo_p2 INTEGER := 0;
    tempo_p3 INTEGER := 0;
    prof_ativo INTEGER := 1;
BEGIN
    SELECT 
        a.sessao_iniciada_em,
        a.sessao_pausada_em,
        a.sessao_finalizada_em,
        a.tempo_profissional_1,
        a.tempo_profissional_2,
        a.tempo_profissional_3,
        a.profissional_ativo,
        a.status,
        a.duracao_planejada,
        a.tipo_sessao,
        a.profissional_1_id,
        a.profissional_2_id,
        a.profissional_3_id
    INTO rec
    FROM agendamentos a
    WHERE a.id = p_agendamento_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0, 0, 0, 0, 1, 'not_found'::VARCHAR(50);
        RETURN;
    END IF;
    
    -- Calcular tempo atual se sessão está em andamento
    IF rec.status = 'em_atendimento' AND rec.sessao_iniciada_em IS NOT NULL THEN
        tempo_calculado := EXTRACT(EPOCH FROM (NOW() - rec.sessao_iniciada_em)) / 60;
        
        -- SESSÃO INDIVIDUAL (1 profissional - 60 minutos)
        IF rec.tipo_sessao = 'individual' THEN
            tempo_p1 := LEAST(tempo_calculado, 60);
            tempo_p2 := 0;
            tempo_p3 := 0;
            prof_ativo := 1;
            
        -- SESSÃO COMPARTILHADA (2 profissionais - 30min cada)
        ELSIF rec.tipo_sessao = 'compartilhada' THEN
            IF tempo_calculado <= 30 THEN
                tempo_p1 := tempo_calculado;
                tempo_p2 := 0;
                tempo_p3 := 0;
                prof_ativo := 1;
            ELSE
                tempo_p1 := 30;
                tempo_p2 := LEAST(tempo_calculado - 30, 30);
                tempo_p3 := 0;
                prof_ativo := 2;
            END IF;
            
        -- SESSÃO TRIPLA (3 profissionais - 30min cada = 90min total)
        ELSIF rec.tipo_sessao = 'tripla' THEN
            IF tempo_calculado <= 30 THEN
                tempo_p1 := tempo_calculado;
                tempo_p2 := 0;
                tempo_p3 := 0;
                prof_ativo := 1;
            ELSIF tempo_calculado <= 60 THEN
                tempo_p1 := 30;
                tempo_p2 := tempo_calculado - 30;
                tempo_p3 := 0;
                prof_ativo := 2;
            ELSE
                tempo_p1 := 30;
                tempo_p2 := 30;
                tempo_p3 := LEAST(tempo_calculado - 60, 30);
                prof_ativo := 3;
            END IF;
        END IF;
        
    -- Sessão concluída - usar tempos finais
    ELSIF rec.status = 'concluido' AND rec.sessao_finalizada_em IS NOT NULL THEN
        tempo_calculado := EXTRACT(EPOCH FROM (rec.sessao_finalizada_em - rec.sessao_iniciada_em)) / 60;
        tempo_p1 := rec.tempo_profissional_1;
        tempo_p2 := rec.tempo_profissional_2;
        tempo_p3 := COALESCE(rec.tempo_profissional_3, 0);
        prof_ativo := rec.profissional_ativo;
        
    -- Outras situações - usar valores salvos
    ELSE
        tempo_p1 := rec.tempo_profissional_1;
        tempo_p2 := rec.tempo_profissional_2;
        tempo_p3 := COALESCE(rec.tempo_profissional_3, 0);
        tempo_calculado := tempo_p1 + tempo_p2 + tempo_p3;
        prof_ativo := rec.profissional_ativo;
    END IF;
    
    RETURN QUERY SELECT 
        tempo_calculado::INTEGER,
        tempo_p1::INTEGER,
        tempo_p2::INTEGER,
        tempo_p3::INTEGER,
        prof_ativo::INTEGER,
        rec.status;
END;
$$;

-- 5. RECRIAR VIEW COM SUPORTE A 3 PROFISSIONAIS
DROP VIEW IF EXISTS vw_agenda_tempo_real CASCADE;

CREATE VIEW vw_agenda_tempo_real AS
SELECT 
    a.id,
    
    -- Dados do paciente
    p.nome as paciente_nome,
    
    -- Dados da sala
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.cor as sala_cor,
    
    -- Dados da especialidade (INCLUINDO A COR)
    esp.nome as especialidade_nome,
    esp.cor as especialidade_cor,
    
    -- Horários
    a.data_agendamento::date as data_agendamento,
    a.horario_inicio::time as horario_inicio,
    a.horario_fim::time as horario_fim,
    
    -- Status e controle
    COALESCE(a.status, 'agendado') as status,
    
    -- Status dinâmico com suporte a 3 profissionais
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                -- Sessão tripla - Transições aos 30 e 60 minutos (90min total)
                WHEN a.tipo_sessao = 'tripla' AND 
                     EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 90 
                THEN 'sessao_completa'
                
                WHEN a.tipo_sessao = 'tripla' AND 
                     EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 60 AND
                     a.profissional_ativo = 2
                THEN 'troca_para_profissional_3'
                
                WHEN a.tipo_sessao = 'tripla' AND 
                     EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 30 AND
                     a.profissional_ativo = 1
                THEN 'troca_para_profissional_2'
                
                -- Sessão compartilhada - Transição aos 30 minutos
                WHEN a.tipo_sessao = 'compartilhada' AND 
                     EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 60 
                THEN 'sessao_completa'
                
                WHEN a.tipo_sessao = 'compartilhada' AND 
                     EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 30 AND
                     a.profissional_ativo = 1
                THEN 'troca_para_profissional_2'
                
                -- Sessão individual - Finalização aos 60 minutos
                WHEN a.tipo_sessao = 'individual' AND 
                     EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 60 
                THEN 'sessao_completa'
                
                ELSE 'em_andamento'
            END
        ELSE COALESCE(a.status, 'agendado')
    END as status_dinamico,
    
    -- Cálculos de tempo usando sessao_iniciada_em (TIMER REAL)
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL
        THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60)::INTEGER
        ELSE 0
    END as tempo_sessao_atual,
    
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL
        THEN GREATEST(0, COALESCE(
            CASE 
                WHEN a.tipo_sessao = 'tripla' THEN 90
                ELSE a.duracao_minutos 
            END, 60) - EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60)::INTEGER
        ELSE COALESCE(
            CASE 
                WHEN a.tipo_sessao = 'tripla' THEN 90
                ELSE a.duracao_minutos 
            END, 60)
    END as tempo_restante_minutos,
    
    COALESCE(
        CASE 
            WHEN a.tipo_sessao = 'tripla' THEN 90
            ELSE a.duracao_minutos 
        END, 60) as duracao_planejada,
    
    -- Tipo de sessão
    COALESCE(a.tipo_sessao, 'individual') as tipo_sessao,
    
    -- Profissionais (incluindo o terceiro)
    c_principal.nome_completo as profissional_nome,
    c1.nome_completo as profissional_1_nome,
    c2.nome_completo as profissional_2_nome,
    c3.nome_completo as profissional_3_nome,
    
    -- Profissional ativo atual
    CASE 
        WHEN a.status = 'em_atendimento' AND a.tipo_sessao = 'tripla' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 < 30 THEN 1
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 < 60 THEN 2
                ELSE 3
            END
        WHEN a.status = 'em_atendimento' AND a.tipo_sessao = 'compartilhada' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 < 30 THEN 1
                ELSE 2
            END
        ELSE COALESCE(a.profissional_ativo, 1)
    END as profissional_ativo,
    
    -- Próxima ação sugerida com suporte a 3 profissionais
    CASE 
        WHEN a.status = 'agendado' THEN 'Aguardando chegada do paciente'
        WHEN a.status = 'chegou' THEN 'Realizar tabulação da guia'
        WHEN a.status = 'pronto_para_terapia' THEN 'Iniciar atendimento'
        
        -- Sessão tripla
        WHEN a.status = 'em_atendimento' AND a.tipo_sessao = 'tripla' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 90 THEN 'Finalizar atendimento'
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 60 AND a.profissional_ativo = 2 THEN 'Trocar para 3º profissional'
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 30 AND a.profissional_ativo = 1 THEN 'Trocar para 2º profissional'
                ELSE 'Atendimento em andamento'
            END
            
        -- Sessão compartilhada
        WHEN a.status = 'em_atendimento' AND a.tipo_sessao = 'compartilhada' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 60 THEN 'Finalizar atendimento'
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 30 AND a.profissional_ativo = 1 THEN 'Trocar para 2º profissional'
                ELSE 'Atendimento em andamento'
            END
            
        -- Sessão individual
        WHEN a.status = 'em_atendimento' AND a.tipo_sessao = 'individual' AND a.sessao_iniciada_em IS NOT NULL THEN
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))/60 >= 60 THEN 'Finalizar atendimento'
                ELSE 'Atendimento em andamento'
            END
            
        WHEN a.status = 'em_atendimento' THEN 'Atendimento em andamento'
        WHEN a.status = 'concluido' THEN 'Atendimento finalizado'
        ELSE 'Verificar status'
    END as proxima_acao,
    
    -- Timestamps usando campos existentes
    a.created_at as hora_chegada,
    a.sessao_iniciada_em as sessao_iniciada_em,
    a.created_at as hora_fim_atendimento,
    
    -- Dados da unidade
    u.nome as unidade_nome,
    u.id as unidade_id,
    
    -- Dados adicionais
    COALESCE(a.observacoes_sessao, '') as observacoes_sessao,
    a.created_at

FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN especialidades esp ON a.especialidade_id = esp.id
LEFT JOIN colaboradores c_principal ON a.profissional_id = c_principal.id
LEFT JOIN colaboradores c1 ON a.profissional_1_id = c1.id
LEFT JOIN colaboradores c2 ON a.profissional_2_id = c2.id
LEFT JOIN colaboradores c3 ON a.profissional_3_id = c3.id
LEFT JOIN unidades u ON s.unidade_id = u.id

WHERE 
    -- Apenas agendamentos de hoje
    a.data_agendamento::date = CURRENT_DATE

ORDER BY 
    a.horario_inicio, 
    s.numero;

-- 6. CRIAR VIEW PARA VERIFICAÇÃO DE CAPACIDADE COM 3 PROFISSIONAIS
CREATE OR REPLACE VIEW vw_ocupacao_salas_3_profissionais AS
SELECT 
    s.id as sala_id,
    s.nome as sala_nome,
    s.numero as sala_numero,
    COUNT(DISTINCT a.paciente_id) as criancas_ocupadas,
    COUNT(DISTINCT CASE WHEN a.profissional_id IS NOT NULL THEN a.profissional_id END) +
    COUNT(DISTINCT CASE WHEN a.profissional_1_id IS NOT NULL THEN a.profissional_1_id END) +
    COUNT(DISTINCT CASE WHEN a.profissional_2_id IS NOT NULL THEN a.profissional_2_id END) +
    COUNT(DISTINCT CASE WHEN a.profissional_3_id IS NOT NULL THEN a.profissional_3_id END) as profissionais_ocupados,
    6 as capacidade_criancas,
    3 as capacidade_profissionais,
    
    -- Status da sala
    CASE 
        WHEN COUNT(DISTINCT a.paciente_id) >= 6 OR 
             (COUNT(DISTINCT CASE WHEN a.profissional_id IS NOT NULL THEN a.profissional_id END) +
              COUNT(DISTINCT CASE WHEN a.profissional_1_id IS NOT NULL THEN a.profissional_1_id END) +
              COUNT(DISTINCT CASE WHEN a.profissional_2_id IS NOT NULL THEN a.profissional_2_id END) +
              COUNT(DISTINCT CASE WHEN a.profissional_3_id IS NOT NULL THEN a.profissional_3_id END)) >= 3
        THEN 'lotada'
        WHEN COUNT(DISTINCT a.paciente_id) > 0 THEN 'ocupada'
        ELSE 'disponivel'
    END as status_sala,
    
    CURRENT_DATE as data_verificacao,
    NOW() as ultima_atualizacao
    
FROM salas s
LEFT JOIN agendamentos a ON s.id = a.sala_id 
    AND a.data_agendamento = CURRENT_DATE
    AND a.status IN ('agendado', 'chegou', 'pronto_para_terapia', 'em_atendimento')
WHERE s.ativo = true
GROUP BY s.id, s.nome, s.numero;

-- 7. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_prof_3 ON agendamentos(profissional_3_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_tipo_sessao ON agendamentos(tipo_sessao);

-- 8. CONCEDER PERMISSÕES
GRANT SELECT ON vw_agenda_tempo_real TO authenticated;
GRANT SELECT ON vw_agenda_tempo_real TO anon;
GRANT SELECT ON vw_ocupacao_salas_3_profissionais TO authenticated;
GRANT SELECT ON vw_ocupacao_salas_3_profissionais TO anon;

-- 9. VERIFICAÇÃO FINAL
SELECT 
    'Sistema expandido para 3 profissionais!' as resultado,
    '✅ Campo profissional_3_id adicionado' as step_1,
    '✅ Função de cálculo atualizada' as step_2,
    '✅ View com suporte a sessões triplas' as step_3,
    '✅ Verificação de capacidade expandida' as step_4,
    '✅ Timer automático para 3 profissionais' as step_5;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Suporte completo para 3 profissionais por sala
-- ✅ Sessões triplas (30min cada profissional = 90min total)
-- ✅ Timer automático com transições aos 30min e 60min
-- ✅ Validação de capacidade expandida
-- ✅ Status dinâmico para troca de profissionais
-- =====================================================
