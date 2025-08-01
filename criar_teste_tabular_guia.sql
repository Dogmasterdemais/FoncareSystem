-- Script para criar dados de teste para o botão "Tabular Guia"
-- Execute no Supabase SQL Editor

-- 1. Limpar dados de teste antigos
DELETE FROM agendamentos 
WHERE numero_agendamento LIKE 'TESTE-TABULAR-%';

-- 2. Criar um agendamento de teste para hoje
INSERT INTO agendamentos (
    paciente_id,
    data_agendamento,
    horario_inicio,
    horario_fim,
    status,
    sala_id,
    unidade_id,
    convenio_id,
    numero_agendamento,
    created_at,
    updated_at
) 
SELECT 
    (SELECT id FROM pacientes ORDER BY created_at DESC LIMIT 1),
    CURRENT_DATE,
    '15:30:00',
    '16:30:00',
    'agendado',
    (SELECT id FROM salas ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM unidades ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM convenios ORDER BY created_at DESC LIMIT 1),
    'TESTE-TABULAR-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE data_agendamento = CURRENT_DATE 
    AND horario_inicio = '15:30:00'
);

-- 3. Verificar se o agendamento foi criado
SELECT 
    'Agendamento de teste criado:' as info,
    id,
    numero_agendamento,
    status,
    data_chegada,
    codigo_autorizacao
FROM agendamentos 
WHERE numero_agendamento LIKE 'TESTE-TABULAR-%'
ORDER BY created_at DESC;

-- 4. Simular confirmação de chegada (isso deve fazer o botão aparecer)
UPDATE agendamentos 
SET 
    data_chegada = NOW(),
    status = 'aguardando',
    updated_at = NOW()
WHERE numero_agendamento LIKE 'TESTE-TABULAR-%'
  AND data_chegada IS NULL;

-- 5. Verificar o estado após confirmar chegada
SELECT 
    'Estado após confirmar chegada:' as etapa,
    id,
    numero_agendamento,
    status,
    data_chegada IS NOT NULL as chegou,
    codigo_autorizacao IS NULL as guia_nao_tabulada,
    CASE 
        WHEN data_chegada IS NOT NULL AND codigo_autorizacao IS NULL 
        THEN '🚨 DEVE MOSTRAR BOTÃO TABULAR GUIA!'
        ELSE 'Não deve mostrar botão'
    END as deve_mostrar_botao
FROM agendamentos 
WHERE numero_agendamento LIKE 'TESTE-TABULAR-%';

-- 6. Verificar através da view
SELECT 
    'Dados na view:' as etapa,
    id,
    paciente_nome,
    status,
    data_chegada IS NOT NULL as chegou,
    codigo_autorizacao IS NULL as guia_nao_tabulada
FROM vw_agendamentos_completo 
WHERE numero_agendamento LIKE 'TESTE-TABULAR-%';

-- Instruções
SELECT '📝 INSTRUÇÕES PARA TESTE:' as titulo;
SELECT '1. Acesse: http://localhost:3004/recepcao/sala-espera' as passo1;
SELECT '2. Procure pelo agendamento TESTE-TABULAR-xxxxx' as passo2;
SELECT '3. O botão "🚨 Tabular Guia" deve estar piscando em vermelho' as passo3;
SELECT '4. Clique no botão para abrir o modal' as passo4;
