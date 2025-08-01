-- ====================================================================
-- IMPLEMENTAÇÃO DA NOVA REGRA DE DURAÇÃO DE SESSÕES
-- ====================================================================
-- Regra: Anamnese e Neuropsicologia = duração flexível (30/60/90 min)
--        Demais salas de terapia = duração fixa de 90 minutos
-- Data: 31 de julho de 2025
-- Execute este script completo no Supabase SQL Editor
-- ====================================================================

BEGIN;

-- 1. REMOVER VIEW EXISTENTE
DROP VIEW IF EXISTS vw_agendamentos_completo CASCADE;

-- 2. RECRIAR VIEW COM NOVA REGRA DE DURAÇÃO
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
    
    -- DADOS DA ESPECIALIDADE (para sala de espera)
    e.nome as especialidade_nome,
    
    -- DADOS DO PROFISSIONAL PRINCIPAL (para sala de espera)
    c.nome_completo as profissional_nome,
    
    -- CAMPOS CALCULADOS PARA AUTOMAÇÃO
    CASE 
        WHEN a.status = 'em_atendimento' AND a.sessao_iniciada_em IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 
        ELSE 0 
    END as tempo_sessao_atual,
    
    -- ✅ NOVA REGRA DE DURAÇÃO: 90 min para terapias, flexível para anamnese/neuropsicologia
    CASE 
        -- Para Anamnese: duração flexível baseada no tipo_sessao
        WHEN LOWER(s.nome) LIKE '%anamnese%' THEN
            CASE 
                WHEN a.tipo_sessao = 'individual' THEN 30
                WHEN a.tipo_sessao = 'compartilhada' THEN 60  
                WHEN a.tipo_sessao = 'tripla' THEN 90
                ELSE 60
            END
        -- Para Neuropsicologia: duração flexível baseada no tipo_sessao
        WHEN LOWER(s.nome) LIKE '%neuropsicolog%' THEN
            CASE 
                WHEN a.tipo_sessao = 'individual' THEN 30
                WHEN a.tipo_sessao = 'compartilhada' THEN 60  
                WHEN a.tipo_sessao = 'tripla' THEN 90
                ELSE 60
            END
        -- Para todas as outras salas de terapia: duração fixa de 90 minutos
        ELSE 90
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
LEFT JOIN convenios cv ON a.convenio_id = cv.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN colaboradores c ON a.profissional_id = c.id;

-- 3. CRIAR FUNÇÃO AUXILIAR PARA DETERMINAR DURAÇÃO
CREATE OR REPLACE FUNCTION obter_duracao_sessao(
    sala_nome TEXT, 
    tipo_sessao TEXT DEFAULT 'compartilhada'
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Para Anamnese: duração flexível
    IF LOWER(sala_nome) LIKE '%anamnese%' THEN
        CASE tipo_sessao
            WHEN 'individual' THEN RETURN 30;
            WHEN 'compartilhada' THEN RETURN 60;
            WHEN 'tripla' THEN RETURN 90;
            ELSE RETURN 60;
        END CASE;
    END IF;
    
    -- Para Neuropsicologia: duração flexível
    IF LOWER(sala_nome) LIKE '%neuropsicolog%' THEN
        CASE tipo_sessao
            WHEN 'individual' THEN RETURN 30;
            WHEN 'compartilhada' THEN RETURN 60;
            WHEN 'tripla' THEN RETURN 90;
            ELSE RETURN 60;
        END CASE;
    END IF;
    
    -- Para todas as outras salas de terapia: 90 minutos fixo
    RETURN 90;
END;
$$;

-- 4. COMENTÁRIO NA FUNÇÃO PARA DOCUMENTAÇÃO
COMMENT ON FUNCTION obter_duracao_sessao(TEXT, TEXT) IS 
'Determina duração da sessão baseada no nome da sala e tipo de sessão. 
Anamnese e Neuropsicologia: flexível (30/60/90 min). 
Demais salas: fixo 90 min para permitir rotação de 30 em 30 min.';

-- 5. CRIAR ÍNDICES PARA PERFORMANCE (SE NÃO EXISTIREM)
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_status 
ON agendamentos(data_agendamento, status);

CREATE INDEX IF NOT EXISTS idx_agendamentos_sala_data 
ON agendamentos(sala_id, data_agendamento);

CREATE INDEX IF NOT EXISTS idx_salas_nome_lower 
ON salas(LOWER(nome));

-- 6. ATUALIZAR COMENTÁRIOS NAS TABELAS
COMMENT ON COLUMN agendamentos.tipo_sessao IS 
'Tipo de sessão: individual (30 min para anamnese/neuropsico), compartilhada (60 min para anamnese/neuropsico), tripla (90 min). Demais salas sempre 90 min.';

-- ====================================================================
-- TESTES DE VERIFICAÇÃO
-- ====================================================================

-- Teste 1: Verificar se a view foi criada
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'vw_agendamentos_completo') THEN
        RAISE NOTICE '✅ View vw_agendamentos_completo criada com sucesso!';
    ELSE
        RAISE EXCEPTION '❌ Erro: View não foi criada!';
    END IF;
