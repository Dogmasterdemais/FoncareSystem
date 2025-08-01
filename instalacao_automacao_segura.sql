-- ============================================================================
-- INSTALAÇÃO SEGURA DO SISTEMA DE AUTOMAÇÃO - VERSÃO COM TRATAMENTO DE ERROS
-- ============================================================================
-- Este script instala o sistema de automação de 30 minutos de forma segura
-- Trata problemas de integridade de dados existentes
-- Execute este arquivo no Supabase SQL Editor
-- ============================================================================

-- 1. VERIFICAÇÃO INICIAL DOS DADOS
SELECT 'VERIFICAÇÃO INICIAL - DADOS EXISTENTES' as etapa;

-- Verificar se existem dados inconsistentes
SELECT 
    'Agendamentos com profissional_id inválido:' as problema,
    COUNT(*) as total
FROM agendamentos a
WHERE a.profissional_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM colaboradores c WHERE c.id = a.profissional_id);

-- 2. ADICIONAR CAMPOS DE AUTOMAÇÃO À TABELA AGENDAMENTOS (VERSÃO SEGURA)
DO $$
BEGIN
    RAISE NOTICE 'Iniciando criação dos campos de automação...';
    
    -- Campo para marcar quando a sessão iniciou
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'sessao_iniciada_em') THEN
        ALTER TABLE agendamentos ADD COLUMN sessao_iniciada_em TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Campo sessao_iniciada_em criado';
    ELSE
        RAISE NOTICE 'Campo sessao_iniciada_em já existe';
    END IF;

    -- Campo para indicar qual profissional está ativo (1, 2 ou 3)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_ativo') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_ativo INTEGER DEFAULT 1;
        RAISE NOTICE 'Campo profissional_ativo criado';
    END IF;

    -- Campo para tipo de sessão (individual, compartilhada, tripla)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tipo_sessao') THEN
        ALTER TABLE agendamentos ADD COLUMN tipo_sessao VARCHAR(20) DEFAULT 'compartilhada';
        RAISE NOTICE 'Campo tipo_sessao criado';
    END IF;

    -- Campos para rastrear tempo com cada profissional (em minutos)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_1') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_1 INTEGER DEFAULT 0;
        RAISE NOTICE 'Campo tempo_profissional_1 criado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_2') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_2 INTEGER DEFAULT 0;
        RAISE NOTICE 'Campo tempo_profissional_2 criado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'tempo_profissional_3') THEN
        ALTER TABLE agendamentos ADD COLUMN tempo_profissional_3 INTEGER DEFAULT 0;
        RAISE NOTICE 'Campo tempo_profissional_3 criado';
    END IF;

    -- Campo para última atualização automática
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'ultima_rotacao') THEN
        ALTER TABLE agendamentos ADD COLUMN ultima_rotacao TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Campo ultima_rotacao criado';
    END IF;

    -- Campo para controle de notificações
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'notificacao_enviada') THEN
        ALTER TABLE agendamentos ADD COLUMN notificacao_enviada BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Campo notificacao_enviada criado';
    END IF;
END $$;

-- 3. ADICIONAR CAMPOS DE PROFISSIONAIS SEM FOREIGN KEY INICIALMENTE
DO $$
BEGIN
    RAISE NOTICE 'Criando campos de profissionais...';
    
    -- Campos para IDs dos 3 profissionais da sessão (SEM foreign key primeiro)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_1_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_1_id INTEGER;
        RAISE NOTICE 'Campo profissional_1_id criado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_2_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_2_id INTEGER;
        RAISE NOTICE 'Campo profissional_2_id criado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' AND column_name = 'profissional_3_id') THEN
        ALTER TABLE agendamentos ADD COLUMN profissional_3_id INTEGER;
        RAISE NOTICE 'Campo profissional_3_id criado';
    END IF;
END $$;

-- 4. LIMPEZA DE DADOS INCONSISTENTES
SELECT 'ETAPA 4: LIMPEZA DE DADOS INCONSISTENTES' as etapa;

-- Limpar profissional_id inválidos (definir como NULL) e contar
DO $$
DECLARE
    registros_limpos INTEGER;
BEGIN
    UPDATE agendamentos 
    SET profissional_id = NULL 
    WHERE profissional_id IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM colaboradores WHERE id = agendamentos.profissional_id);
    
    GET DIAGNOSTICS registros_limpos = ROW_COUNT;
    RAISE NOTICE 'Registros com profissional_id limpos: %', registros_limpos;
END $$;

-- 5. COPIAR DADOS VÁLIDOS PARA PROFISSIONAL_1_ID
UPDATE agendamentos 
SET profissional_1_id = profissional_id 
WHERE profissional_1_id IS NULL 
  AND profissional_id IS NOT NULL 
  AND EXISTS (SELECT 1 FROM colaboradores WHERE id = agendamentos.profissional_id);

SELECT 
    'Registros com profissional_1_id populados:' as info,
    COUNT(*) as total_populados
FROM agendamentos 
WHERE profissional_1_id IS NOT NULL;

