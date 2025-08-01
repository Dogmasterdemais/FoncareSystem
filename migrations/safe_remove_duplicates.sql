-- Script SEGURO para remover duplicatas - COM BACKUP
-- Execute passo a passo para maior segurança

-- PASSO 1: Criar backup da tabela
CREATE TABLE status_faturamento_backup AS 
SELECT * FROM status_faturamento;

-- PASSO 2: Verificar quantas duplicatas existem
SELECT 
    'Total de registros atuais:' as info,
    COUNT(*) as quantidade
FROM status_faturamento
UNION ALL
SELECT 
    'Agendamentos únicos:' as info,
    COUNT(DISTINCT agendamento_id) as quantidade
FROM status_faturamento
UNION ALL
SELECT 
    'Registros duplicados:' as info,
    COUNT(*) - COUNT(DISTINCT agendamento_id) as quantidade
FROM status_faturamento;

-- PASSO 3: Ver detalhes das duplicatas
SELECT 
    agendamento_id,
    id,
    status,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY agendamento_id ORDER BY id DESC) as ordem
FROM status_faturamento 
WHERE agendamento_id IN (
    SELECT agendamento_id 
    FROM status_faturamento 
    GROUP BY agendamento_id 
    HAVING COUNT(*) > 1
)
ORDER BY agendamento_id, id;

-- PASSO 4: Deletar duplicatas (mantém o registro mais recente)
WITH duplicatas_para_deletar AS (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (PARTITION BY agendamento_id ORDER BY id DESC) as rn
        FROM status_faturamento
    ) t
    WHERE rn > 1
)
DELETE FROM status_faturamento 
WHERE id IN (SELECT id FROM duplicatas_para_deletar);

-- PASSO 5: Adicionar constraint para evitar futuras duplicatas
ALTER TABLE status_faturamento 
ADD CONSTRAINT uk_status_faturamento_agendamento_id 
UNIQUE (agendamento_id);

-- PASSO 6: Verificar resultado
SELECT 
    'Registros após limpeza:' as info,
    COUNT(*) as quantidade
FROM status_faturamento
UNION ALL
SELECT 
    'Agendamentos únicos:' as info,
    COUNT(DISTINCT agendamento_id) as quantidade
FROM status_faturamento;

-- PASSO 7: Se tudo estiver OK, pode remover o backup
-- DROP TABLE status_faturamento_backup;
