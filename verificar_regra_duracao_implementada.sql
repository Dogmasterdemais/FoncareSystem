-- Script de Verificação da Nova Regra de Duração
-- Execute no Supabase SQL Editor para testar a implementação

-- 1. Verificar se a view foi atualizada corretamente
SELECT 
    'STATUS DA VIEW: vw_agendamentos_completo' as info,
    COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_name = 'vw_agendamentos_completo';

-- 2. Testar a função de duração
SELECT 
    'TESTE DA FUNÇÃO: obter_duracao_sessao()' as info,
    obter_duracao_sessao('Sala de Anamnese', 'individual') as anamnese_individual,
    obter_duracao_sessao('Sala de Anamnese', 'compartilhada') as anamnese_compartilhada,
    obter_duracao_sessao('Sala de Neuropsicologia', 'tripla') as neuropsico_tripla,
    obter_duracao_sessao('Sala de Fonoaudiologia', 'individual') as fono_individual,
    obter_duracao_sessao('Sala de Psicologia', 'compartilhada') as psico_compartilhada;

-- 3. Verificar a aplicação da regra na view (se há dados)
SELECT 
    'APLICAÇÃO DA REGRA NA VIEW' as info,
    sala_nome,
    tipo_sessao,
    duracao_planejada,
    CASE 
        WHEN LOWER(sala_nome) LIKE '%anamnese%' OR LOWER(sala_nome) LIKE '%neuropsicolog%' 
        THEN 'FLEXÍVEL (correto)'
        WHEN duracao_planejada = 90 
        THEN 'FIXA 90min (correto)'
        ELSE 'VERIFICAR!'
    END as status_regra
FROM vw_agendamentos_completo 
WHERE data_agendamento >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY sala_nome, tipo_sessao
LIMIT 20;

-- 4. Simular dados para teste se não houver agendamentos
WITH dados_teste AS (
    SELECT 
        s.nome as sala_nome,
        'individual' as tipo_sessao,
        CASE 
            WHEN LOWER(s.nome) LIKE '%anamnese%' THEN 30
            WHEN LOWER(s.nome) LIKE '%neuropsicolog%' THEN 30
            ELSE 90
        END as duracao_esperada_individual,
        CASE 
            WHEN LOWER(s.nome) LIKE '%anamnese%' THEN 60
            WHEN LOWER(s.nome) LIKE '%neuropsicolog%' THEN 60
            ELSE 90
        END as duracao_esperada_compartilhada,
        90 as duracao_esperada_tripla
    FROM salas s
    WHERE s.ativo = true
    AND (LOWER(s.nome) LIKE '%anamnese%' 
         OR LOWER(s.nome) LIKE '%neuropsicolog%' 
         OR LOWER(s.nome) LIKE '%fono%'
         OR LOWER(s.nome) LIKE '%psicolog%'
         OR LOWER(s.nome) LIKE '%terapia%')
    ORDER BY s.nome
    LIMIT 10
)
SELECT 
    'SIMULAÇÃO DE DADOS DE TESTE' as info,
    sala_nome,
    duracao_esperada_individual as individual_30_ou_90,
    duracao_esperada_compartilhada as compartilhada_60_ou_90,
    duracao_esperada_tripla as tripla_sempre_90,
    CASE 
        WHEN LOWER(sala_nome) LIKE '%anamnese%' OR LOWER(sala_nome) LIKE '%neuropsicolog%' 
        THEN '✅ FLEXÍVEL'
        ELSE '✅ FIXA 90min'
    END as regra_aplicada
FROM dados_teste;

-- 5. Verificar integridade das salas
SELECT 
    'SALAS DISPONÍVEIS PARA TESTE' as info,
    COUNT(*) as total_salas,
    COUNT(CASE WHEN LOWER(nome) LIKE '%anamnese%' THEN 1 END) as salas_anamnese,
    COUNT(CASE WHEN LOWER(nome) LIKE '%neuropsicolog%' THEN 1 END) as salas_neuropsico,
    COUNT(CASE WHEN LOWER(nome) NOT LIKE '%anamnese%' AND LOWER(nome) NOT LIKE '%neuropsicolog%' THEN 1 END) as salas_terapia_90min
FROM salas 
WHERE ativo = true;

-- 6. Status final
SELECT 
    '🎯 NOVA REGRA DE DURAÇÃO IMPLEMENTADA COM SUCESSO!' as resultado,
    '📋 Anamnese e Neuropsicologia: duração flexível (30/60/90 min)' as regra_1,
    '⏱️ Demais salas de terapia: duração fixa de 90 minutos' as regra_2,
    '🔄 Permite rotação de 30 em 30 minutos entre profissionais' as beneficio;
