-- Script para diagnosticar o problema do botão "Tabular Guia"
-- Execute no Supabase SQL Editor

-- 1. Verificar agendamentos de hoje
SELECT 
    'AGENDAMENTOS DE HOJE' as etapa,
    COUNT(*) as total_agendamentos
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE;

-- 2. Verificar status dos agendamentos de hoje
SELECT 
    status,
    COUNT(*) as quantidade,
    CASE 
        WHEN data_chegada IS NOT NULL THEN 'Chegou'
        ELSE 'Não chegou'
    END as situacao_chegada,
    CASE 
        WHEN codigo_autorizacao IS NOT NULL THEN 'Guia tabulada'
        ELSE 'Guia não tabulada'
    END as situacao_guia
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE
GROUP BY status, 
         (data_chegada IS NOT NULL), 
         (codigo_autorizacao IS NOT NULL)
ORDER BY status;

-- 3. Verificar detalhes específicos dos agendamentos problemáticos
SELECT 
    id,
    paciente_id,
    status,
    data_chegada,
    codigo_autorizacao,
    numero_guia,
    CASE 
        WHEN data_chegada IS NULL THEN '❌ Precisa confirmar chegada'
        WHEN data_chegada IS NOT NULL AND codigo_autorizacao IS NULL THEN '🚨 DEVE MOSTRAR BOTÃO TABULAR GUIA'
        WHEN codigo_autorizacao IS NOT NULL THEN '✅ Guia já tabulada'
        ELSE 'Situação desconhecida'
    END as diagnostico
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE
ORDER BY horario_inicio;

-- 4. Verificar se a view está funcionando
SELECT 
    'TESTE DA VIEW' as etapa,
    COUNT(*) as registros_na_view
FROM vw_agendamentos_completo 
WHERE data_agendamento = CURRENT_DATE;

-- 5. Simular um caso de teste - Criar agendamento para testar
INSERT INTO agendamentos (
    paciente_id,
    data_agendamento,
    horario_inicio,
    horario_fim,
    status,
    sala_id,
    unidade_id,
    convenio_id,
    numero_agendamento
) 
SELECT 
    (SELECT id FROM pacientes LIMIT 1),
    CURRENT_DATE,
    '14:00:00',
    '15:00:00',
    'agendado',
    (SELECT id FROM salas LIMIT 1),
    (SELECT id FROM unidades LIMIT 1),
    (SELECT id FROM convenios LIMIT 1),
    'TESTE-' || EXTRACT(EPOCH FROM NOW())::TEXT
WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE data_agendamento = CURRENT_DATE 
    AND horario_inicio = '14:00:00'
);

-- 6. Confirmar chegada no agendamento de teste
UPDATE agendamentos 
SET data_chegada = NOW(),
    status = 'aguardando'
WHERE data_agendamento = CURRENT_DATE 
  AND horario_inicio = '14:00:00'
  AND numero_agendamento LIKE 'TESTE-%'
  AND data_chegada IS NULL;

-- 7. Verificar o resultado após simular chegada
SELECT 
    'APÓS SIMULAR CHEGADA' as etapa,
    id,
    status,
    data_chegada,
    codigo_autorizacao,
    CASE 
        WHEN data_chegada IS NOT NULL AND codigo_autorizacao IS NULL 
        THEN '🚨 ESTE DEVE MOSTRAR O BOTÃO PISCANDO!'
        ELSE 'Não deve mostrar botão'
    END as deve_mostrar_botao
FROM agendamentos 
WHERE data_agendamento = CURRENT_DATE
  AND numero_agendamento LIKE 'TESTE-%';

-- Mensagem final
SELECT '🔍 DIAGNÓSTICO COMPLETO!' as resultado;
SELECT 'Verifique os registros que mostram "DEVE MOSTRAR BOTÃO TABULAR GUIA"' as instrucao;
