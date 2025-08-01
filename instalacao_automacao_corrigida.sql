-- ============================================================================
-- INSTALAÇÃO COMPLETA DO SISTEMA DE AUTOMAÇÃO - VERSÃO CORRIGIDA
-- ============================================================================
-- Este script instala o sistema de automação de 30 minutos na tabela agendamentos
-- Baseado na estrutura real da tabela obtida do banco de dados
-- Execute este arquivo no Supabase SQL Editor
-- ============================================================================

-- 1. ADICIONAR CAMPOS DE AUTOMAÇÃO À TABELA AGENDAMENTOS
-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
    -- Campo para marcar quando a sessão iniciou
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'sessao_iniciada_em') THEN
        ALTER TABLE agendamentos ADD COLUMN sessao_iniciada_em TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Campo para indicar qual profissional está ativo (1, 2 ou 3)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_ativo') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_ativo INTEGER DEFAULT 1;
    END IF;

    -- Campo para tipo de sessão (individual, compartilhada, tripla)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tipo_sessao') THEN
        ALTER TABLE agendamentos ADD COLUMN tipo_sessao VARCHAR(20) DEFAULT 'compartilhada';
    END IF;

    -- Campos para rastrear tempo com cada profissional (em minutos)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_1') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_1 INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_2') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_2 INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_3') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_3 INTEGER DEFAULT 0;
    END IF;

    -- Campos para IDs dos 3 profissionais da sessão (com constraint mais flexível)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_1_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_1_id INTEGER;
        -- Adicionar foreign key constraint separadamente para melhor controle
        ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamentos_profissional_1 
        FOREIGN KEY (profissional_1_id) REFERENCES colaboradores(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_2_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_2_id INTEGER;
        ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamentos_profissional_2 
        FOREIGN KEY (profissional_2_id) REFERENCES colaboradores(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_3_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_3_id INTEGER;
        ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamentos_profissional_3 
        FOREIGN KEY (profissional_3_id) REFERENCES colaboradores(id) ON DELETE SET NULL;
    END IF;

    -- Campo para última atualização automática
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'ultima_rotacao') THEN
        ALTER TABLE agendamentos ADD COLUMN ultima_rotacao TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Campo para controle de notificações
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'notificacao_enviada') THEN
        ALTER TABLE agendamentos ADD COLUMN notificacao_enviada BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_sessao_ativa 
ON agendamentos(status, sessao_iniciada_em) 
WHERE status = 'em_atendimento';

CREATE INDEX IF NOT EXISTS idx_agendamentos_profissionais 
ON agendamentos(profissional_1_id, profissional_2_id, profissional_3_id);

-- 3. ATUALIZAR AGENDAMENTOS EXISTENTES COM PROFISSIONAL_1_ID (COM VERIFICAÇÃO DE INTEGRIDADE)
-- Copiar apenas IDs que existem na tabela colaboradores
UPDATE agendamentos 
SET profissional_1_id = profissional_id 
WHERE profissional_1_id IS NULL 
  AND profissional_id IS NOT NULL 
  AND EXISTS (SELECT 1 FROM colaboradores WHERE id = agendamentos.profissional_id);

-- Verificar quantos registros foram atualizados e quantos têm IDs inválidos
SELECT 
    'Registros atualizados:' as info,
    COUNT(*) as total_atualizados
FROM agendamentos 
WHERE profissional_1_id IS NOT NULL;

SELECT 
    'Registros com profissional_id inválido:' as problema,
    COUNT(*) as total_problemas
FROM agendamentos 
WHERE profissional_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM colaboradores WHERE id = agendamentos.profissional_id);

