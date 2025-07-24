-- Script para inserir dados de exemplo nos agendamentos
-- Execute no SQL Editor do Supabase

-- Primeiro, vamos verificar se temos unidades, especialidades e profissionais
-- Inserir algumas especialidades se não existirem
INSERT INTO especialidades (nome, cor, codigo, descricao, duracao_padrao_minutos, ativo) VALUES 
('Fonoaudiologia', '#0052CC', 'FONO', 'Sala Azul - Fonoaudiologia', 60, true),
('Terapia Ocupacional', '#00E6F6', 'TO', 'Sala Azul Claro - Terapia Ocupacional', 60, true),
('Psicologia', '#38712F', 'PSI', 'Sala Verde - Psicologia', 60, true),
('Fisioterapia', '#C47B9C', 'FISIO', 'Sala Lilás - Fisioterapia', 60, true)
ON CONFLICT (nome) DO NOTHING;

-- Inserir algumas salas vinculadas às especialidades
INSERT INTO salas (nome, cor, tipo, especialidade_id, unidade_id)
SELECT 
  'Sala ' || e.nome,
  e.cor,
  'consultorio',
  e.id,
  u.id
FROM especialidades e
CROSS JOIN unidades u
WHERE u.ativo = true AND e.ativo = true
ON CONFLICT DO NOTHING;

-- Inserir alguns profissionais
INSERT INTO profissionais (nome, especialidade_id, telefone, email, ativo)
SELECT 
  CASE e.nome
    WHEN 'Fonoaudiologia' THEN 'Dra. Ana Silva'
    WHEN 'Terapia Ocupacional' THEN 'Dr. João Santos'
    WHEN 'Psicologia' THEN 'Dra. Maria Oliveira'
    WHEN 'Fisioterapia' THEN 'Dr. Paulo Lima'
    ELSE 'Dr. Profissional ' || e.nome
  END,
  e.id,
  '(11) 99999-0000',
  'profissional@foncare.com',
  true
FROM especialidades e
WHERE e.ativo = true
ON CONFLICT DO NOTHING;

-- Inserir alguns pacientes de exemplo
INSERT INTO pacientes (nome, telefone, email, convenio_id, unidade_id, ativo)
SELECT 
  CASE ROW_NUMBER() OVER()
    WHEN 1 THEN 'Ana Costa'
    WHEN 2 THEN 'Pedro Santos'
    WHEN 3 THEN 'Maria Silva'
    WHEN 4 THEN 'João Oliveira'
    WHEN 5 THEN 'Carolina Lima'
    ELSE 'Paciente ' || ROW_NUMBER() OVER()
  END,
  '(11) 98888-000' || ROW_NUMBER() OVER(),
  'paciente' || ROW_NUMBER() OVER() || '@email.com',
  c.id,
  u.id,
  true
FROM convenios c
CROSS JOIN unidades u
WHERE c.ativo = true AND u.ativo = true
LIMIT 10;

-- Inserir agendamentos de exemplo para hoje e próximos dias
INSERT INTO agendamentos (
  paciente_id, 
  convenio_id, 
  data_agendamento, 
  horario_inicio, 
  horario_fim,
  profissional_id,
  unidade_id,
  sala_id,
  status,
  modalidade,
  duracao_minutos
)
SELECT 
  p.id,
  p.convenio_id,
  CURRENT_DATE + (ROW_NUMBER() OVER() % 7) * INTERVAL '1 day',
  ('08:00'::time + (ROW_NUMBER() OVER() % 10) * INTERVAL '1 hour')::time,
  ('09:00'::time + (ROW_NUMBER() OVER() % 10) * INTERVAL '1 hour')::time,
  pr.id,
  p.unidade_id,
  s.id,
  CASE (ROW_NUMBER() OVER() % 4)
    WHEN 0 THEN 'agendado'
    WHEN 1 THEN 'compareceu'
    WHEN 2 THEN 'faltou'
    ELSE 'agendado'
  END,
  e.nome,
  60
FROM pacientes p
JOIN convenios c ON p.convenio_id = c.id
JOIN unidades u ON p.unidade_id = u.id
JOIN profissionais pr ON pr.ativo = true
JOIN salas s ON s.unidade_id = u.id
JOIN especialidades e ON s.especialidade_id = e.id
WHERE p.ativo = true
LIMIT 20;
