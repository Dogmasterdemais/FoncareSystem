-- ============================================================
-- IMPLEMENTAÇÃO: TABULAÇÃO DE SEGMENTOS DE 30 MINUTOS
-- Data: 07/01/2025
-- Requisito: Cada atendimento terapêutico de 90min deve ser dividido 
--           em 3 registros de 30min (exceto anamnese e neuropsicologia)
-- ============================================================

-- 1. CRIAR TABELA PARA SEGMENTOS DE 30 MINUTOS
CREATE TABLE IF NOT EXISTS agendamentos_segmentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_principal_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL,
    profissional_id UUID NOT NULL,
    sala_id UUID NOT NULL,
    unidade_id UUID NOT NULL,
    
    -- Dados do segmento específico
    numero_segmento INTEGER NOT NULL CHECK (numero_segmento BETWEEN 1 AND 3),
    horario_inicio_segmento TIME NOT NULL,
    horario_fim_segmento TIME NOT NULL,
    duracao_segmento_minutos INTEGER DEFAULT 30,
    
    -- Dados herdados do agendamento principal
    data_agendamento DATE NOT NULL,
    tipo_sessao VARCHAR(50),
    modalidade VARCHAR(50),
    convenio_id UUID,
    valor_segmento DECIMAL(10,2),
    
    -- Status específico do segmento
    status_segmento VARCHAR(30) DEFAULT 'agendado' CHECK (
        status_segmento IN (
            'agendado', 'em_andamento', 'concluido', 
            'cancelado', 'nao_compareceu', 'interrompido'
        )
    ),
    
    -- Campos de controle de qualidade
    profissional_presente BOOLEAN DEFAULT false,
    paciente_presente BOOLEAN DEFAULT false,
    segmento_realizado BOOLEAN DEFAULT false,
    observacoes_segmento TEXT,
    
    -- Metadados
    criado_automaticamente BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Segmentos únicos por agendamento
    UNIQUE(agendamento_principal_id, numero_segmento)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_segmentos_principal ON agendamentos_segmentos(agendamento_principal_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_segmentos_data ON agendamentos_segmentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_segmentos_profissional ON agendamentos_segmentos(profissional_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_segmentos_sala ON agendamentos_segmentos(sala_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_segmentos_status ON agendamentos_segmentos(status_segmento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_segmentos_numero ON agendamentos_segmentos(numero_segmento);

-- 3. FUNÇÃO PARA VERIFICAR SE É SALA DE TERAPIA (90 MINUTOS)
CREATE OR REPLACE FUNCTION eh_sala_terapia_90min(nome_sala TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN LOWER(nome_sala) NOT LIKE '%anamnese%' 
       AND LOWER(nome_sala) NOT LIKE '%neuropsicolog%';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. FUNÇÃO PARA CRIAR SEGMENTOS DE 30 MINUTOS
CREATE OR REPLACE FUNCTION criar_segmentos_30_minutos()
RETURNS TRIGGER AS $$
DECLARE
    v_nome_sala TEXT;
    v_duracao_sessao INTEGER;
    v_horario_inicio TIME;
    v_horario_atual TIME;
    v_segmento INTEGER;
    v_valor_segmento DECIMAL(10,2);
BEGIN
    -- Buscar informações da sala
    SELECT s.nome INTO v_nome_sala
    FROM salas s 
    WHERE s.id = NEW.sala_id;
    
    -- Verificar se é inserção e se é sala de terapia
    IF TG_OP = 'INSERT' AND eh_sala_terapia_90min(v_nome_sala) THEN
        -- Obter duração da sessão
        v_duracao_sessao := obter_duracao_sessao(v_nome_sala);
        
        -- Se for sessão de 90 minutos, criar 3 segmentos de 30 minutos
        IF v_duracao_sessao = 90 THEN
            v_horario_inicio := NEW.horario_inicio;
            v_valor_segmento := COALESCE(NEW.valor_sessao, 0) / 3; -- Dividir valor por 3 segmentos
            
            -- Criar 3 segmentos de 30 minutos
            FOR v_segmento IN 1..3 LOOP
                v_horario_atual := v_horario_inicio + (INTERVAL '30 minutes' * (v_segmento - 1));
                
                INSERT INTO agendamentos_segmentos (
                    agendamento_principal_id,
                    paciente_id,
                    profissional_id,
                    sala_id,
                    unidade_id,
                    numero_segmento,
                    horario_inicio_segmento,
                    horario_fim_segmento,
                    duracao_segmento_minutos,
                    data_agendamento,
                    tipo_sessao,
                    modalidade,
                    convenio_id,
                    valor_segmento,
                    status_segmento
                ) VALUES (
                    NEW.id,
                    NEW.paciente_id,
                    NEW.profissional_id,
                    NEW.sala_id,
                    NEW.unidade_id,
                    v_segmento,
                    v_horario_atual,
                    v_horario_atual + INTERVAL '30 minutes',
                    30,
                    NEW.data_agendamento,
                    NEW.tipo_sessao,
                    NEW.modalidade,
                    NEW.convenio_id,
                    v_valor_segmento,
                    'agendado'
                );
            END LOOP;
            
            -- Log da criação dos segmentos
            RAISE NOTICE 'Criados 3 segmentos de 30 minutos para agendamento % na sala %', 
                        NEW.id, v_nome_sala;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. FUNÇÃO PARA ATUALIZAR SEGMENTOS QUANDO AGENDAMENTO MUDA
CREATE OR REPLACE FUNCTION atualizar_segmentos_30_minutos()
RETURNS TRIGGER AS $$
DECLARE
    v_nome_sala TEXT;
    v_duracao_sessao INTEGER;
    v_horario_inicio TIME;
    v_horario_atual TIME;
    v_segmento INTEGER;
    v_valor_segmento DECIMAL(10,2);
    v_count_segmentos INTEGER;
BEGIN
    -- Buscar informações da sala
    SELECT s.nome INTO v_nome_sala
    FROM salas s 
    WHERE s.id = NEW.sala_id;
    
    -- Verificar se é sala de terapia
    IF eh_sala_terapia_90min(v_nome_sala) THEN
        v_duracao_sessao := obter_duracao_sessao(v_nome_sala);
        
        -- Verificar se existem segmentos
        SELECT COUNT(*) INTO v_count_segmentos
        FROM agendamentos_segmentos
        WHERE agendamento_principal_id = NEW.id;
        
        -- Se for sessão de 90 minutos e houver segmentos, atualizar
        IF v_duracao_sessao = 90 AND v_count_segmentos > 0 THEN
            v_horario_inicio := NEW.horario_inicio;
            v_valor_segmento := COALESCE(NEW.valor_sessao, 0) / 3;
            
            -- Atualizar os 3 segmentos existentes
            FOR v_segmento IN 1..3 LOOP
                v_horario_atual := v_horario_inicio + (INTERVAL '30 minutes' * (v_segmento - 1));
                
                UPDATE agendamentos_segmentos SET
                    paciente_id = NEW.paciente_id,
                    profissional_id = NEW.profissional_id,
                    sala_id = NEW.sala_id,
                    unidade_id = NEW.unidade_id,
                    horario_inicio_segmento = v_horario_atual,
                    horario_fim_segmento = v_horario_atual + INTERVAL '30 minutes',
                    data_agendamento = NEW.data_agendamento,
                    tipo_sessao = NEW.tipo_sessao,
                    modalidade = NEW.modalidade,
                    convenio_id = NEW.convenio_id,
                    valor_segmento = v_valor_segmento,
                    updated_at = NOW()
                WHERE agendamento_principal_id = NEW.id 
                  AND numero_segmento = v_segmento;
            END LOOP;
            
            RAISE NOTICE 'Atualizados 3 segmentos de 30 minutos para agendamento %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR TRIGGERS PARA AUTOMAÇÃO
DROP TRIGGER IF EXISTS trigger_criar_segmentos_30min ON agendamentos;
CREATE TRIGGER trigger_criar_segmentos_30min
    AFTER INSERT ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION criar_segmentos_30_minutos();

DROP TRIGGER IF EXISTS trigger_atualizar_segmentos_30min ON agendamentos;
CREATE TRIGGER trigger_atualizar_segmentos_30min
    AFTER UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_segmentos_30_minutos();

-- 7. VIEW PARA RELATÓRIOS DE SEGMENTOS
CREATE OR REPLACE VIEW vw_segmentos_agendamentos AS
SELECT 
    -- Dados do segmento
    s.id as segmento_id,
    s.agendamento_principal_id,
    s.numero_segmento,
    s.horario_inicio_segmento,
    s.horario_fim_segmento,
    s.duracao_segmento_minutos,
    s.status_segmento,
    s.profissional_presente,
    s.paciente_presente,
    s.segmento_realizado,
    s.valor_segmento,
    s.observacoes_segmento,
    s.created_at as segmento_created_at,
    
    -- Dados do agendamento principal
    a.numero_agendamento,
    a.data_agendamento,
    a.horario_inicio as agendamento_inicio,
    a.horario_fim as agendamento_fim,
    a.duracao_minutos as agendamento_duracao_total,
    a.status as agendamento_status,
    a.tipo_sessao,
    a.modalidade,
    a.valor_sessao as valor_total_sessao,
    
    -- Dados do paciente
    p.nome as paciente_nome,
    p.telefone as paciente_telefone,
    
    -- Dados do profissional
    prof.nome_completo as profissional_nome,
    
    -- Dados da sala
    sl.nome as sala_nome,
    sl.cor as sala_cor,
    
    -- Dados da unidade
    u.nome as unidade_nome,
    
    -- Dados do convênio
    c.nome as convenio_nome
    
FROM agendamentos_segmentos s
INNER JOIN agendamentos a ON s.agendamento_principal_id = a.id
LEFT JOIN pacientes p ON s.paciente_id = p.id
LEFT JOIN colaboradores prof ON s.profissional_id = prof.id
LEFT JOIN salas sl ON s.sala_id = sl.id
LEFT JOIN unidades u ON s.unidade_id = u.id
LEFT JOIN convenios c ON s.convenio_id = c.id
ORDER BY s.data_agendamento, s.horario_inicio_segmento, s.numero_segmento;

-- 8. FUNÇÃO PARA POPULAR SEGMENTOS EM AGENDAMENTOS EXISTENTES
CREATE OR REPLACE FUNCTION popular_segmentos_agendamentos_existentes()
RETURNS INTEGER AS $$
DECLARE
    v_agendamento RECORD;
    v_count_criados INTEGER := 0;
    v_nome_sala TEXT;
    v_duracao_sessao INTEGER;
    v_horario_inicio TIME;
    v_horario_atual TIME;
    v_segmento INTEGER;
    v_valor_segmento DECIMAL(10,2);
BEGIN
    -- Buscar agendamentos que ainda não têm segmentos
    FOR v_agendamento IN 
        SELECT a.*, s.nome as sala_nome
        FROM agendamentos a
        INNER JOIN salas s ON a.sala_id = s.id
        WHERE NOT EXISTS (
            SELECT 1 FROM agendamentos_segmentos seg 
            WHERE seg.agendamento_principal_id = a.id
        )
        AND eh_sala_terapia_90min(s.nome)
    LOOP
        v_duracao_sessao := obter_duracao_sessao(v_agendamento.sala_nome);
        
        -- Se for sessão de 90 minutos, criar segmentos
        IF v_duracao_sessao = 90 THEN
            v_horario_inicio := v_agendamento.horario_inicio;
            v_valor_segmento := COALESCE(v_agendamento.valor_sessao, 0) / 3;
            
            -- Criar 3 segmentos de 30 minutos
            FOR v_segmento IN 1..3 LOOP
                v_horario_atual := v_horario_inicio + (INTERVAL '30 minutes' * (v_segmento - 1));
                
                INSERT INTO agendamentos_segmentos (
                    agendamento_principal_id,
                    paciente_id,
                    profissional_id,
                    sala_id,
                    unidade_id,
                    numero_segmento,
                    horario_inicio_segmento,
                    horario_fim_segmento,
                    duracao_segmento_minutos,
                    data_agendamento,
                    tipo_sessao,
                    modalidade,
                    convenio_id,
                    valor_segmento,
                    status_segmento
                ) VALUES (
                    v_agendamento.id,
                    v_agendamento.paciente_id,
                    v_agendamento.profissional_id,
                    v_agendamento.sala_id,
                    v_agendamento.unidade_id,
                    v_segmento,
                    v_horario_atual,
                    v_horario_atual + INTERVAL '30 minutes',
                    30,
                    v_agendamento.data_agendamento,
                    v_agendamento.tipo_sessao,
                    v_agendamento.modalidade,
                    v_agendamento.convenio_id,
                    v_valor_segmento,
                    'agendado'
                );
                
                v_count_criados := v_count_criados + 1;
            END LOOP;
        END IF;
    END LOOP;
    
    RETURN v_count_criados;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNÇÃO PARA RELATÓRIO DE SEGMENTOS POR DIA
CREATE OR REPLACE FUNCTION relatorio_segmentos_dia(data_consulta DATE)
RETURNS TABLE (
    sala_nome TEXT,
    total_segmentos BIGINT,
    segmentos_realizados BIGINT,
    segmentos_pendentes BIGINT,
    profissionais_diferentes BIGINT,
    valor_total_dia DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.nome as sala_nome,
        COUNT(s.*) as total_segmentos,
        COUNT(CASE WHEN s.segmento_realizado = true THEN 1 END) as segmentos_realizados,
        COUNT(CASE WHEN s.segmento_realizado = false THEN 1 END) as segmentos_pendentes,
        COUNT(DISTINCT s.profissional_id) as profissionais_diferentes,
        COALESCE(SUM(s.valor_segmento), 0) as valor_total_dia
    FROM agendamentos_segmentos s
    INNER JOIN salas sl ON s.sala_id = sl.id
    WHERE s.data_agendamento = data_consulta
    GROUP BY sl.nome, sl.id
    ORDER BY sl.nome;
END;
$$ LANGUAGE plpgsql;

-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
COMMENT ON TABLE agendamentos_segmentos IS 'Tabela para tabulação de segmentos de 30 minutos em sessões terapêuticas de 90 minutos';
COMMENT ON COLUMN agendamentos_segmentos.numero_segmento IS 'Número do segmento (1, 2 ou 3) dentro da sessão de 90 minutos';
COMMENT ON COLUMN agendamentos_segmentos.horario_inicio_segmento IS 'Horário de início específico do segmento de 30 minutos';
COMMENT ON COLUMN agendamentos_segmentos.valor_segmento IS 'Valor proporcional do segmento (1/3 do valor total da sessão)';
COMMENT ON FUNCTION criar_segmentos_30_minutos() IS 'Trigger function para criar automaticamente 3 segmentos de 30min em salas terapêuticas';
COMMENT ON VIEW vw_segmentos_agendamentos IS 'View consolidada com dados dos segmentos e agendamentos principais';

-- 11. SCRIPT DE VALIDAÇÃO E TESTES
DO $$
DECLARE
    v_count_agendamentos INTEGER;
    v_count_segmentos INTEGER;
    v_count_terapia INTEGER;
BEGIN
    -- Contar agendamentos totais
    SELECT COUNT(*) INTO v_count_agendamentos FROM agendamentos;
    
    -- Contar segmentos criados
    SELECT COUNT(*) INTO v_count_segmentos FROM agendamentos_segmentos;
    
    -- Contar agendamentos em salas de terapia (90min)
    SELECT COUNT(*) INTO v_count_terapia
    FROM agendamentos a
    INNER JOIN salas s ON a.sala_id = s.id
    WHERE eh_sala_terapia_90min(s.nome);
    
    RAISE NOTICE '=== VALIDAÇÃO DO SISTEMA DE SEGMENTOS ===';
    RAISE NOTICE 'Total de agendamentos: %', v_count_agendamentos;
    RAISE NOTICE 'Agendamentos em salas de terapia (90min): %', v_count_terapia;
    RAISE NOTICE 'Total de segmentos criados: %', v_count_segmentos;
    RAISE NOTICE 'Segmentos esperados para terapia: % (3 por agendamento)', v_count_terapia * 3;
    
    IF v_count_segmentos = 0 AND v_count_terapia > 0 THEN
        RAISE NOTICE 'AÇÃO NECESSÁRIA: Execute popular_segmentos_agendamentos_existentes() para criar segmentos dos agendamentos existentes';
    END IF;
END;
$$;

-- ============================================================
-- SCRIPT CONCLUÍDO
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no Supabase
-- 2. Execute: SELECT popular_segmentos_agendamentos_existentes();
-- 3. Teste criando novos agendamentos em salas de terapia
-- 4. Verifique os segmentos com: SELECT * FROM vw_segmentos_agendamentos;
-- ============================================================