-- 4. CRIAR VIEW ATUALIZADA COM TODOS OS CAMPOS DE AUTOMAÇÃO
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
    a.convenio_id,
    a.observacoes,
    a.created_at,
    a.updated_at,
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
    a.ultima_rotacao,
    a.notificacao_enviada,
    -- DADOS DA SALA
    s.numero as sala_numero,
    s.nome as sala_nome,
    s.cor as sala_cor,
    s.capacidade_maxima,
    s.unidade_id,
    u.nome as unidade_nome,
    -- DADOS DOS PROFISSIONAIS
    c1.nome_completo as profissional_1_nome,
    c1.cargo as profissional_1_especialidade,
    c2.nome_completo as profissional_2_nome,
    c2.cargo as profissional_2_especialidade,
    c3.nome_completo as profissional_3_nome,
    c3.cargo as profissional_3_especialidade,
    -- DADOS DO PACIENTE
    p.nome as paciente_nome,
    p.data_nascimento as paciente_nascimento,
    p.telefone as paciente_telefone,
    -- DADOS DO CONVÊNIO
    cv.nome as convenio_nome,
    -- CAMPOS CALCULADOS PARA AUTOMAÇÃO
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 
        ELSE 0 
    END as tempo_sessao_atual,
    CASE 
        WHEN a.tipo_sessao = 'individual' THEN 30
        WHEN a.tipo_sessao = 'compartilhada' THEN 60  
        WHEN a.tipo_sessao = 'tripla' THEN 90
        ELSE 60
    END as duracao_planejada,
    -- Status dinâmico baseado na automação
    CASE 
        WHEN a.status != 'em_atendimento' THEN a.status
        WHEN a.sessao_iniciada_em IS NULL THEN 'aguardando_inicio'
        WHEN a.profissional_ativo = 1 AND a.tempo_profissional_1 < 30 THEN 'com_profissional_1'
        WHEN a.profissional_ativo = 2 AND a.tempo_profissional_2 < 30 THEN 'com_profissional_2'
        WHEN a.profissional_ativo = 3 AND a.tempo_profissional_3 < 30 THEN 'com_profissional_3'
        ELSE 'necessita_rotacao'
    END as status_automacao,
    -- Próxima ação recomendada
    CASE 
        WHEN a.status != 'em_atendimento' THEN 'nenhuma'
        WHEN a.sessao_iniciada_em IS NULL THEN 'iniciar_sessao'
        WHEN a.tempo_profissional_1 >= 30 AND a.profissional_ativo = 1 THEN 'trocar_para_profissional_2'
        WHEN a.tempo_profissional_2 >= 30 AND a.profissional_ativo = 2 THEN 'trocar_para_profissional_3'
        WHEN a.tempo_profissional_3 >= 30 AND a.profissional_ativo = 3 THEN 'finalizar_sessao'
        ELSE 'continuar'
    END as proxima_acao
FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN unidades u ON s.unidade_id = u.id
LEFT JOIN colaboradores c1 ON a.profissional_1_id = c1.id
LEFT JOIN colaboradores c2 ON a.profissional_2_id = c2.id
LEFT JOIN colaboradores c3 ON a.profissional_3_id = c3.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN convenios cv ON a.convenio_id = cv.id;

