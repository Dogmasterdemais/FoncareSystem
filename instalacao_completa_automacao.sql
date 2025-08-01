-- ============================================================================
-- INSTALAÇÃO COMPLETA: SISTEMA DE AUTOMAÇÃO + CORREÇÕES DE ESTRUTURA
-- ============================================================================
-- Execute este script NO SUPABASE DASHBOARD para corrigir todos os problemas
-- ============================================================================

-- 1. VERIFICAR E ADICIONAR CAMPOS FALTANTES NA TABELA AGENDAMENTOS
DO $$
BEGIN
    -- Adicionar sessao_iniciada_em se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'sessao_iniciada_em') THEN
        ALTER TABLE agendamentos ADD COLUMN sessao_iniciada_em TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Campo sessao_iniciada_em adicionado';
    END IF;

    -- Adicionar profissional_ativo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'profissional_ativo') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_ativo INTEGER DEFAULT 1;
        RAISE NOTICE '✅ Campo profissional_ativo adicionado';
    END IF;

    -- Adicionar tipo_sessao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'tipo_sessao') THEN
        ALTER TABLE agendamentos ADD COLUMN tipo_sessao TEXT DEFAULT 'individual';
        RAISE NOTICE '✅ Campo tipo_sessao adicionado';
    END IF;

    -- Adicionar tempo_profissional_1 se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_1') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_1 INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Campo tempo_profissional_1 adicionado';
    END IF;

    -- Adicionar tempo_profissional_2 se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_2') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_2 INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Campo tempo_profissional_2 adicionado';
    END IF;

    -- Adicionar tempo_profissional_3 se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_3') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_3 INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Campo tempo_profissional_3 adicionado';
    END IF;

    -- Adicionar profissional_1_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'profissional_1_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_1_id UUID REFERENCES colaboradores(id);
        RAISE NOTICE '✅ Campo profissional_1_id adicionado';
    END IF;

    -- Adicionar profissional_2_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'profissional_2_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_2_id UUID REFERENCES colaboradores(id);
        RAISE NOTICE '✅ Campo profissional_2_id adicionado';
    END IF;

    -- Adicionar profissional_3_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'profissional_3_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_3_id UUID REFERENCES colaboradores(id);
        RAISE NOTICE '✅ Campo profissional_3_id adicionado';
    END IF;