-- 6. ADICIONAR FOREIGN KEY CONSTRAINTS APÓS LIMPEZA
DO $$
BEGIN
    RAISE NOTICE 'Adicionando constraints de foreign key...';
    
    -- Verificar se constraint já existe antes de criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_agendamentos_profissional_1') THEN
        ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamentos_profissional_1 
        FOREIGN KEY (profissional_1_id) REFERENCES colaboradores(id) ON DELETE SET NULL;
        RAISE NOTICE 'Constraint fk_agendamentos_profissional_1 criada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_agendamentos_profissional_2') THEN
        ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamentos_profissional_2 
        FOREIGN KEY (profissional_2_id) REFERENCES colaboradores(id) ON DELETE SET NULL;
        RAISE NOTICE 'Constraint fk_agendamentos_profissional_2 criada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_agendamentos_profissional_3') THEN
        ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamentos_profissional_3 
        FOREIGN KEY (profissional_3_id) REFERENCES colaboradores(id) ON DELETE SET NULL;
        RAISE NOTICE 'Constraint fk_agendamentos_profissional_3 criada';
    END IF;
    
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Ainda existem dados inconsistentes. Executando limpeza adicional...';
        -- Limpar dados inconsistentes que podem ter sido criados
        UPDATE agendamentos SET profissional_1_id = NULL 
        WHERE profissional_1_id IS NOT NULL 
          AND NOT EXISTS (SELECT 1 FROM colaboradores WHERE id = agendamentos.profissional_1_id);
        -- Tentar criar constraint novamente
        ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamentos_profissional_1 
        FOREIGN KEY (profissional_1_id) REFERENCES colaboradores(id) ON DELETE SET NULL;
END $$;

-- 7. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_sessao_ativa 
ON agendamentos(status, sessao_iniciada_em) 
WHERE status = 'em_atendimento';

CREATE INDEX IF NOT EXISTS idx_agendamentos_profissionais 
ON agendamentos(profissional_1_id, profissional_2_id, profissional_3_id);

-- 8. CRIAR VIEW ATUALIZADA COM TODOS OS CAMPOS DE AUTOMAÇÃO
-- Remover view existente se houver conflito de estrutura
DROP VIEW IF EXISTS vw_agendamentos_completo;

CREATE VIEW vw_agendamentos_completo AS
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
    -- CAMPOS DE CHEGADA E GUIA (ESSENCIAIS PARA SALA DE ESPERA)
    a.data_chegada,
    a.codigo_autorizacao,
    a.numero_guia,
    a.data_autorizacao,
    a.validade_autorizacao,
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

-- 9. FUNÇÕES DE AUTOMAÇÃO (versões simplificadas e seguras)
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
        COALESCE(p.nome, 'Paciente não encontrado') as paciente_nome,
        CASE 
            WHEN a.profissional_ativo = 1 THEN a.tempo_profissional_1
            WHEN a.profissional_ativo = 2 THEN a.tempo_profissional_2
            WHEN a.profissional_ativo = 3 THEN a.tempo_profissional_3
            ELSE 0
        END as tempo_atual,
        CASE 
            WHEN a.profissional_ativo = 1 THEN COALESCE(c1.nome_completo, 'Profissional não encontrado')
            WHEN a.profissional_ativo = 2 THEN COALESCE(c2.nome_completo, 'Profissional não encontrado')
            WHEN a.profissional_ativo = 3 THEN COALESCE(c3.nome_completo, 'Profissional não encontrado')
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

-- 10. VERIFICAÇÃO FINAL
SELECT 'VERIFICAÇÃO FINAL - INSTALAÇÃO CONCLUÍDA' as etapa;

-- Verificar se todas as colunas foram criadas corretamente
SELECT 
    'Colunas de automação criadas:' as titulo,
    COUNT(*) as colunas_automacao_criadas
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND column_name IN (
    'sessao_iniciada_em', 'profissional_ativo', 'tipo_sessao',
    'tempo_profissional_1', 'tempo_profissional_2', 'tempo_profissional_3',
    'profissional_1_id', 'profissional_2_id', 'profissional_3_id',
    'ultima_rotacao', 'notificacao_enviada'
);

-- Verificar constraints
SELECT 
    'Constraints criadas:' as titulo,
    COUNT(*) as constraints_criadas
FROM information_schema.table_constraints 
WHERE table_name = 'agendamentos' 
AND constraint_name LIKE 'fk_agendamentos_profissional_%';

-- Teste rápido da view
SELECT 
    'Teste da view:' as titulo,
    COUNT(*) as total_registros
FROM vw_agendamentos_completo;

-- Mensagens finais
SELECT '✅ INSTALAÇÃO SEGURA FINALIZADA!' as resultado;
SELECT 'Sistema de automação instalado com tratamento de erros' as info;
SELECT 'Dados inconsistentes foram limpos automaticamente' as limpeza;
SELECT 'Execute: SELECT * FROM atualizar_tempo_profissionais(); para testar' as teste;