-- 5. FUNÇÃO PARA ATUALIZAR TEMPO DOS PROFISSIONAIS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION atualizar_tempo_profissionais()
RETURNS TABLE(
    agendamento_id integer, 
    paciente_nome varchar, 
    tempo_atual integer,
    profissional_ativo_nome varchar,
    proxima_acao varchar
) AS $$
BEGIN
    -- Atualizar os tempos baseado no tempo decorrido
    UPDATE agendamentos 
    SET 
        tempo_profissional_1 = CASE 
            WHEN profissional_ativo = 1 AND sessao_iniciada_em IS NOT NULL 
            THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - sessao_iniciada_em))::INTEGER / 60)
            ELSE tempo_profissional_1 
        END,
        tempo_profissional_2 = CASE 
            WHEN profissional_ativo = 2 AND ultima_rotacao IS NOT NULL 
            THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - ultima_rotacao))::INTEGER / 60)
            ELSE tempo_profissional_2 
        END,
        tempo_profissional_3 = CASE 
            WHEN profissional_ativo = 3 AND ultima_rotacao IS NOT NULL 
            THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - ultima_rotacao))::INTEGER / 60)
            ELSE tempo_profissional_3 
        END
    WHERE status = 'em_atendimento' AND sessao_iniciada_em IS NOT NULL;

    -- Retornar relatório dos agendamentos que precisam de ação
    RETURN QUERY
    SELECT 
        a.id,
        p.nome as paciente_nome,
        CASE 
            WHEN a.profissional_ativo = 1 THEN a.tempo_profissional_1
            WHEN a.profissional_ativo = 2 THEN a.tempo_profissional_2
            WHEN a.profissional_ativo = 3 THEN a.tempo_profissional_3
            ELSE 0
        END as tempo_atual,
        CASE 
            WHEN a.profissional_ativo = 1 THEN c1.nome_completo
            WHEN a.profissional_ativo = 2 THEN c2.nome_completo
            WHEN a.profissional_ativo = 3 THEN c3.nome_completo
            ELSE 'Não definido'
        END as profissional_ativo_nome,
        CASE 
            WHEN a.tempo_profissional_1 >= 30 AND a.profissional_ativo = 1 THEN 'trocar_para_profissional_2'
            WHEN a.tempo_profissional_2 >= 30 AND a.profissional_ativo = 2 THEN 'trocar_para_profissional_3'
            WHEN a.tempo_profissional_3 >= 30 AND a.profissional_ativo = 3 THEN 'finalizar_sessao'
            ELSE 'continuar'
        END as proxima_acao
    FROM agendamentos a
    LEFT JOIN pacientes p ON a.paciente_id = p.id
    LEFT JOIN colaboradores c1 ON a.profissional_1_id = c1.id
    LEFT JOIN colaboradores c2 ON a.profissional_2_id = c2.id
    LEFT JOIN colaboradores c3 ON a.profissional_3_id = c3.id
    WHERE a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNÇÃO PARA EXECUTAR ROTAÇÃO AUTOMÁTICA
CREATE OR REPLACE FUNCTION executar_rotacao_automatica(agendamento_id_param integer)
RETURNS varchar AS $$
DECLARE
    agendamento_atual agendamentos%ROWTYPE;
    resultado varchar;
BEGIN
    -- Buscar o agendamento atual
    SELECT * INTO agendamento_atual FROM agendamentos WHERE id = agendamento_id_param;
    
    IF NOT FOUND THEN
        RETURN 'Agendamento não encontrado';
    END IF;
    
    -- Executar rotação baseada no profissional ativo atual
    IF agendamento_atual.profissional_ativo = 1 AND agendamento_atual.tempo_profissional_1 >= 30 THEN
        UPDATE agendamentos 
        SET 
            profissional_ativo = 2,
            ultima_rotacao = NOW(),
            notificacao_enviada = FALSE
        WHERE id = agendamento_id_param;
        resultado := 'Rotação para profissional 2 executada';
        
    ELSIF agendamento_atual.profissional_ativo = 2 AND agendamento_atual.tempo_profissional_2 >= 30 THEN
        UPDATE agendamentos 
        SET 
            profissional_ativo = 3,
            ultima_rotacao = NOW(),
            notificacao_enviada = FALSE
        WHERE id = agendamento_id_param;
        resultado := 'Rotação para profissional 3 executada';
        
    ELSIF agendamento_atual.profissional_ativo = 3 AND agendamento_atual.tempo_profissional_3 >= 30 THEN
        UPDATE agendamentos 
        SET 
            status = 'finalizado',
            updated_at = NOW()
        WHERE id = agendamento_id_param;
        resultado := 'Sessão finalizada automaticamente';
        
    ELSE
        resultado := 'Nenhuma rotação necessária';
    END IF;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- 7. FUNÇÃO PARA INICIAR SESSÃO