END $$;

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_status ON agendamentos(data_agendamento, status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_sessao_ativa ON agendamentos(sessao_iniciada_em) WHERE status = 'em_atendimento';
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_ativo ON agendamentos(profissional_ativo) WHERE status = 'em_atendimento';

-- 3. REMOVER FUNÇÕES ANTIGAS
DROP FUNCTION IF EXISTS processar_transicoes_automaticas() CASCADE;
DROP FUNCTION IF EXISTS executar_processamento_automatico() CASCADE;
DROP FUNCTION IF EXISTS iniciar_atendimento_manual(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS concluir_atendimento_manual(UUID) CASCADE;

SELECT '🧹 Funções antigas removidas' as limpeza;

-- 4. FUNÇÃO PRINCIPAL: EXECUTAR PROCESSAMENTO AUTOMÁTICO
CREATE OR REPLACE FUNCTION executar_processamento_automatico()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    agendamento_record RECORD;
    tempo_decorrido INTEGER;
    novo_profissional INTEGER;
    rotacoes_realizadas INTEGER := 0;
    resultado TEXT := '';
BEGIN
    RAISE NOTICE 'Iniciando processamento automático de transições...';
    
    -- Processar todos os agendamentos em atendimento
    FOR agendamento_record IN 
        SELECT 
            id,
            tipo_sessao,
            profissional_ativo,
            sessao_iniciada_em,
            EXTRACT(EPOCH FROM (NOW() - sessao_iniciada_em))::INTEGER / 60 as minutos_decorridos
        FROM agendamentos 
        WHERE status = 'em_atendimento' 
        AND sessao_iniciada_em IS NOT NULL
        AND data_agendamento = CURRENT_DATE
    LOOP
        tempo_decorrido := agendamento_record.minutos_decorridos;
        novo_profissional := agendamento_record.profissional_ativo;
        
        -- Determinar se precisa rotacionar
        IF agendamento_record.tipo_sessao = 'individual' THEN
            -- Individual: 30 minutos total, finalizar
            IF tempo_decorrido >= 30 THEN
                UPDATE agendamentos 
                SET status = 'concluido', updated_at = NOW()
                WHERE id = agendamento_record.id;
                
                resultado := resultado || format('Sessão individual finalizada (ID: %s)\n', agendamento_record.id);
            END IF;
            
        ELSIF agendamento_record.tipo_sessao = 'compartilhada' THEN
            -- Compartilhada: Prof1 (0-30min) → Prof2 (30-60min) → Finalizar
            IF tempo_decorrido >= 60 THEN
                UPDATE agendamentos 
                SET status = 'concluido', updated_at = NOW()
                WHERE id = agendamento_record.id;
                
                resultado := resultado || format('Sessão compartilhada finalizada (ID: %s)\n', agendamento_record.id);
                
            ELSIF tempo_decorrido >= 30 AND agendamento_record.profissional_ativo = 1 THEN
                UPDATE agendamentos 
                SET profissional_ativo = 2, updated_at = NOW()
                WHERE id = agendamento_record.id;
                
                rotacoes_realizadas := rotacoes_realizadas + 1;
                resultado := resultado || format('Rotação compartilhada: Prof1→Prof2 (ID: %s)\n', agendamento_record.id);
            END IF;
            
        ELSIF agendamento_record.tipo_sessao = 'tripla' THEN
            -- Tripla: Prof1 (0-30min) → Prof2 (30-60min) → Prof3 (60-90min) → Finalizar
            IF tempo_decorrido >= 90 THEN
                UPDATE agendamentos 
                SET status = 'concluido', updated_at = NOW()
                WHERE id = agendamento_record.id;
                
                resultado := resultado || format('Sessão tripla finalizada (ID: %s)\n', agendamento_record.id);
                
            ELSIF tempo_decorrido >= 60 AND agendamento_record.profissional_ativo = 2 THEN
                UPDATE agendamentos 
                SET profissional_ativo = 3, updated_at = NOW()
                WHERE id = agendamento_record.id;
                
                rotacoes_realizadas := rotacoes_realizadas + 1;
                resultado := resultado || format('Rotação tripla: Prof2→Prof3 (ID: %s)\n', agendamento_record.id);
                
            ELSIF tempo_decorrido >= 30 AND agendamento_record.profissional_ativo = 1 THEN
                UPDATE agendamentos 
                SET profissional_ativo = 2, updated_at = NOW()
                WHERE id = agendamento_record.id;
                
                rotacoes_realizadas := rotacoes_realizadas + 1;
                resultado := resultado || format('Rotação tripla: Prof1→Prof2 (ID: %s)\n', agendamento_record.id);
            END IF;
        END IF;
    END LOOP;
    
    IF rotacoes_realizadas = 0 AND resultado = '' THEN
        resultado := 'Nenhuma rotação necessária no momento';
    ELSE
        resultado := format('Processamento concluído: %s rotações realizadas\n%s', rotacoes_realizadas, resultado);
    END IF;
    
    RAISE NOTICE '%', resultado;
    RETURN resultado;
END $$;

-- 5. FUNÇÃO MANUAL: INICIAR ATENDIMENTO
CREATE OR REPLACE FUNCTION iniciar_atendimento_manual(
    agendamento_id UUID,
    tipo_sessao_param TEXT DEFAULT 'individual'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    resultado TEXT;
BEGIN
    UPDATE agendamentos 
    SET 
        status = 'em_atendimento',
        sessao_iniciada_em = NOW(),
        tipo_sessao = tipo_sessao_param,
        profissional_ativo = 1,
        updated_at = NOW()
    WHERE id = agendamento_id
    AND status IN ('agendado', 'pronto_para_terapia');
    
    IF FOUND THEN
        resultado := format('Atendimento iniciado com sucesso (ID: %s, Tipo: %s)', agendamento_id, tipo_sessao_param);
    ELSE
        resultado := format('Erro: Agendamento não encontrado ou já em atendimento (ID: %s)', agendamento_id);
    END IF;
    
    RAISE NOTICE '%', resultado;
    RETURN resultado;
END $$;

-- 6. FUNÇÃO MANUAL: CONCLUIR ATENDIMENTO
CREATE OR REPLACE FUNCTION concluir_atendimento_manual(agendamento_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    resultado TEXT;
BEGIN
    UPDATE agendamentos 
    SET 
        status = 'concluido',
        updated_at = NOW()
    WHERE id = agendamento_id
    AND status = 'em_atendimento';
    
    IF FOUND THEN
        resultado := format('Atendimento concluído com sucesso (ID: %s)', agendamento_id);
    ELSE
        resultado := format('Erro: Agendamento não encontrado ou não está em atendimento (ID: %s)', agendamento_id);
    END IF;
    
    RAISE NOTICE '%', resultado;
    RETURN resultado;
END $$;

-- 7. ATUALIZAR VIEW vw_agendamentos_completo PARA INCLUIR CAMPOS DE AUTOMAÇÃO
CREATE OR REPLACE VIEW vw_agendamentos_completo AS
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
    -- DADOS DA SALA
    s.numero as sala_numero,
    s.nome as sala_nome,
    s.cor as sala_cor,
    s.capacidade_maxima,
    s.unidade_id,
    u.nome as unidade_nome,
    -- DADOS DOS PROFISSIONAIS
    c1.nome_completo as profissional_nome,
    c1.cargo as profissional_especialidade,
    c2.nome_completo as profissional_2_nome,
    c2.cargo as profissional_2_especialidade,
    c3.nome_completo as profissional_3_nome,
    c3.cargo as profissional_3_especialidade,
    -- DADOS DO PACIENTE
    p.nome as paciente_nome,
    -- CAMPOS CALCULADOS
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 
        ELSE 0 
    END as tempo_sessao_atual,
    CASE 
        WHEN a.tipo_sessao = 'individual' THEN 30
        WHEN a.tipo_sessao = 'compartilhada' THEN 60  
        WHEN a.tipo_sessao = 'tripla' THEN 90
        ELSE 30
    END as duracao_planejada,
    a.status as status_dinamico,
    'aguardando' as proxima_acao
FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN unidades u ON s.unidade_id = u.id
LEFT JOIN colaboradores c1 ON a.profissional_1_id = c1.id
LEFT JOIN colaboradores c2 ON a.profissional_2_id = c2.id
LEFT JOIN colaboradores c3 ON a.profissional_3_id = c3.id
LEFT JOIN pacientes p ON a.paciente_id = p.id;

-- ============================================================================
-- MENSAGENS FINAIS
-- ============================================================================
SELECT '✅ INSTALAÇÃO COMPLETA FINALIZADA!' as resultado;
SELECT 'Sistema de automação de 30 minutos instalado com sucesso' as info;
SELECT 'Todos os campos necessários foram adicionados à tabela agendamentos' as estrutura;
SELECT 'View vw_agendamentos_completo atualizada com campos de automação' as view_info;
SELECT 'Execute o arquivo diagnostico_problemas_criticos.sql para verificar' as proximo_passo;