END $$;

-- Teste 2: Verificar se a função foi criada
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'obter_duracao_sessao') THEN
        RAISE NOTICE '✅ Função obter_duracao_sessao() criada com sucesso!';
    ELSE
        RAISE EXCEPTION '❌ Erro: Função não foi criada!';
    END IF;
END $$;

-- Teste 3: Testar a função com diferentes cenários
DO $$
DECLARE
    duracao_anamnese_individual INTEGER;
    duracao_neuropsico_compartilhada INTEGER;
    duracao_fono_qualquer INTEGER;
BEGIN
    -- Testar Anamnese individual (deve ser 30)
    SELECT obter_duracao_sessao('Sala de Anamnese', 'individual') INTO duracao_anamnese_individual;
    IF duracao_anamnese_individual = 30 THEN
        RAISE NOTICE '✅ Anamnese individual: 30 min (correto)';
    ELSE
        RAISE EXCEPTION '❌ Anamnese individual: % min (deveria ser 30)', duracao_anamnese_individual;
    END IF;
    
    -- Testar Neuropsicologia compartilhada (deve ser 60)
    SELECT obter_duracao_sessao('Sala de Neuropsicologia', 'compartilhada') INTO duracao_neuropsico_compartilhada;
    IF duracao_neuropsico_compartilhada = 60 THEN
        RAISE NOTICE '✅ Neuropsicologia compartilhada: 60 min (correto)';
    ELSE
        RAISE EXCEPTION '❌ Neuropsicologia compartilhada: % min (deveria ser 60)', duracao_neuropsico_compartilhada;
    END IF;
    
    -- Testar Fonoaudiologia (deve ser sempre 90)
    SELECT obter_duracao_sessao('Sala de Fonoaudiologia', 'individual') INTO duracao_fono_qualquer;
    IF duracao_fono_qualquer = 90 THEN
        RAISE NOTICE '✅ Fonoaudiologia: 90 min fixo (correto)';
    ELSE
        RAISE EXCEPTION '❌ Fonoaudiologia: % min (deveria ser 90)', duracao_fono_qualquer;
    END IF;
END $$;

-- Teste 4: Verificar salas existentes e suas regras
DO $$
DECLARE
    total_salas INTEGER;
    salas_anamnese INTEGER;
    salas_neuropsico INTEGER;
    salas_terapia INTEGER;
BEGIN
    SELECT COUNT(*) FROM salas WHERE ativo = true INTO total_salas;
    SELECT COUNT(*) FROM salas WHERE ativo = true AND LOWER(nome) LIKE '%anamnese%' INTO salas_anamnese;
    SELECT COUNT(*) FROM salas WHERE ativo = true AND LOWER(nome) LIKE '%neuropsicolog%' INTO salas_neuropsico;
    SELECT COUNT(*) FROM salas WHERE ativo = true 
           AND LOWER(nome) NOT LIKE '%anamnese%' 
           AND LOWER(nome) NOT LIKE '%neuropsicolog%' INTO salas_terapia;
    
    RAISE NOTICE '📊 ESTATÍSTICAS DAS SALAS:';
    RAISE NOTICE '   Total de salas ativas: %', total_salas;
    RAISE NOTICE '   Salas de Anamnese (flexível): %', salas_anamnese;
    RAISE NOTICE '   Salas de Neuropsicologia (flexível): %', salas_neuropsico;
    RAISE NOTICE '   Salas de Terapia (90 min fixo): %', salas_terapia;
END $$;

COMMIT;

-- ====================================================================
-- RESULTADO FINAL
-- ====================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 =====================================================';
    RAISE NOTICE '🎯 NOVA REGRA DE DURAÇÃO IMPLEMENTADA COM SUCESSO!';
    RAISE NOTICE '🎯 =====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 REGRAS APLICADAS:';
    RAISE NOTICE '   • Anamnese: duração flexível (30/60/90 min)';
    RAISE NOTICE '   • Neuropsicologia: duração flexível (30/60/90 min)';
    RAISE NOTICE '   • Demais salas de terapia: duração fixa de 90 min';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 BENEFÍCIOS:';
    RAISE NOTICE '   • Permite rotação de 30 em 30 min entre profissionais';
    RAISE NOTICE '   • Profissional 1: 0-30 min';
    RAISE NOTICE '   • Profissional 2: 30-60 min';
    RAISE NOTICE '   • Profissional 3: 60-90 min';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Sistema pronto para uso!';
    RAISE NOTICE '';
END $$;
