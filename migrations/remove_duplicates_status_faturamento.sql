-- Script para remover duplicatas da tabela status_faturamento
-- Este script mantém apenas o registro mais recente para cada agendamento_id

-- 1. Identificar duplicatas (apenas para visualizar)
SELECT 
    agendamento_id, 
    COUNT(*) as total_duplicatas
FROM status_faturamento 
GROUP BY agendamento_id 
HAVING COUNT(*) > 1
ORDER BY total_duplicatas DESC;

-- 2. Remover duplicatas, mantendo apenas o registro mais recente (com maior ID)
DELETE FROM status_faturamento 
WHERE id NOT IN (
    SELECT DISTINCT ON (agendamento_id) id
    FROM status_faturamento 
    ORDER BY agendamento_id, id DESC
);

-- 3. Verificar se ainda existem duplicatas
SELECT 
    agendamento_id, 
    COUNT(*) as total_duplicatas
FROM status_faturamento 
GROUP BY agendamento_id 
HAVING COUNT(*) > 1;

-- 4. Criar constraint única para evitar futuras duplicatas
ALTER TABLE status_faturamento 
ADD CONSTRAINT uk_status_faturamento_agendamento_id 
UNIQUE (agendamento_id);

-- 5. Verificar resultado final
SELECT COUNT(*) as total_registros FROM status_faturamento;
SELECT 
    status,
    COUNT(*) as quantidade
FROM status_faturamento 
GROUP BY status
ORDER BY status;
