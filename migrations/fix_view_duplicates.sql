-- Script para remover duplicatas COMPLETAS da view vw_faturamento_completo
-- O mesmo agendamento não deve aparecer múltiplas vezes

-- 1. Primeiro, vamos ver o que está causando as duplicatas
SELECT 
    'Diagnóstico das duplicatas:' as info;

-- Verificar quantos registros únicos vs total na view
SELECT 
    COUNT(*) as total_registros_view,
    COUNT(DISTINCT id) as registros_unicos_por_id
FROM vw_faturamento_completo;

-- Ver duplicatas específicas
SELECT 
    id,
    paciente_nome,
    numero_guia,
    convenio_nome,
    COUNT(*) as aparicoes
FROM vw_faturamento_completo
GROUP BY id, paciente_nome, numero_guia, convenio_nome
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 2. Recriar a view com DISTINCT para eliminar duplicatas
DROP VIEW IF EXISTS vw_faturamento_completo;

CREATE VIEW vw_faturamento_completo AS
SELECT DISTINCT ON (a.id)
    a.id,
    a.paciente_id,
    a.profissional_id,
    a.sala_id,
    a.unidade_id,
    a.convenio_id,
    a.especialidade_id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.observacoes,
    a.created_at,
    a.updated_at,
    a.numero_agendamento,
    a.data_chegada,
    a.codigo_autorizacao,
    a.numero_guia,
    a.data_autorizacao,
    a.validade_autorizacao,
    a.valor_procedimento,
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    p.nome as paciente_nome,
    p.telefone as paciente_telefone,
    u.nome as unidade_nome,
    c.nome as convenio_nome,
    e.nome as especialidade_nome,
    prof.nome as profissional_nome,
    procedimentos_tuss.codigo_tuss as codigo_tuss,
    procedimentos_tuss.dados_lista_suspensa as descricao_procedimento,
    sf.status as status_faturamento,
    sf.data_revisao,
    sf.usuario_revisao,
    sf.data_faturamento,
    sf.usuario_faturamento,
    sf.observacoes as observacoes_faturamento,
    sf.lote_faturamento
FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN unidades u ON a.unidade_id = u.id
LEFT JOIN convenios c ON a.convenio_id = c.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN profissionais prof ON a.profissional_id = prof.id
LEFT JOIN procedimentos_tuss ON a.codigo_autorizacao = procedimentos_tuss.codigo_tuss
LEFT JOIN status_faturamento sf ON a.id = sf.agendamento_id
WHERE a.valor_procedimento IS NOT NULL 
  AND a.numero_guia IS NOT NULL
ORDER BY a.id, sf.id DESC; -- Prioriza o status_faturamento mais recente se houver múltiplos

-- 3. Limpar tabela status_faturamento de duplicatas também
DELETE FROM status_faturamento 
WHERE id NOT IN (
    SELECT DISTINCT ON (agendamento_id) id
    FROM status_faturamento 
    ORDER BY agendamento_id, id DESC
);

-- 4. Adicionar constraint única para evitar futuras duplicatas
ALTER TABLE status_faturamento 
DROP CONSTRAINT IF EXISTS uk_status_faturamento_agendamento_id;

ALTER TABLE status_faturamento 
ADD CONSTRAINT uk_status_faturamento_agendamento_id 
UNIQUE (agendamento_id);

-- 5. Verificar resultado final
SELECT 
    'Resultado após limpeza:' as info;

SELECT 
    COUNT(*) as total_registros_view,
    COUNT(DISTINCT id) as registros_unicos_por_id,
    COUNT(DISTINCT numero_guia) as guias_unicas
FROM vw_faturamento_completo;

-- Ver se ainda há duplicatas
SELECT 
    id,
    paciente_nome,
    numero_guia,
    COUNT(*) as aparicoes
FROM vw_faturamento_completo
GROUP BY id, paciente_nome, numero_guia
HAVING COUNT(*) > 1;
