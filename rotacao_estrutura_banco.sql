-- Modificações na Estrutura do Banco para Sistema de Rotação de 3 Profissionais
-- Data: ${new Date().toISOString().split('T')[0]}

-- =====================================================
-- 1. Adicionar Colunas na Tabela Agendamentos
-- =====================================================

-- Verificar e adicionar colunas para o sistema de rotação
DO $$
BEGIN
    -- Campo para armazenar o tempo de cada profissional
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_3') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_3 INTEGER DEFAULT 0;
        COMMENT ON COLUMN agendamentos.tempo_profissional_3 IS 'Tempo em minutos que o paciente passou com o profissional 3';
    END IF;

    -- Campo para timestamps de início com cada profissional
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_inicio_timestamps') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_inicio_timestamps JSONB DEFAULT '{}';
        COMMENT ON COLUMN agendamentos.profissional_inicio_timestamps IS 'Timestamps de quando cada profissional iniciou atendimento';
    END IF;

    -- Campo para histórico de rotações
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'historico_rotacoes') THEN
        ALTER TABLE agendamentos ADD COLUMN historico_rotacoes JSONB DEFAULT '[]';
        COMMENT ON COLUMN agendamentos.historico_rotacoes IS 'Histórico detalhado das rotações entre profissionais';
    END IF;

    -- Campo para indicar se a rotação foi completa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'rotacao_completa') THEN
        ALTER TABLE agendamentos ADD COLUMN rotacao_completa BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN agendamentos.rotacao_completa IS 'Indica se o paciente passou pelos 3 profissionais';
    END IF;

    RAISE NOTICE 'Colunas para rotação de 3 profissionais adicionadas com sucesso!';
END
$$;

-- =====================================================
-- 2. Atualizar View vw_agendamentos_completo
-- =====================================================

-- Primeiro, remover a view existente para recriar com novas colunas
DROP VIEW IF EXISTS vw_agendamentos_completo;

-- Recriar a view com as novas colunas de rotação
CREATE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.tipo_sessao,
    a.duracao_planejada,
    a.observacoes,
    a.created_at,
    a.updated_at,
    
    -- Paciente
    p.nome as paciente_nome,
    p.cpf as paciente_cpf,
    p.telefone as paciente_telefone,
    p.data_nascimento as paciente_nascimento,
    p.id as paciente_id,
    
    -- Unidade
    u.nome as unidade_nome,
    u.id as unidade_id,
    
    -- Sala
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.capacidade_maxima as sala_capacidade,
    s.cor as sala_cor,
    s.id as sala_id,
    
    -- Profissionais
    prof1.nome as profissional_nome,
    prof1.id as profissional_id,
    esp1.nome as profissional_especialidade,
    
    prof2.nome as profissional_2_nome,
    prof2.id as profissional_2_id,
    esp2.nome as profissional_2_especialidade,
    
    prof3.nome as profissional_3_nome,
    prof3.id as profissional_3_id,
    esp3.nome as profissional_3_especialidade,
    
    -- Sistema de Rotação
    a.profissional_ativo,
    a.tempo_profissional_1,
    a.tempo_profissional_2,
    a.tempo_profissional_3,
    a.rotacao_completa,
    a.profissional_inicio_timestamps,
    a.historico_rotacoes,
    
    -- Timer e sessão
    a.sessao_iniciada_em,
    a.sessao_pausada_em,
    a.sessao_finalizada_em,
    
    -- Cálculo do tempo atual da sessão
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_pausada_em IS NULL THEN
            EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60
        WHEN a.status = 'em_atendimento' AND a.sessao_pausada_em IS NOT NULL THEN
            EXTRACT(EPOCH FROM (a.sessao_pausada_em - a.sessao_iniciada_em)) / 60
        WHEN a.status = 'concluido' AND a.sessao_finalizada_em IS NOT NULL THEN
            EXTRACT(EPOCH FROM (a.sessao_finalizada_em - a.sessao_iniciada_em)) / 60
        ELSE 0
    END as tempo_sessao_atual,
    
    -- Status dinâmico baseado no tempo e rotação
    CASE 
        WHEN a.status = 'em_atendimento' AND a.rotacao_completa = TRUE THEN 'sessao_completa'
        WHEN a.status = 'em_atendimento' AND EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 
             AND a.profissional_ativo = 1 THEN 'troca_para_profissional_2'
        WHEN a.status = 'em_atendimento' AND EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 
             AND a.profissional_ativo = 2 THEN 'troca_para_profissional_3'
        WHEN a.status = 'em_atendimento' AND EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 
             AND a.profissional_ativo = 3 THEN 'sessao_completa'
        WHEN a.status = 'em_atendimento' THEN 'em_andamento'
        ELSE NULL
    END as status_dinamico,
    
    -- Próxima ação sugerida
    CASE 
        WHEN a.status = 'agendado' THEN 'Aguardando chegada do paciente'
        WHEN a.status = 'chegou' THEN 'Marcar como pronto para terapia'
        WHEN a.status = 'pronto_para_terapia' THEN 'Iniciar rotação com primeiro profissional'
        WHEN a.status = 'em_atendimento' AND a.rotacao_completa = TRUE THEN 'Finalizar sessão (rotação completa)'
        WHEN a.status = 'em_atendimento' AND a.profissional_ativo = 1 AND 
             EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 THEN 'Rotacionar para profissional 2'
        WHEN a.status = 'em_atendimento' AND a.profissional_ativo = 2 AND 
             EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 THEN 'Rotacionar para profissional 3'
        WHEN a.status = 'em_atendimento' AND a.profissional_ativo = 3 AND 
             EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em)) / 60 >= 30 THEN 'Finalizar sessão'
        WHEN a.status = 'em_atendimento' THEN 'Em atendimento - aguardar 30 minutos'
        WHEN a.status = 'concluido' THEN 'Sessão finalizada'
        ELSE 'Aguardando ação'
    END as proxima_acao,
    
    -- Informações de progresso
    CASE 
        WHEN a.profissional_ativo = 1 THEN '1/3 - Primeiro Profissional'
        WHEN a.profissional_ativo = 2 THEN '2/3 - Segundo Profissional'
        WHEN a.profissional_ativo = 3 THEN '3/3 - Terceiro Profissional'
        ELSE '0/3 - Não Iniciado'
    END as progresso_rotacao,
    
    -- Convênio (se existir)
    conv.nome as convenio_nome,
    conv.id as convenio_id

FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN unidades u ON a.unidade_id = u.id
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN profissionais prof1 ON a.profissional_id = prof1.id
LEFT JOIN especialidades esp1 ON prof1.especialidade_id = esp1.id
LEFT JOIN profissionais prof2 ON a.profissional_2_id = prof2.id
LEFT JOIN especialidades esp2 ON prof2.especialidade_id = esp2.id
LEFT JOIN profissionais prof3 ON a.profissional_3_id = prof3.id
LEFT JOIN especialidades esp3 ON prof3.especialidade_id = esp3.id
LEFT JOIN convenios conv ON a.convenio_id = conv.id;

-- Comentário na view
COMMENT ON VIEW vw_agendamentos_completo IS 'View completa com informações de rotação de 3 profissionais, timers e status dinâmicos';

-- =====================================================
-- 3. Criar Tabela de Auditoria (se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS agendamentos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    acao VARCHAR(50) NOT NULL,
    usuario_id UUID REFERENCES auth.users(id),
    detalhes JSONB,
    timestamp_acao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentário na tabela
COMMENT ON TABLE agendamentos_auditoria IS 'Auditoria de ações realizadas nos agendamentos, incluindo rotações';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_auditoria_agendamento_id ON agendamentos_auditoria(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_auditoria_acao ON agendamentos_auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_agendamentos_auditoria_timestamp ON agendamentos_auditoria(timestamp_acao);

-- =====================================================
-- 4. Política RLS para Auditoria
-- =====================================================

-- Habilitar RLS na tabela de auditoria
ALTER TABLE agendamentos_auditoria ENABLE ROW LEVEL SECURITY;

-- Política para visualização (mesmas regras dos agendamentos)
CREATE POLICY "Usuários podem ver auditoria dos próprios agendamentos" ON agendamentos_auditoria
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM agendamentos a
            WHERE a.id = agendamentos_auditoria.agendamento_id
            AND (
                a.unidade_id::text = COALESCE(auth.jwt() ->> 'unidade_id', '')
                OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
            )
        )
    );

-- Política para inserção
CREATE POLICY "Usuários podem inserir auditoria" ON agendamentos_auditoria
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 5. Trigger para Histórico de Rotações
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_historico_rotacao()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o profissional ativo mudou, registrar no histórico
    IF OLD.profissional_ativo IS DISTINCT FROM NEW.profissional_ativo THEN
        NEW.historico_rotacoes = COALESCE(NEW.historico_rotacoes, '[]'::jsonb) || 
            jsonb_build_array(
                jsonb_build_object(
                    'timestamp', NOW(),
                    'profissional_anterior', OLD.profissional_ativo,
                    'profissional_novo', NEW.profissional_ativo,
                    'tempo_anterior', CASE 
                        WHEN OLD.profissional_ativo = 1 THEN OLD.tempo_profissional_1
                        WHEN OLD.profissional_ativo = 2 THEN OLD.tempo_profissional_2  
                        WHEN OLD.profissional_ativo = 3 THEN OLD.tempo_profissional_3
                        ELSE 0
                    END,
                    'usuario_id', auth.uid()
                )
            );
            
        -- Verificar se completou rotação com os 3 profissionais
        IF NEW.profissional_ativo = 3 AND OLD.profissional_ativo = 2 THEN
            NEW.rotacao_completa = TRUE;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_historico_rotacao ON agendamentos;
CREATE TRIGGER trigger_historico_rotacao
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_historico_rotacao();

-- =====================================================
-- 6. Dados de Exemplo e Validação
-- =====================================================

-- Verificar se as modificações foram aplicadas
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Verificar colunas adicionadas
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns 
    WHERE table_name = 'agendamentos' 
    AND column_name IN ('tempo_profissional_3', 'profissional_inicio_timestamps', 'historico_rotacoes', 'rotacao_completa');
    
    IF v_count = 4 THEN
        RAISE NOTICE '✅ Todas as colunas foram adicionadas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Algumas colunas podem não ter sido adicionadas. Verificar manualmente.';
    END IF;
    
    -- Verificar view atualizada
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'vw_agendamentos_completo') THEN
        RAISE NOTICE '✅ View vw_agendamentos_completo atualizada!';
    ELSE
        RAISE NOTICE '⚠️ View vw_agendamentos_completo não encontrada!';
    END IF;
    
    -- Verificar tabela de auditoria
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos_auditoria') THEN
        RAISE NOTICE '✅ Tabela de auditoria criada!';
    ELSE
        RAISE NOTICE '⚠️ Tabela de auditoria não foi criada!';
    END IF;
END
$$;

-- =====================================================
-- 7. Mensagens Finais
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎯 Sistema de Rotação de 3 Profissionais - Estrutura de Banco Atualizada!';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '   1. Executar rotacao_automatica_funcoes.sql';
    RAISE NOTICE '   2. Testar sistema na interface web';
    RAISE NOTICE '   3. Verificar rotações automáticas funcionando';
    RAISE NOTICE '💡 Cada paciente deve passar 30min com cada um dos 3 profissionais!';
END
$$;
