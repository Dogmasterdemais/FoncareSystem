-- Dados de exemplo para testar o sistema de agendamentos
-- Execute no SQL Editor do Supabase após as migrações principais

-- Inserir dados de exemplo para pacientes
INSERT INTO pacientes (nome, cpf, rg, data_nascimento, sexo, telefone, email, convenio_id, numero_carteirinha, 
  cep, logradouro, numero, bairro, cidade, uf, responsavel_nome, responsavel_telefone, responsavel_parentesco, 
  profissao, estado_civil, ativo, unidade_id) VALUES

('Ana Silva Santos', '123.456.789-01', '12.345.678-9', '2015-03-15', 'F', '(11) 99999-1234', 'ana.silva@email.com', 
  (SELECT id FROM convenios WHERE nome = 'Unimed'), '123456789', '01234-567', 'Rua das Flores', '100', 
  'Centro', 'São Paulo', 'SP', 'Maria Silva Santos', '(11) 99999-5678', 'Mãe', 
  'Professora', 'Casada', true, (SELECT id FROM unidades LIMIT 1)),

('Pedro Costa Lima', '234.567.890-12', '23.456.789-0', '2012-07-22', 'M', '(11) 88888-2345', 'pedro.costa@email.com', 
  (SELECT id FROM convenios WHERE nome = 'Bradesco Saúde'), '234567890', '02345-678', 'Av. Paulista', '200', 
  'Bela Vista', 'São Paulo', 'SP', 'João Costa Lima', '(11) 88888-6789', 'Pai', 
  'Engenheiro', 'Casado', true, (SELECT id FROM unidades LIMIT 1)),

('Carla Oliveira Souza', '345.678.901-23', '34.567.890-1', '2018-11-08', 'F', '(11) 77777-3456', 'carla.oliveira@email.com', 
  (SELECT id FROM convenios WHERE nome = 'Particular'), NULL, '03456-789', 'Rua Augusta', '300', 
  'Consolação', 'São Paulo', 'SP', 'Ana Oliveira Souza', '(11) 77777-7890', 'Mãe', 
  'Médica', 'Solteira', true, (SELECT id FROM unidades LIMIT 1)),

('Lucas Ferreira Alves', '456.789.012-34', '45.678.901-2', '2016-01-30', 'M', '(11) 66666-4567', 'lucas.ferreira@email.com', 
  (SELECT id FROM convenios WHERE nome = 'SUS'), '345678901', '04567-890', 'Rua da Consolação', '400', 
  'República', 'São Paulo', 'SP', 'Roberto Ferreira Alves', '(11) 66666-8901', 'Pai', 
  'Advogado', 'Casado', true, (SELECT id FROM unidades LIMIT 1)),

('Beatriz Santos Rocha', '567.890.123-45', '56.789.012-3', '2014-09-12', 'F', '(11) 55555-5678', 'beatriz.santos@email.com', 
  (SELECT id FROM convenios WHERE nome = 'Amil'), '456789012', '05678-901', 'Rua Oscar Freire', '500', 
  'Jardins', 'São Paulo', 'SP', 'Claudia Santos Rocha', '(11) 55555-9012', 'Mãe', 
  'Arquiteta', 'Divorciada', true, (SELECT id FROM unidades LIMIT 1));

-- Inserir dados de exemplo para profissionais
INSERT INTO profissionais (nome, cpf, rg, crf, especialidade_id, telefone, email, 
  tipo_contrato, valor_hora, carga_horaria_semanal, data_admissao, sala_id, ativo) VALUES

('Dr. João Santos Silva', '111.222.333-44', '11.222.333-4', 'CRFa 12345', 
  (SELECT id FROM especialidades WHERE nome = 'Fonoaudiologia'), '(11) 91111-1111', 'joao.santos@foncare.com', 
  'CLT', 80.00, 40, '2023-01-15', 
  (SELECT id FROM salas WHERE nome LIKE '%Fonoaudiologia%' LIMIT 1), true),

('Dra. Maria Oliveira Costa', '222.333.444-55', '22.333.444-5', 'CRP 23456', 
  (SELECT id FROM especialidades WHERE nome = 'Psicologia'), '(11) 92222-2222', 'maria.oliveira@foncare.com', 
  'CLT', 90.00, 40, '2023-02-01', 
  (SELECT id FROM salas WHERE nome LIKE '%Psicologia%' LIMIT 1), true),

('Dr. Paulo Lima Ferreira', '333.444.555-66', '33.444.555-6', 'CREFITO 34567', 
  (SELECT id FROM especialidades WHERE nome = 'Fisioterapia'), '(11) 93333-3333', 'paulo.lima@foncare.com', 
  'PJ', 100.00, 30, '2023-03-10', 
  (SELECT id FROM salas WHERE nome LIKE '%Fisioterapia%' LIMIT 1), true),

('Dra. Ana Costa Ribeiro', '444.555.666-77', '44.555.666-7', 'CREFITO 45678', 
  (SELECT id FROM especialidades WHERE nome = 'Terapia Ocupacional'), '(11) 94444-4444', 'ana.costa@foncare.com', 
  'CLT', 85.00, 40, '2023-04-05', 
  (SELECT id FROM salas WHERE nome LIKE '%Terapia Ocupacional%' LIMIT 1), true),

('Dr. Carlos Souza Alves', '555.666.777-88', '55.666.777-8', 'CRP 56789', 
  (SELECT id FROM especialidades WHERE nome = 'Neuropsicologia'), '(11) 95555-5555', 'carlos.souza@foncare.com', 
  'PJ', 120.00, 20, '2023-05-20', 
  (SELECT id FROM salas WHERE nome LIKE '%Neuropsicologia%' LIMIT 1), true);

-- Verificar se os dados foram inseridos
SELECT 'Pacientes inseridos: ' || COUNT(*) as resultado FROM pacientes WHERE ativo = true;
SELECT 'Profissionais inseridos: ' || COUNT(*) as resultado FROM profissionais WHERE ativo = true;
