-- Adicionar mais profissionais para teste
INSERT INTO profissionais (nome, especialidade_id, unidade_id, email, telefone, crp_crm, ativo) VALUES
-- Unidade NAC (id=1) - Mais profissionais
('Dra. Mariana Silva', 1, 1, 'mariana.silva@foncare.com', '(11) 98765-4321', 'CRP 06/123456', true), -- Psicologia
('Dr. Ricardo Oliveira', 2, 1, 'ricardo.oliveira@foncare.com', '(11) 98765-4322', 'CRM 123456', true), -- Fonoaudiologia
('Dra. Patricia Costa', 3, 1, 'patricia.costa@foncare.com', '(11) 98765-4323', 'CREFITO 12345', true), -- Fisioterapia
('Dra. Ana Paula Rocha', 4, 1, 'ana.rocha@foncare.com', '(11) 98765-4324', 'CRP 06/789012', true), -- Neuropsicologia
('Dr. Fernando Alves', 5, 1, 'fernando.alves@foncare.com', '(11) 98765-4325', 'CRM 789012', true), -- Terapia Ocupacional
('Dra. Juliana Santos', 6, 1, 'juliana.santos@foncare.com', '(11) 98765-4326', 'CRP 06/345678', true), -- Psicopedagogia
('Dr. Lucas Pereira', 7, 1, 'lucas.pereira@foncare.com', '(11) 98765-4327', 'CRM 345678', true), -- Anamnese
('Dra. Carla Mendes', 1, 1, 'carla.mendes@foncare.com', '(11) 98765-4328', 'CRP 06/901234', true), -- Psicologia
('Dr. Gabriel Lima', 2, 1, 'gabriel.lima@foncare.com', '(11) 98765-4329', 'CRM 901234', true), -- Fonoaudiologia
('Dra. Renata Barbosa', 3, 1, 'renata.barbosa@foncare.com', '(11) 98765-4330', 'CREFITO 56789', true), -- Fisioterapia

-- Unidade Clínica Central (id=2) - Adicionar profissionais
('Dr. Eduardo Campos', 1, 2, 'eduardo.campos@foncare.com', '(11) 97654-3210', 'CRP 06/567890', true), -- Psicologia
('Dra. Camila Fernandes', 2, 2, 'camila.fernandes@foncare.com', '(11) 97654-3211', 'CRM 567890', true), -- Fonoaudiologia
('Dr. Rafael Martins', 3, 2, 'rafael.martins@foncare.com', '(11) 97654-3212', 'CREFITO 90123', true), -- Fisioterapia
('Dra. Sabrina Reis', 4, 2, 'sabrina.reis@foncare.com', '(11) 97654-3213', 'CRP 06/234567', true), -- Neuropsicologia
('Dr. Thiago Nunes', 5, 2, 'thiago.nunes@foncare.com', '(11) 97654-3214', 'CRM 234567', true), -- Terapia Ocupacional
('Dra. Vanessa Torres', 6, 2, 'vanessa.torres@foncare.com', '(11) 97654-3215', 'CRP 06/678901', true), -- Psicopedagogia
('Dr. Daniel Sousa', 7, 2, 'daniel.sousa@foncare.com', '(11) 97654-3216', 'CRM 678901', true), -- Anamnese
('Dra. Fernanda Castro', 1, 2, 'fernanda.castro@foncare.com', '(11) 97654-3217', 'CRP 06/123789', true), -- Psicologia
('Dr. Henrique Dias', 2, 2, 'henrique.dias@foncare.com', '(11) 97654-3218', 'CRM 123789', true), -- Fonoaudiologia
('Dra. Isabella Gomes', 3, 2, 'isabella.gomes@foncare.com', '(11) 97654-3219', 'CREFITO 45678', true), -- Fisioterapia

-- Unidade Especializada (id=3) - Adicionar profissionais
('Dr. Joaquim Freitas', 1, 3, 'joaquim.freitas@foncare.com', '(11) 96543-2109', 'CRP 06/456789', true), -- Psicologia
('Dra. Larissa Moura', 2, 3, 'larissa.moura@foncare.com', '(11) 96543-2108', 'CRM 456789', true), -- Fonoaudiologia
('Dr. Mateus Cardoso', 3, 3, 'mateus.cardoso@foncare.com', '(11) 96543-2107', 'CREFITO 78901', true), -- Fisioterapia
('Dra. Nicole Ribeiro', 4, 3, 'nicole.ribeiro@foncare.com', '(11) 96543-2106', 'CRP 06/890123', true), -- Neuropsicologia
('Dr. Otavio Machado', 5, 3, 'otavio.machado@foncare.com', '(11) 96543-2105', 'CRM 890123', true), -- Terapia Ocupacional
('Dra. Priscila Araujo', 6, 3, 'priscila.araujo@foncare.com', '(11) 96543-2104', 'CRP 06/012345', true), -- Psicopedagogia
('Dr. Rodrigo Vieira', 7, 3, 'rodrigo.vieira@foncare.com', '(11) 96543-2103', 'CRM 012345', true), -- Anamnese
('Dra. Simone Azevedo', 1, 3, 'simone.azevedo@foncare.com', '(11) 96543-2102', 'CRP 06/234890', true), -- Psicologia
('Dr. Tiago Monteiro', 2, 3, 'tiago.monteiro@foncare.com', '(11) 96543-2101', 'CRM 234890', true), -- Fonoaudiologia
('Dra. Ursula Barros', 3, 3, 'ursula.barros@foncare.com', '(11) 96543-2100', 'CREFITO 67890', true); -- Fisioterapia
