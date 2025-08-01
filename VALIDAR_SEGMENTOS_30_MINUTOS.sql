-- ============================================================
-- VALIDAÇÃO E POPULAÇÃO DOS SEGMENTOS DE 30 MINUTOS
-- Execute este script no Supabase para validar e popular dados
-- ============================================================

-- 1. VERIFICAR SE TABELA FOI CRIADA
SELECT 'TABELA agendamentos_segmentos' as verificacao,
       CASE 
           WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos_segmentos')
           THEN '✅ CRIADA'
           ELSE '❌ NÃO EXISTE'
       END as status;

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 'COLUNAS DA TABELA' as verificacao, 
       column_name, 
       data_type, 
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos_segmentos'
ORDER BY ordinal_position;

-- 3. VERIFICAR SE FUNCTIONS FORAM CRIADAS
SELECT 'FUNÇÃO eh_sala_terapia_90min' as verificacao,
       CASE 
           WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'eh_sala_terapia_90min')
           THEN '✅ CRIADA'
           ELSE '❌ NÃO EXISTE'
       END as status
UNION ALL
SELECT 'FUNÇÃO criar_segmentos_30_minutos' as verificacao,
       CASE 
           WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'criar_segmentos_30_minutos')
           THEN '✅ CRIADA'
           ELSE '❌ NÃO EXISTE'
       END as status
UNION ALL
SELECT 'FUNÇÃO popular_segmentos_agendamentos_existentes' as verificacao,
       CASE 
           WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'popular_segmentos_agendamentos_existentes')
           THEN '✅ CRIADA'
           ELSE '❌ NÃO EXISTE'
       END as status;

-- 4. VERIFICAR SE TRIGGERS FORAM CRIADOS
SELECT 'TRIGGER trigger_criar_segmentos_30min' as verificacao,
       CASE 
           WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_criar_segmentos_30min')
           THEN '✅ CRIADO'
           ELSE '❌ NÃO EXISTE'
       END as status
UNION ALL
SELECT 'TRIGGER trigger_atualizar_segmentos_30min' as verificacao,
       CASE 
           WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_atualizar_segmentos_30min')
           THEN '✅ CRIADO'
           ELSE '❌ NÃO EXISTE'
       END as status;

-- 5. VERIFICAR SE VIEW FOI CRIADA
SELECT 'VIEW vw_segmentos_agendamentos' as verificacao,
       CASE 
           WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'vw_segmentos_agendamentos')
           THEN '✅ CRIADA'
           ELSE '❌ NÃO EXISTE'
       END as status;

-- 6. CONTAR AGENDAMENTOS EXISTENTES
SELECT 'AGENDAMENTOS TOTAIS' as tipo, COUNT(*) as quantidade
FROM agendamentos
UNION ALL
SELECT 'SALAS DE TERAPIA (90min)' as tipo, 
       COUNT(*) as quantidade
FROM agendamentos a
INNER JOIN salas s ON a.sala_id = s.id
WHERE eh_sala_terapia_90min(s.nome)
UNION ALL
SELECT 'SEGMENTOS JÁ CRIADOS' as tipo, COUNT(*) as quantidade
FROM agendamentos_segmentos;

-- 7. POPULAR SEGMENTOS DOS AGENDAMENTOS EXISTENTES
SELECT popular_segmentos_agendamentos_existentes() as segmentos_criados;

-- 8. VERIFICAR RESULTADO APÓS POPULAÇÃO
SELECT 'RESULTADO APÓS POPULAÇÃO' as titulo,
       COUNT(*) as total_segmentos
FROM agendamentos_segmentos;

-- 9. AMOSTRA DOS SEGMENTOS CRIADOS
SELECT 'AMOSTRA DE SEGMENTOS' as titulo,
       numero_segmento,
       horario_inicio_segmento,
       horario_fim_segmento,
       sala_nome,
       paciente_nome,
       valor_segmento,
       status_segmento
FROM vw_segmentos_agendamentos 
WHERE data_agendamento >= CURRENT_DATE
ORDER BY data_agendamento, horario_inicio_segmento, numero_segmento
LIMIT 10;

-- 10. RELATÓRIO POR SALA
SELECT 'RELATÓRIO POR SALA' as titulo,
       sala_nome,
       total_segmentos,
       segmentos_realizados,
       segmentos_pendentes,
       valor_total_dia
FROM relatorio_segmentos_dia(CURRENT_DATE);

-- 11. TESTE DE FUNÇÃO DE DETECÇÃO DE SALA
SELECT 'TESTE DETECÇÃO SALAS' as titulo,
       nome as sala_nome,
       eh_sala_terapia_90min(nome) as eh_terapia_90min,
       obter_duracao_sessao(nome) as duracao_minutos
FROM salas 
ORDER BY nome
LIMIT 10;

-- ============================================================
-- VALIDAÇÃO CONCLUÍDA
-- 
-- Resultados esperados:
-- ✅ Todas as estruturas criadas
-- ✅ Segmentos populados para agendamentos existentes
-- ✅ View funcionando corretamente
-- ✅ Relatórios disponíveis
-- ============================================================