CREATE OR REPLACE FUNCTION iniciar_sessao_agendamento(agendamento_id_param integer)
RETURNS varchar AS $$
BEGIN
    UPDATE agendamentos 
    SET 
        status = 'em_atendimento',
        sessao_iniciada_em = NOW(),
        profissional_ativo = 1,
        tempo_profissional_1 = 0,
        tempo_profissional_2 = 0,
        tempo_profissional_3 = 0,
        ultima_rotacao = NULL,
        notificacao_enviada = FALSE,
        updated_at = NOW()
    WHERE id = agendamento_id_param AND status = 'agendado';
    
    IF FOUND THEN
        RETURN 'Sessão iniciada com sucesso';
    ELSE
        RETURN 'Erro: Agendamento não encontrado ou não está no status adequado';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGERS PARA MANTER DADOS ATUALIZADOS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION trigger_atualizar_tempo_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Sempre que um agendamento for atualizado, recalcular os tempos
    IF NEW.status = 'em_atendimento' AND NEW.sessao_iniciada_em IS NOT NULL THEN
        NEW.tempo_profissional_1 := CASE 
            WHEN NEW.profissional_ativo = 1 
            THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - NEW.sessao_iniciada_em))::INTEGER / 60)
            ELSE NEW.tempo_profissional_1 
        END;
        
        NEW.tempo_profissional_2 := CASE 
            WHEN NEW.profissional_ativo = 2 AND NEW.ultima_rotacao IS NOT NULL
            THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - NEW.ultima_rotacao))::INTEGER / 60)
            ELSE NEW.tempo_profissional_2 
        END;
        
        NEW.tempo_profissional_3 := CASE 
            WHEN NEW.profissional_ativo = 3 AND NEW.ultima_rotacao IS NOT NULL
            THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - NEW.ultima_rotacao))::INTEGER / 60)
            ELSE NEW.tempo_profissional_3 
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_agendamentos_tempo_automatico ON agendamentos;
CREATE TRIGGER trigger_agendamentos_tempo_automatico
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_tempo_automatico();

-- 9. CONFIGURAÇÕES DE SEGURANÇA (RLS)
-- Habilitar RLS se não estiver habilitado
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS de forma segura
DO $$
BEGIN
    -- Remover políticas existentes se houver
    DROP POLICY IF EXISTS "Permitir leitura automação agendamentos" ON agendamentos;
    DROP POLICY IF EXISTS "Permitir atualização automação agendamentos" ON agendamentos;
    
    -- Criar política para permitir leitura dos dados de automação
    EXECUTE 'CREATE POLICY "Permitir leitura automação agendamentos" ON agendamentos FOR SELECT USING (true)';
    
    -- Criar política para permitir atualização dos campos de automação
    EXECUTE 'CREATE POLICY "Permitir atualização automação agendamentos" ON agendamentos FOR UPDATE USING (true)';
    
EXCEPTION 
    WHEN duplicate_object THEN 
        -- Políticas já existem, ignorar erro
        NULL;
    WHEN OTHERS THEN
        -- Outros erros, re-raise
        RAISE;
END $$;

-- ============================================================================
-- MENSAGENS FINAIS E VERIFICAÇÕES
-- ============================================================================

-- Verificar se todas as colunas foram criadas corretamente
SELECT 
    'Verificação das colunas de automação:' as titulo,
    COUNT(*) as colunas_automacao_criadas
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND column_name IN (
    'sessao_iniciada_em', 'profissional_ativo', 'tipo_sessao',
    'tempo_profissional_1', 'tempo_profissional_2', 'tempo_profissional_3',
    'profissional_1_id', 'profissional_2_id', 'profissional_3_id',
    'ultima_rotacao', 'notificacao_enviada'
);

-- Mensagem de sucesso
SELECT '✅ INSTALAÇÃO CORRIGIDA FINALIZADA!' as resultado;
SELECT 'Sistema de automação instalado com estrutura correta da tabela' as info;
SELECT 'Execute: SELECT * FROM atualizar_tempo_profissionais(); para testar' as teste;
SELECT 'Use: SELECT iniciar_sessao_agendamento(ID); para iniciar uma sessão' as uso;
