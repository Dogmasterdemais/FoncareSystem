-- Criar tabela para controlar status de faturamento das guias
CREATE TABLE IF NOT EXISTS status_faturamento (
    id SERIAL PRIMARY KEY,
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'revisada', 'faturada')),
    data_revisao TIMESTAMP NULL,
    usuario_revisao VARCHAR(255) NULL,
    data_faturamento TIMESTAMP NULL,
    usuario_faturamento VARCHAR(255) NULL,
    observacoes TEXT NULL,
    lote_faturamento VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_status_faturamento_agendamento_id ON status_faturamento(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_status_faturamento_status ON status_faturamento(status);
CREATE INDEX IF NOT EXISTS idx_status_faturamento_data_faturamento ON status_faturamento(data_faturamento);

-- Comentários nas colunas
COMMENT ON COLUMN status_faturamento.agendamento_id IS 'ID do agendamento/guia';
COMMENT ON COLUMN status_faturamento.status IS 'Status atual: pendente, revisada, faturada';
COMMENT ON COLUMN status_faturamento.data_revisao IS 'Data quando foi marcada como revisada';
COMMENT ON COLUMN status_faturamento.usuario_revisao IS 'Usuário que marcou como revisada';
COMMENT ON COLUMN status_faturamento.data_faturamento IS 'Data quando foi faturada';
COMMENT ON COLUMN status_faturamento.usuario_faturamento IS 'Usuário que faturou';
COMMENT ON COLUMN status_faturamento.lote_faturamento IS 'Identificador do lote de faturamento';

-- Recriar a view para incluir dados de faturamento
DROP VIEW IF EXISTS vw_faturamento_completo;

CREATE VIEW vw_faturamento_completo AS
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
  AND a.numero_guia IS NOT NULL;

-- Inserir registros iniciais para guias já tabuladas
INSERT INTO status_faturamento (agendamento_id, status)
SELECT id, 'pendente'
FROM agendamentos 
WHERE valor_procedimento IS NOT NULL 
  AND numero_guia IS NOT NULL
  AND id NOT IN (SELECT agendamento_id FROM status_faturamento);
