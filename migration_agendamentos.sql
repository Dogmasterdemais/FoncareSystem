-- Adicionar campos necessários para os dados da guia na tabela agendamentos
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS data_chegada TIMESTAMP;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS codigo_autorizacao VARCHAR(50);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS numero_guia VARCHAR(50);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS data_autorizacao DATE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS validade_autorizacao DATE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS convenio_id UUID REFERENCES convenios(id);

-- Criar view completa para agendamentos
CREATE OR REPLACE VIEW vw_agendamentos_completo AS
SELECT 
    a.id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.data_chegada,
    a.codigo_autorizacao,
    a.numero_guia,
    a.data_autorizacao,
    a.validade_autorizacao,
    a.observacoes,
    a.unidade_id,
    p.nome AS paciente_nome,
    p.telefone AS paciente_telefone,
    e.nome AS especialidade_nome,
    e.cor AS especialidade_cor,
    s.nome AS sala_nome,
    s.cor AS sala_cor,
    prof.nome AS profissional_nome,
    c.nome AS convenio_nome,
    u.nome AS unidade_nome
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN profissionais prof ON a.profissional_id = prof.id
LEFT JOIN convenios c ON a.convenio_id = c.id
LEFT JOIN unidades u ON a.unidade_id = u.id;

-- Inserir dados de teste para demonstração
-- Primeiro verificar se existem dados básicos necessários

-- Inserir uma unidade de teste se não existir
INSERT INTO unidades (id, nome, endereco, telefone) 
SELECT 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Foncare Centro', 'Rua Principal, 123', '(11) 1234-5678'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nome = 'Foncare Centro');

-- Inserir especialidade de teste
INSERT INTO especialidades (id, nome, cor) 
SELECT 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Fisioterapia', '#22c55e'
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nome = 'Fisioterapia');

-- Inserir convênio de teste
INSERT INTO convenios (id, nome, codigo) 
SELECT 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Unimed', 'UNI001'
WHERE NOT EXISTS (SELECT 1 FROM convenios WHERE nome = 'Unimed');

-- Inserir sala de teste
INSERT INTO salas (id, nome, cor, unidade_id, especialidade_id) 
SELECT 
    'f47ac10b-58cc-4372-a567-0e02b2c3d482', 
    'Sala 1', 
    '#3b82f6', 
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480'
WHERE NOT EXISTS (SELECT 1 FROM salas WHERE nome = 'Sala 1');

-- Inserir paciente de teste
INSERT INTO pacientes (id, nome, cpf, telefone, email) 
SELECT 
    'f47ac10b-58cc-4372-a567-0e02b2c3d483', 
    'João Silva', 
    '123.456.789-00', 
    '(11) 99999-9999',
    'joao@email.com'
WHERE NOT EXISTS (SELECT 1 FROM pacientes WHERE cpf = '123.456.789-00');

-- Inserir profissional de teste
INSERT INTO profissionais (id, nome, especialidade, telefone) 
SELECT 
    'f47ac10b-58cc-4372-a567-0e02b2c3d484', 
    'Dr. Maria Santos', 
    'Fisioterapeuta', 
    '(11) 88888-8888'
WHERE NOT EXISTS (SELECT 1 FROM profissionais WHERE nome = 'Dr. Maria Santos');

-- Inserir agendamentos de teste para hoje
INSERT INTO agendamentos (
    id,
    paciente_id,
    profissional_id,
    especialidade_id,
    sala_id,
    unidade_id,
    convenio_id,
    data_agendamento,
    horario_inicio,
    horario_fim,
    status
) 
SELECT 
    'f47ac10b-58cc-4372-a567-0e02b2c3d485',
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'f47ac10b-58cc-4372-a567-0e02b2c3d484',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    CURRENT_DATE,
    '09:00:00',
    '10:00:00',
    'agendado'
WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE paciente_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d483'
    AND data_agendamento = CURRENT_DATE
);

-- Inserir mais alguns agendamentos para diferentes horários
INSERT INTO agendamentos (
    paciente_id,
    profissional_id,
    especialidade_id,
    sala_id,
    unidade_id,
    convenio_id,
    data_agendamento,
    horario_inicio,
    horario_fim,
    status
) 
SELECT 
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'f47ac10b-58cc-4372-a567-0e02b2c3d484',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    CURRENT_DATE,
    '10:00:00',
    '11:00:00',
    'agendado'
WHERE NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE horario_inicio = '10:00:00'
    AND data_agendamento = CURRENT_DATE
);
