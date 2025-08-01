-- Migration: Adicionar campo valor_procedimento na tabela agendamentos
-- Data: 2025-07-22
-- Objetivo: Armazenar o valor do procedimento selecionado na tabulação da guia

-- 1. Adicionar coluna valor_procedimento na tabela agendamentos
ALTER TABLE agendamentos 
ADD COLUMN valor_procedimento DECIMAL(10,2);

-- 2. Adicionar comentário na coluna
COMMENT ON COLUMN agendamentos.valor_procedimento IS 'Valor do procedimento selecionado na tabulação da guia (vem da tabela procedimentos_tuss.valor)';

-- 3. Recriar a view vw_agendamentos_completo para incluir o novo campo
DROP VIEW IF EXISTS vw_agendamentos_completo;

CREATE VIEW vw_agendamentos_completo AS
SELECT 
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
    a.valor_procedimento,  -- NOVO CAMPO
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    p.nome as paciente_nome,
    p.telefone as paciente_telefone,
    u.nome as unidade_nome,
    c.nome as convenio_nome,
    e.nome as especialidade_nome,
    prof.nome as profissional_nome
FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN unidades u ON a.unidade_id = u.id
LEFT JOIN convenios c ON a.convenio_id = c.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN profissionais prof ON a.profissional_id = prof.id;

-- 4. Adicionar comentário na view
COMMENT ON VIEW vw_agendamentos_completo IS 'View completa dos agendamentos com informações de paciente, sala, unidade, convênio, especialidade, profissional e valor do procedimento';
