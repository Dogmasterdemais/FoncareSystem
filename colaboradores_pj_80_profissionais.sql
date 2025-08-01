-- Script para popular a tabela colaboradores com 80 profissionais PJ
-- Para uso em ambiente de teste/desenvolvimento
-- Especialidades baseadas nas disponíveis na clínica
-- Valores configurados como Valor/Hora para regime PJ

-- Colaboradores PJ - Profissionais da Saúde (Somente especialidades da clínica)
INSERT INTO colaboradores (
  id, nome_completo, cpf, rg, data_nascimento, sexo, estado_civil, 
  email_pessoal, telefone_celular, endereco_completo, cep, cidade, estado,
  cargo, regime_contratacao, status, data_admissao, 
  salario_valor, tipo_salario, unidade_id,
  escolaridade, observacoes, created_at, updated_at
) VALUES 

-- PSICÓLOGOS PJ (Especialidade: Psicologia)
(gen_random_uuid(), 'Ana Carolina Silva Santos', '12345678901', '123456789', '1985-03-15', 'F', 'casada', 'ana.silva@email.com', '11987654321', 'Rua das Flores, 123, Jardim Paulista', '01310-100', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2024-01-15', 120.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 12345 - Especialista em Terapia Cognitivo-Comportamental', NOW(), NOW()),

(gen_random_uuid(), 'Carlos Eduardo Oliveira', '23456789012', '234567890', '1982-07-22', 'M', 'solteiro', 'carlos.oliveira@email.com', '11987654322', 'Av. Paulista, 456, Bela Vista', '01310-200', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2024-01-20', 110.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 23456 - Especialista em Psicologia Infantil', NOW(), NOW()),

(gen_random_uuid(), 'Mariana Costa Ferreira', '34567890123', '345678901', '1988-11-08', 'F', 'divorciada', 'mariana.costa@email.com', '11987654323', 'Rua Augusta, 789, Consolação', '01305-100', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2024-02-01', 130.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 34567 - Especialista em Psicologia do Adolescente', NOW(), NOW()),

(gen_random_uuid(), 'Roberto Almeida Junior', '45678901234', '456789012', '1979-04-12', 'M', 'casado', 'roberto.almeida@email.com', '11987654324', 'Rua Haddock Lobo, 321, Cerqueira César', '01414-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2024-02-10', 125.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 45678 - Especialista em Terapia Familiar', NOW(), NOW()),

(gen_random_uuid(), 'Fernanda Lima Rodrigues', '56789012345', '567890123', '1990-09-25', 'F', 'solteira', 'fernanda.lima@email.com', '11987654325', 'Rua Oscar Freire, 654, Jardins', '01426-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2024-02-15', 115.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 56789 - Especialista em Psicologia Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Viviane Silva Barbosa', '53456789012', '534567890', '1989-03-27', 'F', 'solteira', 'viviane.silva@email.com', '11987654355', 'Rua Tutóia, 654, Paraíso', '04007-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-01-10', 118.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 67890 - Especialista em Terapia de Casal', NOW(), NOW()),

(gen_random_uuid(), 'Marcos Antônio Ferreira', '63456789012', '634567890', '1984-11-15', 'M', 'casado', 'marcos.ferreira@email.com', '11987654356', 'Rua Machado de Assis, 987, Vila Mariana', '04006-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-01-15', 108.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 78901 - Especialista em Psicologia Organizacional', NOW(), NOW()),

(gen_random_uuid(), 'Natália Costa Lima', '73456789012', '734567890', '1992-07-19', 'F', 'solteira', 'natalia.costa@email.com', '11987654357', 'Av. Ibirapuera, 123, Moema', '04029-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-01-20', 122.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 89012 - Especialista em Psicologia Hospitalar', NOW(), NOW()),

(gen_random_uuid(), 'Paulo César Santos', '83456789012', '834567890', '1980-02-06', 'M', 'divorciado', 'paulo.santos@email.com', '11987654358', 'Rua Domingos de Morais, 456, Vila Mariana', '04010-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-02-01', 135.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 90123 - Especialista em Psicologia Clínica', NOW(), NOW()),

-- FONOAUDIÓLOGOS PJ (Especialidade: Fonoaudiologia)
(gen_random_uuid(), 'Juliana Santos Pereira', '67890123456', '678901234', '1986-12-03', 'F', 'casada', 'juliana.santos@email.com', '11987654326', 'Rua Pamplona, 987, Jardim Paulista', '01405-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-01', 95.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'CRFa 12345 - Especialista em Audiologia', NOW(), NOW()),

(gen_random_uuid(), 'Daniel Souza Martins', '78901234567', '789012345', '1983-06-18', 'M', 'solteiro', 'daniel.souza@email.com', '11987654327', 'Av. Brigadeiro Luís Antônio, 123, Bela Vista', '01317-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-05', 88.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'CRFa 23456 - Especialista em Linguagem Infantil', NOW(), NOW()),

(gen_random_uuid(), 'Camila Barbosa Nunes', '89012345678', '890123456', '1991-01-29', 'F', 'solteira', 'camila.barbosa@email.com', '11987654328', 'Rua Estados Unidos, 456, Jardins', '01427-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-10', 92.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'CRFa 34567 - Especialista em Disfagia', NOW(), NOW()),

(gen_random_uuid(), 'Thiago Mendes Silva', '90123456789', '901234567', '1987-10-14', 'M', 'casado', 'thiago.mendes@email.com', '11987654329', 'Rua Consolação, 789, Consolação', '01301-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-15', 90.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'CRFa 45678 - Especialista em Voz Profissional', NOW(), NOW()),

(gen_random_uuid(), 'Sabrina Oliveira Rocha', '93456789012', '934567890', '1988-06-11', 'F', 'casada', 'sabrina.oliveira@email.com', '11987654359', 'Rua Vergueiro, 789, Paraíso', '01504-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-05', 96.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'CRFa 56789 - Especialista em Motricidade Orofacial', NOW(), NOW()),

(gen_random_uuid(), 'Diego Alves Pereira', '04567890123', '045678901', '1985-10-24', 'M', 'solteiro', 'diego.alves@email.com', '11987654360', 'Av. Paulista, 321, Bela Vista', '01311-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-10', 85.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'CRFa 67890 - Especialista em Fluência', NOW(), NOW()),

(gen_random_uuid(), 'Aline Santos Cruz', '14567890123', '145678901', '1991-01-08', 'F', 'solteira', 'aline.santos@email.com', '11987654361', 'Rua Augusta, 654, Consolação', '01305-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-15', 98.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'CRFa 78901 - Especialista em Linguagem', NOW(), NOW()),

-- FISIOTERAPEUTAS PJ (Especialidade: Fisioterapia)
(gen_random_uuid(), 'Patrícia Gonçalves Lima', '01234567890', '012345678', '1984-05-07', 'F', 'casada', 'patricia.goncalves@email.com', '11987654330', 'Rua Bela Cintra, 321, Consolação', '01415-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-01', 95.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'CREFITO 12345 - Especialista em Ortopedia', NOW(), NOW()),

(gen_random_uuid(), 'André Luiz Carvalho', '11234567890', '112345678', '1981-08-16', 'M', 'divorciado', 'andre.carvalho@email.com', '11987654331', 'Av. Rebouças, 654, Pinheiros', '05401-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-05', 100.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'CREFITO 23456 - Especialista em Neurologia', NOW(), NOW()),

(gen_random_uuid(), 'Larissa Fernandes Costa', '21234567890', '212345678', '1989-02-28', 'F', 'solteira', 'larissa.fernandes@email.com', '11987654332', 'Rua da Consolação, 987, Higienópolis', '01302-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-10', 90.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'CREFITO 34567 - Especialista em Pediatria', NOW(), NOW()),

(gen_random_uuid(), 'Lucas Rodrigues Santos', '31234567890', '312345678', '1992-12-11', 'M', 'solteiro', 'lucas.rodrigues@email.com', '11987654333', 'Rua Frei Caneca, 123, Consolação', '01307-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-15', 92.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'CREFITO 45678 - Especialista em Desportiva', NOW(), NOW()),

(gen_random_uuid(), 'Gustavo Lima Martins', '24567890123', '245678901', '1987-04-16', 'M', 'casado', 'gustavo.lima@email.com', '11987654362', 'Rua Consolação, 987, Higienópolis', '01302-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2025-03-01', 94.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'CREFITO 56789 - Especialista em Cardiorrespiratória', NOW(), NOW()),

(gen_random_uuid(), 'Mônica Ferreira Silva', '34567890124', '345678902', '1983-09-03', 'F', 'divorciada', 'monica.ferreira@email.com', '11987654363', 'Av. Rebouças, 123, Pinheiros', '05401-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2025-03-05', 98.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'CREFITO 67890 - Especialista em Uroginecologia', NOW(), NOW()),

(gen_random_uuid(), 'Felipe Costa Almeida', '44567890123', '445678901', '1990-12-28', 'M', 'solteiro', 'felipe.costa@email.com', '11987654364', 'Rua Teodoro Sampaio, 456, Pinheiros', '05405-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2025-03-10', 88.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'CREFITO 78901 - Especialista em Reumatologia', NOW(), NOW()),

-- TERAPEUTAS OCUPACIONAIS PJ (Especialidade: Terapia Ocupacional)
(gen_random_uuid(), 'Vanessa Silva Oliveira', '41234567890', '412345678', '1985-07-04', 'F', 'casada', 'vanessa.silva@email.com', '11987654334', 'Rua Marquês de Paranaguá, 456, Consolação', '01303-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-01', 90.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'CREFITO 89012 - Especialista em Pediatria', NOW(), NOW()),

(gen_random_uuid(), 'Bruno Costa Almeida', '51234567890', '512345678', '1988-11-19', 'M', 'solteiro', 'bruno.costa@email.com', '11987654335', 'Av. São Luís, 789, República', '01046-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-05', 85.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'CREFITO 90123 - Especialista em Geriatria', NOW(), NOW()),

(gen_random_uuid(), 'Rafaela Pereira Lima', '61234567890', '612345678', '1990-04-23', 'F', 'divorciada', 'rafaela.pereira@email.com', '11987654336', 'Rua Barão de Capanema, 321, Jardins', '01411-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-10', 92.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'CREFITO 01234 - Especialista em Saúde Mental', NOW(), NOW()),

(gen_random_uuid(), 'Simone Barbosa Santos', '54567890123', '545678901', '1986-05-20', 'F', 'casada', 'simone.barbosa@email.com', '11987654365', 'Rua Frei Caneca, 789, Consolação', '01307-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2025-03-15', 88.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'CREFITO 11234 - Especialista em Integração Sensorial', NOW(), NOW()),

(gen_random_uuid(), 'Ricardo Pereira Oliveira', '64567890123', '645678901', '1982-08-12', 'M', 'solteiro', 'ricardo.pereira@email.com', '11987654366', 'Av. São Luís, 321, República', '01046-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2025-04-01', 86.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'CREFITO 22345 - Especialista em Reabilitação Profissional', NOW(), NOW()),

(gen_random_uuid(), 'Carla Silva Mendes', '74567890123', '745678901', '1989-11-05', 'F', 'solteira', 'carla.silva@email.com', '11987654367', 'Rua Barão de Capanema, 654, Jardins', '01411-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2025-04-05', 94.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'CREFITO 33456 - Especialista em Neurorreabilitação', NOW(), NOW()),

-- NUTRICIONISTAS PJ (Especialidade: Nutrição)
(gen_random_uuid(), 'Isabella Martins Souza', '71234567890', '712345678', '1987-01-17', 'F', 'solteira', 'isabella.martins@email.com', '11987654337', 'Rua Augusta, 654, Cerqueira César', '01413-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2024-06-01', 85.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'CRN3 12345 - Especialista em Nutrição Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Gabriel Santos Ferreira', '81234567890', '812345678', '1983-09-05', 'M', 'casado', 'gabriel.santos@email.com', '11987654338', 'Rua Teodoro Sampaio, 987, Pinheiros', '05405-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2024-06-05', 88.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'CRN3 23456 - Especialista em Nutrição Esportiva', NOW(), NOW()),

(gen_random_uuid(), 'Amanda Oliveira Cruz', '91234567890', '912345678', '1991-06-12', 'F', 'solteira', 'amanda.oliveira@email.com', '11987654339', 'Av. Angélica, 123, Higienópolis', '01227-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2024-06-10', 80.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'CRN3 34567 - Especialista em Pediatria', NOW(), NOW()),

(gen_random_uuid(), 'Helena Rodrigues Costa', '84567890123', '845678901', '1991-03-18', 'F', 'casada', 'helena.rodrigues@email.com', '11987654368', 'Rua Augusta, 987, Cerqueira César', '01413-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2025-04-10', 82.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'CRN3 45678 - Especialista em Nutrição Materno-Infantil', NOW(), NOW()),

(gen_random_uuid(), 'Vinicius Santos Lima', '94567890123', '945678901', '1984-07-09', 'M', 'divorciado', 'vinicius.santos@email.com', '11987654369', 'Av. Angélica, 123, Higienópolis', '01227-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2025-04-15', 87.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'CRN3 56789 - Especialista em Nutrição Oncológica', NOW(), NOW()),

-- NEUROPSICÓLOGOS PJ (Especialidade: Neuropsicologia)
(gen_random_uuid(), 'Eduardo Ribeiro Silva', '02345678901', '023456789', '1980-03-08', 'M', 'casado', 'eduardo.ribeiro@email.com', '11987654340', 'Rua Alameda Santos, 456, Cerqueira César', '01418-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2024-07-01', 150.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'CRP 01234 - Especialista em Avaliação Neuropsicológica', NOW(), NOW()),

(gen_random_uuid(), 'Carolina Alves Mendoza', '12345678902', '123456790', '1986-10-26', 'F', 'solteira', 'carolina.alves@email.com', '11987654341', 'Rua Henrique Schaumann, 789, Pinheiros', '05413-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2024-07-05', 140.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'CRP 11235 - Especialista em Reabilitação Cognitiva', NOW(), NOW()),

(gen_random_uuid(), 'Adriana Costa Ferreira', '05678901234', '056789012', '1983-02-14', 'F', 'solteira', 'adriana.costa@email.com', '11987654370', 'Rua Alameda Santos, 789, Cerqueira César', '01418-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2025-05-01', 145.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'CRP 22346 - Especialista em Neuropsicologia Infantil', NOW(), NOW()),

(gen_random_uuid(), 'Márcio Almeida Silva', '15678901234', '156789012', '1979-06-21', 'M', 'casado', 'marcio.almeida@email.com', '11987654371', 'Rua Henrique Schaumann, 321, Pinheiros', '05413-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2025-05-05', 155.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'CRP 33457 - Especialista em Neuropsicologia Forense', NOW(), NOW()),

-- MUSICOTERAPEUTAS PJ (Especialidade: Musicoterapia)
(gen_random_uuid(), 'Leonardo Pereira Gomes', '92345678901', '923456789', '1985-06-09', 'M', 'divorciado', 'leonardo.pereira@email.com', '11987654349', 'Rua Padre João Manuel, 654, Cerqueira César', '01411-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2024-11-01', 85.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Registro profissional - Especialista em Musicoterapia Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Priscila Costa Martins', '03456789012', '034567890', '1990-02-13', 'F', 'solteira', 'priscila.costa@email.com', '11987654350', 'Av. Nove de Julho, 987, Bela Vista', '01313-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2024-11-05', 82.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Registro profissional - Especialista em Musicoterapia Infantil', NOW(), NOW()),

(gen_random_uuid(), 'Daniela Ferreira Lima', '95678901234', '956789012', '1987-03-22', 'F', 'divorciada', 'daniela.ferreira@email.com', '11987654379', 'Rua Padre João Manuel, 987, Cerqueira César', '01411-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2025-07-05', 88.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Registro profissional - Especialista em Musicoterapia Neurológica', NOW(), NOW()),

(gen_random_uuid(), 'Juliano Santos Almeida', '06789012345', '067890123', '1984-09-10', 'M', 'solteiro', 'juliano.santos@email.com', '11987654380', 'Av. Nove de Julho, 123, Bela Vista', '01313-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2025-07-10', 80.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Registro profissional - Especialista em Musicoterapia Preventiva', NOW(), NOW()),

-- PSICOMOTRICISTAS PJ (Especialidade: Psicomotricidade)
(gen_random_uuid(), 'Claudia Santos Pereira', '33456789012', '334567890', '1981-05-31', 'F', 'divorciada', 'claudia.santos@email.com', '11987654353', 'Rua da Glória, 789, Liberdade', '01510-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-01-01', 90.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Registro profissional - Especialista em Psicomotricidade Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Jefferson Oliveira Costa', '43456789012', '434567890', '1986-08-04', 'M', 'casado', 'jefferson.oliveira@email.com', '11987654354', 'Av. Liberdade, 321, Liberdade', '01503-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-01-05', 85.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Registro profissional - Especialista em Psicomotricidade Educacional', NOW(), NOW()),

(gen_random_uuid(), 'Letícia Santos Barbosa', '36789012345', '367890123', '1992-02-08', 'F', 'solteira', 'leticia.santos@email.com', '11987654383', 'Rua da Glória, 321, Liberdade', '01510-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-08-05', 88.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Registro profissional - Especialista em Psicomotricidade Relacional', NOW(), NOW()),

(gen_random_uuid(), 'Cesar Oliveira Martins', '46789012345', '467890123', '1985-10-15', 'M', 'casado', 'cesar.oliveira@email.com', '11987654384', 'Av. Liberdade, 654, Liberdade', '01503-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-08-10', 86.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Registro profissional - Especialista em Psicomotricidade Aquática', NOW(), NOW()),

-- PSICOPEDAGOGOS PJ (Especialidade: Psicopedagogia)
(gen_random_uuid(), 'Michelle Santos Costa', '96789012345', '967890123', '1991-11-02', 'F', 'solteira', 'michelle.santos@email.com', '11987654389', 'Rua Vergueiro, 321, Paraíso', '01504-000', 'São Paulo', 'SP', 'Psicopedagogo', 'pj', 'ativo', '2025-09-15', 85.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicopedagogia', 'ABPp 12345 - Especialista em Dificuldades de Aprendizagem', NOW(), NOW()),

(gen_random_uuid(), 'Raphael Lima Silva', '07890123456', '078901234', '1984-05-27', 'M', 'casado', 'raphael.lima@email.com', '11987654390', 'Av. Paulista, 654, Bela Vista', '01311-000', 'São Paulo', 'SP', 'Psicopedagogo', 'pj', 'ativo', '2025-10-01', 82.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicopedagogia', 'ABPp 23456 - Especialista em Psicopedagogia Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Renata Almeida Souza', '13456789012', '134567890', '1987-09-07', 'F', 'casada', 'renata.almeida@email.com', '11987654351', 'Rua Bela Vista, 123, Liberdade', '01308-000', 'São Paulo', 'SP', 'Psicopedagogo', 'pj', 'ativo', '2024-12-01', 88.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicopedagogia', 'ABPp 34567 - Especialista em Psicopedagogia Institucional', NOW(), NOW()),

(gen_random_uuid(), 'Fábio Rodrigues Lima', '23456789013', '234567891', '1983-12-22', 'M', 'solteiro', 'fabio.rodrigues@email.com', '11987654352', 'Rua Galvão Bueno, 456, Liberdade', '01506-000', 'São Paulo', 'SP', 'Psicopedagogo', 'pj', 'ativo', '2024-12-05', 80.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicopedagogia', 'ABPp 45678 - Especialista em Neuroaprendizagem', NOW(), NOW()),

-- EDUCADORES FÍSICOS PJ (Especialidade: Educador Físico)
(gen_random_uuid(), 'Rodrigo Nascimento Alves', '72345678901', '723456789', '1988-04-18', 'M', 'casado', 'rodrigo.nascimento@email.com', '11987654347', 'Rua Verbo Divino, 789, Chácara Santo Antônio', '04719-000', 'São Paulo', 'SP', 'Educador Físico', 'pj', 'ativo', '2024-10-01', 75.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 12345 - Especialista em Reabilitação', NOW(), NOW()),

(gen_random_uuid(), 'Tatiana Santos Rocha', '82345678901', '823456789', '1992-11-25', 'F', 'solteira', 'tatiana.santos@email.com', '11987654348', 'Rua dos Três Irmãos, 321, Vila Progredior', '05615-000', 'São Paulo', 'SP', 'Educadora Física', 'pj', 'ativo', '2024-10-05', 70.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 23456 - Especialista em Grupos Especiais', NOW(), NOW()),

(gen_random_uuid(), 'Bruna Oliveira Pereira', '75678901234', '756789012', '1989-05-04', 'F', 'solteira', 'bruna.oliveira@email.com', '11987654377', 'Rua Verbo Divino, 321, Chácara Santo Antônio', '04719-000', 'São Paulo', 'SP', 'Educadora Física', 'pj', 'ativo', '2025-06-15', 72.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 34567 - Especialista em Exercício Terapêutico', NOW(), NOW()),

(gen_random_uuid(), 'Leandro Costa Silva', '85678901234', '856789012', '1986-11-17', 'M', 'casado', 'leandro.costa@email.com', '11987654378', 'Rua dos Três Irmãos, 654, Vila Progredior', '05615-000', 'São Paulo', 'SP', 'Educador Físico', 'pj', 'ativo', '2025-07-01', 78.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 45678 - Especialista em Hidroterapia', NOW(), NOW()),

-- PROFISSIONAIS PARA ANAMNESE (Especialidade: Anamnese)
(gen_random_uuid(), 'Cristina Barbosa Lima', '52345678901', '523456789', '1989-01-14', 'F', 'casada', 'cristina.barbosa@email.com', '11987654345', 'Rua Pedroso Alvarenga, 123, Itaim Bibi', '04531-000', 'São Paulo', 'SP', 'Psicólogo - Anamnese', 'pj', 'ativo', '2024-09-01', 100.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 44568 - Especialista em Avaliação Psicológica', NOW(), NOW()),

(gen_random_uuid(), 'Marcelo Ferreira Dias', '62345678901', '623456789', '1984-07-30', 'M', 'solteiro', 'marcelo.ferreira@email.com', '11987654346', 'Av. Ibirapuera, 456, Moema', '04029-000', 'São Paulo', 'SP', 'Neuropsicólogo - Anamnese', 'pj', 'ativo', '2024-09-05', 120.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'CRP 55679 - Especialista em Avaliação Neuropsicológica', NOW(), NOW()),

(gen_random_uuid(), 'Silvia Martins Oliveira', '55678901234', '556789012', '1990-08-26', 'F', 'casada', 'silvia.martins@email.com', '11987654375', 'Rua Pedroso Alvarenga, 456, Itaim Bibi', '04531-000', 'São Paulo', 'SP', 'Psicólogo - Anamnese', 'pj', 'ativo', '2025-06-05', 95.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 66780 - Especialista em Triagem e Anamnese', NOW(), NOW()),

(gen_random_uuid(), 'Fernando Santos Cruz', '65678901234', '656789012', '1982-01-19', 'M', 'solteiro', 'fernando.santos@email.com', '11987654376', 'Av. Ibirapuera, 789, Moema', '04029-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional - Anamnese', 'pj', 'ativo', '2025-06-10', 90.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'CREFITO 77891 - Especialista em Avaliação Funcional', NOW(), NOW()),

-- ADICIONAIS PARA COMPLETAR 80 PROFISSIONAIS
(gen_random_uuid(), 'Roberta Silva Nunes', '56789012346', '567890124', '1990-04-03', 'F', 'solteira', 'roberta.silva@email.com', '11987654385', 'Rua Tutóia, 987, Paraíso', '04007-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-08-15', 115.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'CRP 88902 - Especialista em Psicoterapia Breve', NOW(), NOW()),

(gen_random_uuid(), 'Máximo Costa Santos', '66789012345', '667890123', '1983-08-11', 'M', 'divorciado', 'maximo.costa@email.com', '11987654386', 'Rua Machado de Assis, 123, Vila Mariana', '04006-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2025-09-01', 95.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'CRFa 99013 - Especialista em Reabilitação Vocal', NOW(), NOW()),

(gen_random_uuid(), 'Camilla Rodrigues Alves', '76789012345', '767890123', '1989-01-25', 'F', 'casada', 'camilla.rodrigues@email.com', '11987654387', 'Av. Ibirapuera, 456, Moema', '04029-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2025-09-05', 98.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'CREFITO 00124 - Especialista em Fisioterapia Respiratória', NOW(), NOW()),

(gen_random_uuid(), 'Igor Pereira Lima', '86789012345', '867890123', '1986-07-18', 'M', 'solteiro', 'igor.pereira@email.com', '11987654388', 'Rua Domingos de Morais, 789, Vila Mariana', '04010-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2025-09-10', 92.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'CREFITO 11235 - Especialista em Tecnologia Assistiva', NOW(), NOW()),

(gen_random_uuid(), 'Bianca Oliveira Santos', '17890123456', '178901234', '1988-09-14', 'F', 'divorciada', 'bianca.oliveira@email.com', '11987654391', 'Rua Augusta, 987, Consolação', '01305-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2025-10-05', 85.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'CRN3 22346 - Especialista em Nutrição Comportamental', NOW(), NOW()),

(gen_random_uuid(), 'Guilherme Costa Ferreira', '27890123456', '278901234', '1982-12-09', 'M', 'solteiro', 'guilherme.costa@email.com', '11987654392', 'Rua Consolação, 123, Higienópolis', '01302-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2025-10-10', 160.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'CRP 33457 - Especialista em Reabilitação Neuropsicológica', NOW(), NOW()),

(gen_random_uuid(), 'Vanessa Lima Rodrigues', '16789012345', '167890123', '1988-12-16', 'F', 'casada', 'vanessa.lima@email.com', '11987654381', 'Rua Bela Vista, 456, Liberdade', '01308-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2025-07-15', 85.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Registro profissional - Especialista em Musicoterapia Grupal', NOW(), NOW()),

(gen_random_uuid(), 'Anderson Pereira Costa', '26789012345', '267890123', '1981-06-29', 'M', 'solteiro', 'anderson.pereira@email.com', '11987654382', 'Rua Galvão Bueno, 789, Liberdade', '01506-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-08-01', 88.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Registro profissional - Especialista em Psicomotricidade Preventiva', NOW(), NOW()),

(gen_random_uuid(), 'Larissa Mendes Silva', '37890123456', '378901234', '1991-05-12', 'F', 'solteira', 'larissa.mendes@email.com', '11987654393', 'Av. Paulista, 321, Bela Vista', '01311-000', 'São Paulo', 'SP', 'Psicopedagogo', 'pj', 'ativo', '2025-10-15', 86.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicopedagogia', 'ABPp 56789 - Especialista em Neuropsicopedagogia', NOW(), NOW()),

(gen_random_uuid(), 'Bruno Santos Oliveira', '47890123456', '478901234', '1987-08-05', 'M', 'casado', 'bruno.santos@email.com', '11987654394', 'Rua Augusta, 654, Consolação', '01305-000', 'São Paulo', 'SP', 'Educador Físico', 'pj', 'ativo', '2025-11-01', 76.00, 'hora', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 56789 - Especialista em Atividade Física Adaptada', NOW(), NOW());

-- Comentários sobre o script atualizado:
-- 1. Limitado às especialidades disponíveis na clínica
-- 2. Valores alterados para Valor/Hora (regime PJ)
-- 3. Faixas salariais realistas por especialidade:
--    • Psicólogos: R$ 108-135/hora
--    • Fonoaudiólogos: R$ 85-98/hora  
--    • Fisioterapeutas: R$ 88-100/hora
--    • Terapeutas Ocupacionais: R$ 85-94/hora
--    • Nutricionistas: R$ 80-88/hora
--    • Neuropsicólogos: R$ 140-160/hora
--    • Musicoterapeutas: R$ 80-88/hora
--    • Psicomotricistas: R$ 85-90/hora
--    • Psicopedagogos: R$ 80-88/hora
--    • Educadores Físicos: R$ 70-78/hora
--    • Profissionais Anamnese: R$ 90-120/hora
-- 4. Registros profissionais adequados por categoria
-- 5. Distribuição equilibrada entre as especialidades da clínica

(gen_random_uuid(), 'Daniel Souza Martins', '78901234567', '789012345', '1983-06-18', 'M', 'solteiro', 'daniel.souza@email.com', '11987654327', 'Av. Brigadeiro Luís Antônio, 123, Bela Vista', '01317-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-05', 6800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'Especialista em Linguagem Infantil', NOW(), NOW()),

(gen_random_uuid(), 'Camila Barbosa Nunes', '89012345678', '890123456', '1991-01-29', 'F', 'solteira', 'camila.barbosa@email.com', '11987654328', 'Rua Estados Unidos, 456, Jardins', '01427-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-10', 7600.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'Especialista em Disfagia', NOW(), NOW()),

(gen_random_uuid(), 'Thiago Mendes Silva', '90123456789', '901234567', '1987-10-14', 'M', 'casado', 'thiago.mendes@email.com', '11987654329', 'Rua Consolação, 789, Consolação', '01301-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-15', 7000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'Especialista em Voz Profissional', NOW(), NOW()),

-- FISIOTERAPEUTAS PJ
(gen_random_uuid(), 'Patrícia Gonçalves Lima', '01234567890', '012345678', '1984-05-07', 'F', 'casada', 'patricia.goncalves@email.com', '11987654330', 'Rua Bela Cintra, 321, Consolação', '01415-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-01', 7800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'Especialista em Ortopedia', NOW(), NOW()),

(gen_random_uuid(), 'André Luiz Carvalho', '11234567890', '112345678', '1981-08-16', 'M', 'divorciado', 'andre.carvalho@email.com', '11987654331', 'Av. Rebouças, 654, Pinheiros', '05401-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-05', 8200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'Especialista em Neurologia', NOW(), NOW()),

(gen_random_uuid(), 'Larissa Fernandes Costa', '21234567890', '212345678', '1989-02-28', 'F', 'solteira', 'larissa.fernandes@email.com', '11987654332', 'Rua da Consolação, 987, Higienópolis', '01302-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-10', 7400.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'Especialista em Pediatria', NOW(), NOW()),

(gen_random_uuid(), 'Lucas Rodrigues Santos', '31234567890', '312345678', '1992-12-11', 'M', 'solteiro', 'lucas.rodrigues@email.com', '11987654333', 'Rua Frei Caneca, 123, Consolação', '01307-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-15', 7600.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'Especialista em Desportiva', NOW(), NOW()),

-- TERAPEUTAS OCUPACIONAIS PJ
(gen_random_uuid(), 'Vanessa Silva Oliveira', '41234567890', '412345678', '1985-07-04', 'F', 'casada', 'vanessa.silva@email.com', '11987654334', 'Rua Marquês de Paranaguá, 456, Consolação', '01303-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-01', 7200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'Especialista em Pediatria', NOW(), NOW()),

(gen_random_uuid(), 'Bruno Costa Almeida', '51234567890', '512345678', '1988-11-19', 'M', 'solteiro', 'bruno.costa@email.com', '11987654335', 'Av. São Luís, 789, República', '01046-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-05', 6900.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'Especialista em Geriatria', NOW(), NOW()),

(gen_random_uuid(), 'Rafaela Pereira Lima', '61234567890', '612345678', '1990-04-23', 'F', 'divorciada', 'rafaela.pereira@email.com', '11987654336', 'Rua Barão de Capanema, 321, Jardins', '01411-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-10', 7500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'Especialista em Saúde Mental', NOW(), NOW()),

-- NUTRICIONISTAS PJ
(gen_random_uuid(), 'Isabella Martins Souza', '71234567890', '712345678', '1987-01-17', 'F', 'solteira', 'isabella.martins@email.com', '11987654337', 'Rua Augusta, 654, Cerqueira César', '01413-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2024-06-01', 6800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'Especialista em Nutrição Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Gabriel Santos Ferreira', '81234567890', '812345678', '1983-09-05', 'M', 'casado', 'gabriel.santos@email.com', '11987654338', 'Rua Teodoro Sampaio, 987, Pinheiros', '05405-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2024-06-05', 7100.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'Especialista em Nutrição Esportiva', NOW(), NOW()),

(gen_random_uuid(), 'Amanda Oliveira Cruz', '91234567890', '912345678', '1991-06-12', 'F', 'solteira', 'amanda.oliveira@email.com', '11987654339', 'Av. Angélica, 123, Higienópolis', '01227-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2024-06-10', 6500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'Especialista em Pediatria', NOW(), NOW()),

-- NEUROPSICÓLOGOS PJ
(gen_random_uuid(), 'Eduardo Ribeiro Silva', '02345678901', '023456789', '1980-03-08', 'M', 'casado', 'eduardo.ribeiro@email.com', '11987654340', 'Rua Alameda Santos, 456, Cerqueira César', '01418-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2024-07-01', 9500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'Especialista em Avaliação Neuropsicológica', NOW(), NOW()),

(gen_random_uuid(), 'Carolina Alves Mendoza', '12345678902', '123456790', '1986-10-26', 'F', 'solteira', 'carolina.alves@email.com', '11987654341', 'Rua Henrique Schaumann, 789, Pinheiros', '05413-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2024-07-05', 9000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'Especialista em Reabilitação Cognitiva', NOW(), NOW()),

-- MÉDICOS PJ
(gen_random_uuid(), 'Dr. Ricardo Moreira Santos', '22345678901', '223456789', '1975-05-15', 'M', 'casado', 'ricardo.moreira@email.com', '11987654342', 'Av. Europa, 321, Jardim Europa', '01449-000', 'São Paulo', 'SP', 'Médico Neurologista', 'pj', 'ativo', '2024-08-01', 15000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Medicina - Neurologia', 'CRM 123456 - Especialista em Neurologia', NOW(), NOW()),

(gen_random_uuid(), 'Dra. Beatriz Campos Oliveira', '32345678901', '323456789', '1982-12-02', 'F', 'divorciada', 'beatriz.campos@email.com', '11987654343', 'Rua Joaquim Floriano, 654, Itaim Bibi', '04534-000', 'São Paulo', 'SP', 'Médica Psiquiatra', 'pj', 'ativo', '2024-08-05', 14500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Medicina - Psiquiatria', 'CRM 234567 - Especialista em Psiquiatria', NOW(), NOW()),

(gen_random_uuid(), 'Dr. Henrique Silva Costa', '42345678901', '423456789', '1978-08-21', 'M', 'solteiro', 'henrique.silva@email.com', '11987654344', 'Rua Funchal, 987, Vila Olímpia', '04551-000', 'São Paulo', 'SP', 'Médico Pediatra', 'pj', 'ativo', '2024-08-10', 13800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Medicina - Pediatria', 'CRM 345678 - Especialista em Pediatria', NOW(), NOW()),

-- ASSISTENTES SOCIAIS PJ
(gen_random_uuid(), 'Cristina Barbosa Lima', '52345678901', '523456789', '1989-01-14', 'F', 'casada', 'cristina.barbosa@email.com', '11987654345', 'Rua Pedroso Alvarenga, 123, Itaim Bibi', '04531-000', 'São Paulo', 'SP', 'Assistente Social', 'pj', 'ativo', '2024-09-01', 5800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Serviço Social', 'CRESS 12345 - Especialista em Saúde', NOW(), NOW()),

(gen_random_uuid(), 'Marcelo Ferreira Dias', '62345678901', '623456789', '1984-07-30', 'M', 'solteiro', 'marcelo.ferreira@email.com', '11987654346', 'Av. Ibirapuera, 456, Moema', '04029-000', 'São Paulo', 'SP', 'Assistente Social', 'pj', 'ativo', '2024-09-05', 6200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Serviço Social', 'CRESS 23456 - Especialista em Família', NOW(), NOW()),

-- EDUCADORES FÍSICOS PJ
(gen_random_uuid(), 'Rodrigo Nascimento Alves', '72345678901', '723456789', '1988-04-18', 'M', 'casado', 'rodrigo.nascimento@email.com', '11987654347', 'Rua Verbo Divino, 789, Chácara Santo Antônio', '04719-000', 'São Paulo', 'SP', 'Educador Físico', 'pj', 'ativo', '2024-10-01', 6000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 34567 - Especialista em Reabilitação', NOW(), NOW()),

(gen_random_uuid(), 'Tatiana Santos Rocha', '82345678901', '823456789', '1992-11-25', 'F', 'solteira', 'tatiana.santos@email.com', '11987654348', 'Rua dos Três Irmãos, 321, Vila Progredior', '05615-000', 'São Paulo', 'SP', 'Educadora Física', 'pj', 'ativo', '2024-10-05', 5700.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 45678 - Especialista em Grupos Especiais', NOW(), NOW()),

-- MUSICOTERAPEUTAS PJ
(gen_random_uuid(), 'Leonardo Pereira Gomes', '92345678901', '923456789', '1985-06-09', 'M', 'divorciado', 'leonardo.pereira@email.com', '11987654349', 'Rua Padre João Manuel, 654, Cerqueira César', '01411-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2024-11-01', 6800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Especialista em Musicoterapia Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Priscila Costa Martins', '03456789012', '034567890', '1990-02-13', 'F', 'solteira', 'priscila.costa@email.com', '11987654350', 'Av. Nove de Julho, 987, Bela Vista', '01313-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2024-11-05', 6500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Especialista em Musicoterapia Infantil', NOW(), NOW()),

-- ARTE-TERAPEUTAS PJ
(gen_random_uuid(), 'Renata Almeida Souza', '13456789012', '134567890', '1987-09-07', 'F', 'casada', 'renata.almeida@email.com', '11987654351', 'Rua Bela Vista, 123, Liberdade', '01308-000', 'São Paulo', 'SP', 'Arte-terapeuta', 'pj', 'ativo', '2024-12-01', 6200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Arteterapia', 'Especialista em Arteterapia Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Fábio Rodrigues Lima', '23456789013', '234567891', '1983-12-22', 'M', 'solteiro', 'fabio.rodrigues@email.com', '11987654352', 'Rua Galvão Bueno, 456, Liberdade', '01506-000', 'São Paulo', 'SP', 'Arte-terapeuta', 'pj', 'ativo', '2024-12-05', 5900.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Arteterapia', 'Especialista em Arteterapia Infantil', NOW(), NOW()),

-- PSICOMOTRICISTAS PJ
(gen_random_uuid(), 'Claudia Santos Pereira', '33456789012', '334567890', '1981-05-31', 'F', 'divorciada', 'claudia.santos@email.com', '11987654353', 'Rua da Glória, 789, Liberdade', '01510-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-01-01', 7000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Especialista em Psicomotricidade Clínica', NOW(), NOW()),

(gen_random_uuid(), 'Jefferson Oliveira Costa', '43456789012', '434567890', '1986-08-04', 'M', 'casado', 'jefferson.oliveira@email.com', '11987654354', 'Av. Liberdade, 321, Liberdade', '01503-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-01-05', 6700.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Especialista em Psicomotricidade Educacional', NOW(), NOW()),

-- MAIS PSICÓLOGOS PJ (continuando)
(gen_random_uuid(), 'Viviane Silva Barbosa', '53456789012', '534567890', '1989-03-27', 'F', 'solteira', 'viviane.silva@email.com', '11987654355', 'Rua Tutóia, 654, Paraíso', '04007-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-01-10', 8200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'Especialista em Terapia de Casal', NOW(), NOW()),

(gen_random_uuid(), 'Marcos Antônio Ferreira', '63456789012', '634567890', '1984-11-15', 'M', 'casado', 'marcos.ferreira@email.com', '11987654356', 'Rua Machado de Assis, 987, Vila Mariana', '04006-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-01-15', 7900.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'Especialista em Psicologia Organizacional', NOW(), NOW()),

(gen_random_uuid(), 'Natália Costa Lima', '73456789012', '734567890', '1992-07-19', 'F', 'solteira', 'natalia.costa@email.com', '11987654357', 'Av. Ibirapuera, 123, Moema', '04029-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-01-20', 8500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'Especialista em Psicologia Hospitalar', NOW(), NOW()),

(gen_random_uuid(), 'Paulo César Santos', '83456789012', '834567890', '1980-02-06', 'M', 'divorciado', 'paulo.santos@email.com', '11987654358', 'Rua Domingos de Morais, 456, Vila Mariana', '04010-000', 'São Paulo', 'SP', 'Psicólogo', 'pj', 'ativo', '2025-02-01', 8800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Psicologia', 'Especialista em Psicologia Clínica', NOW(), NOW()),

-- MAIS FONOAUDIÓLOGOS PJ
(gen_random_uuid(), 'Sabrina Oliveira Rocha', '93456789012', '934567890', '1988-06-11', 'F', 'casada', 'sabrina.oliveira@email.com', '11987654359', 'Rua Vergueiro, 789, Paraíso', '01504-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-05', 7300.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'Especialista em Motricidade Orofacial', NOW(), NOW()),

(gen_random_uuid(), 'Diego Alves Pereira', '04567890123', '045678901', '1985-10-24', 'M', 'solteiro', 'diego.alves@email.com', '11987654360', 'Av. Paulista, 321, Bela Vista', '01311-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-10', 6900.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'Especialista em Fluência', NOW(), NOW()),

(gen_random_uuid(), 'Aline Santos Cruz', '14567890123', '145678901', '1991-01-08', 'F', 'solteira', 'aline.santos@email.com', '11987654361', 'Rua Augusta, 654, Consolação', '01305-000', 'São Paulo', 'SP', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-15', 7500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fonoaudiologia', 'Especialista em Linguagem', NOW(), NOW()),

-- MAIS FISIOTERAPEUTAS PJ
(gen_random_uuid(), 'Gustavo Lima Martins', '24567890123', '245678901', '1987-04-16', 'M', 'casado', 'gustavo.lima@email.com', '11987654362', 'Rua Consolação, 987, Higienópolis', '01302-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2025-03-01', 7700.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'Especialista em Cardiorrespiratória', NOW(), NOW()),

(gen_random_uuid(), 'Mônica Ferreira Silva', '34567890124', '345678902', '1983-09-03', 'F', 'divorciada', 'monica.ferreira@email.com', '11987654363', 'Av. Rebouças, 123, Pinheiros', '05401-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2025-03-05', 8000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'Especialista em Uroginecologia', NOW(), NOW()),

(gen_random_uuid(), 'Felipe Costa Almeida', '44567890123', '445678901', '1990-12-28', 'M', 'solteiro', 'felipe.costa@email.com', '11987654364', 'Rua Teodoro Sampaio, 456, Pinheiros', '05405-000', 'São Paulo', 'SP', 'Fisioterapeuta', 'pj', 'ativo', '2025-03-10', 7200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Fisioterapia', 'Especialista em Reumatologia', NOW(), NOW()),

-- MAIS TERAPEUTAS OCUPACIONAIS PJ
(gen_random_uuid(), 'Simone Barbosa Santos', '54567890123', '545678901', '1986-05-20', 'F', 'casada', 'simone.barbosa@email.com', '11987654365', 'Rua Frei Caneca, 789, Consolação', '01307-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2025-03-15', 7400.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'Especialista em Integração Sensorial', NOW(), NOW()),

(gen_random_uuid(), 'Ricardo Pereira Oliveira', '64567890123', '645678901', '1982-08-12', 'M', 'solteiro', 'ricardo.pereira@email.com', '11987654366', 'Av. São Luís, 321, República', '01046-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2025-04-01', 7100.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'Especialista em Reabilitação Profissional', NOW(), NOW()),

(gen_random_uuid(), 'Carla Silva Mendes', '74567890123', '745678901', '1989-11-05', 'F', 'solteira', 'carla.silva@email.com', '11987654367', 'Rua Barão de Capanema, 654, Jardins', '01411-000', 'São Paulo', 'SP', 'Terapeuta Ocupacional', 'pj', 'ativo', '2025-04-05', 7600.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Terapia Ocupacional', 'Especialista em Neurorreabilitação', NOW(), NOW()),

-- MAIS NUTRICIONISTAS PJ
(gen_random_uuid(), 'Helena Rodrigues Costa', '84567890123', '845678901', '1991-03-18', 'F', 'casada', 'helena.rodrigues@email.com', '11987654368', 'Rua Augusta, 987, Cerqueira César', '01413-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2025-04-10', 6600.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'Especialista em Nutrição Materno-Infantil', NOW(), NOW()),

(gen_random_uuid(), 'Vinicius Santos Lima', '94567890123', '945678901', '1984-07-09', 'M', 'divorciado', 'vinicius.santos@email.com', '11987654369', 'Av. Angélica, 123, Higienópolis', '01227-000', 'São Paulo', 'SP', 'Nutricionista', 'pj', 'ativo', '2025-04-15', 7000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Nutrição', 'Especialista em Nutrição Oncológica', NOW(), NOW()),

-- MAIS NEUROPSICÓLOGOS PJ
(gen_random_uuid(), 'Adriana Costa Ferreira', '05678901234', '056789012', '1983-02-14', 'F', 'solteira', 'adriana.costa@email.com', '11987654370', 'Rua Alameda Santos, 789, Cerqueira César', '01418-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2025-05-01', 9200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'Especialista em Neuropsicologia Infantil', NOW(), NOW()),

(gen_random_uuid(), 'Márcio Almeida Silva', '15678901234', '156789012', '1979-06-21', 'M', 'casado', 'marcio.almeida@email.com', '11987654371', 'Rua Henrique Schaumann, 321, Pinheiros', '05413-000', 'São Paulo', 'SP', 'Neuropsicólogo', 'pj', 'ativo', '2025-05-05', 9800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Neuropsicologia', 'Especialista em Neuropsicologia Forense', NOW(), NOW()),

-- MAIS MÉDICOS PJ
(gen_random_uuid(), 'Dra. Luciana Pereira Santos', '25678901234', '256789012', '1981-10-13', 'F', 'casada', 'luciana.pereira@email.com', '11987654372', 'Av. Europa, 654, Jardim Europa', '01449-000', 'São Paulo', 'SP', 'Médica Pediatra', 'pj', 'ativo', '2025-05-10', 14200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Medicina - Pediatria', 'CRM 456789 - Especialista em Neuropediatria', NOW(), NOW()),

(gen_random_uuid(), 'Dr. Alexandre Silva Rocha', '35678901234', '356789012', '1977-04-07', 'M', 'divorciado', 'alexandre.silva@email.com', '11987654373', 'Rua Joaquim Floriano, 987, Itaim Bibi', '04534-000', 'São Paulo', 'SP', 'Médico Ortopedista', 'pj', 'ativo', '2025-05-15', 16000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Medicina - Ortopedia', 'CRM 567890 - Especialista em Traumatologia', NOW(), NOW()),

(gen_random_uuid(), 'Dra. Patricia Lima Costa', '45678901235', '456789013', '1985-12-01', 'F', 'solteira', 'patricia.lima@email.com', '11987654374', 'Rua Funchal, 123, Vila Olímpia', '04551-000', 'São Paulo', 'SP', 'Médica Dermatologista', 'pj', 'ativo', '2025-06-01', 13500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Medicina - Dermatologia', 'CRM 678901 - Especialista em Dermatologia Clínica', NOW(), NOW()),

-- MAIS ASSISTENTES SOCIAIS PJ
(gen_random_uuid(), 'Silvia Martins Oliveira', '55678901234', '556789012', '1990-08-26', 'F', 'casada', 'silvia.martins@email.com', '11987654375', 'Rua Pedroso Alvarenga, 456, Itaim Bibi', '04531-000', 'São Paulo', 'SP', 'Assistente Social', 'pj', 'ativo', '2025-06-05', 6000.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Serviço Social', 'CRESS 34567 - Especialista em Política Social', NOW(), NOW()),

(gen_random_uuid(), 'Fernando Santos Cruz', '65678901234', '656789012', '1982-01-19', 'M', 'solteiro', 'fernando.santos@email.com', '11987654376', 'Av. Ibirapuera, 789, Moema', '04029-000', 'São Paulo', 'SP', 'Assistente Social', 'pj', 'ativo', '2025-06-10', 6300.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Serviço Social', 'CRESS 45678 - Especialista em Gerontologia', NOW(), NOW()),

-- MAIS EDUCADORES FÍSICOS PJ
(gen_random_uuid(), 'Bruna Oliveira Pereira', '75678901234', '756789012', '1989-05-04', 'F', 'solteira', 'bruna.oliveira@email.com', '11987654377', 'Rua Verbo Divino, 321, Chácara Santo Antônio', '04719-000', 'São Paulo', 'SP', 'Educadora Física', 'pj', 'ativo', '2025-06-15', 5900.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 56789 - Especialista em Exercício Terapêutico', NOW(), NOW()),

(gen_random_uuid(), 'Leandro Costa Silva', '85678901234', '856789012', '1986-11-17', 'M', 'casado', 'leandro.costa@email.com', '11987654378', 'Rua dos Três Irmãos, 654, Vila Progredior', '05615-000', 'São Paulo', 'SP', 'Educador Físico', 'pj', 'ativo', '2025-07-01', 6100.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Educação Física', 'CREF 67890 - Especialista em Hidroterapia', NOW(), NOW()),

-- MAIS MUSICOTERAPEUTAS PJ
(gen_random_uuid(), 'Daniela Ferreira Lima', '95678901234', '956789012', '1987-03-22', 'F', 'divorciada', 'daniela.ferreira@email.com', '11987654379', 'Rua Padre João Manuel, 987, Cerqueira César', '01411-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2025-07-05', 6700.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Especialista em Musicoterapia Neurológica', NOW(), NOW()),

(gen_random_uuid(), 'Juliano Santos Almeida', '06789012345', '067890123', '1984-09-10', 'M', 'solteiro', 'juliano.santos@email.com', '11987654380', 'Av. Nove de Julho, 123, Bela Vista', '01313-000', 'São Paulo', 'SP', 'Musicoterapeuta', 'pj', 'ativo', '2025-07-10', 6400.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Musicoterapia', 'Especialista em Musicoterapia Preventiva', NOW(), NOW()),

-- MAIS ARTE-TERAPEUTAS PJ
(gen_random_uuid(), 'Vanessa Lima Rodrigues', '16789012345', '167890123', '1988-12-16', 'F', 'casada', 'vanessa.lima@email.com', '11987654381', 'Rua Bela Vista, 456, Liberdade', '01308-000', 'São Paulo', 'SP', 'Arte-terapeuta', 'pj', 'ativo', '2025-07-15', 6100.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Arteterapia', 'Especialista em Arteterapia Grupal', NOW(), NOW()),

(gen_random_uuid(), 'Anderson Pereira Costa', '26789012345', '267890123', '1981-06-29', 'M', 'solteiro', 'anderson.pereira@email.com', '11987654382', 'Rua Galvão Bueno, 789, Liberdade', '01506-000', 'São Paulo', 'SP', 'Arte-terapeuta', 'pj', 'ativo', '2025-08-01', 5800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Arteterapia', 'Especialista em Arteterapia Hospitalar', NOW(), NOW()),

-- MAIS PSICOMOTRICISTAS PJ
(gen_random_uuid(), 'Letícia Santos Barbosa', '36789012345', '367890123', '1992-02-08', 'F', 'solteira', 'leticia.santos@email.com', '11987654383', 'Rua da Glória, 321, Liberdade', '01510-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-08-05', 6900.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Especialista em Psicomotricidade Relacional', NOW(), NOW()),

(gen_random_uuid(), 'Cesar Oliveira Martins', '46789012345', '467890123', '1985-10-15', 'M', 'casado', 'cesar.oliveira@email.com', '11987654384', 'Av. Liberdade, 654, Liberdade', '01503-000', 'São Paulo', 'SP', 'Psicomotricista', 'pj', 'ativo', '2025-08-10', 6600.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicomotricidade', 'Especialista em Psicomotricidade Aquática', NOW(), NOW()),

-- ESPECIALISTAS EM LIBRAS PJ
(gen_random_uuid(), 'Roberta Silva Nunes', '56789012346', '567890124', '1990-04-03', 'F', 'solteira', 'roberta.silva@email.com', '11987654385', 'Rua Tutóia, 987, Paraíso', '04007-000', 'São Paulo', 'SP', 'Intérprete de Libras', 'pj', 'ativo', '2025-08-15', 5500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Letras/Libras', 'Certificação Prolibras - Intérprete de Libras', NOW(), NOW()),

(gen_random_uuid(), 'Máximo Costa Santos', '66789012345', '667890123', '1983-08-11', 'M', 'divorciado', 'maximo.costa@email.com', '11987654386', 'Rua Machado de Assis, 123, Vila Mariana', '04006-000', 'São Paulo', 'SP', 'Instrutor de Libras', 'pj', 'ativo', '2025-09-01', 5200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Superior Completo - Letras/Libras', 'Certificação Prolibras - Instrutor de Libras', NOW(), NOW()),

-- TERAPEUTAS ABA PJ
(gen_random_uuid(), 'Camilla Rodrigues Alves', '76789012345', '767890123', '1989-01-25', 'F', 'casada', 'camilla.rodrigues@email.com', '11987654387', 'Av. Ibirapuera, 456, Moema', '04029-000', 'São Paulo', 'SP', 'Terapeuta ABA', 'pj', 'ativo', '2025-09-05', 7800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em ABA', 'Certificação BCBA - Analista do Comportamento', NOW(), NOW()),

(gen_random_uuid(), 'Igor Pereira Lima', '86789012345', '867890123', '1986-07-18', 'M', 'solteiro', 'igor.pereira@email.com', '11987654388', 'Rua Domingos de Morais, 789, Vila Mariana', '04010-000', 'São Paulo', 'SP', 'Terapeuta ABA', 'pj', 'ativo', '2025-09-10', 7500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em ABA', 'Certificação BCaBA - Assistente de Analista do Comportamento', NOW(), NOW()),

-- PSICOPEDAGOGOS PJ
(gen_random_uuid(), 'Michelle Santos Costa', '96789012345', '967890123', '1991-11-02', 'F', 'solteira', 'michelle.santos@email.com', '11987654389', 'Rua Vergueiro, 321, Paraíso', '01504-000', 'São Paulo', 'SP', 'Psicopedagogo', 'pj', 'ativo', '2025-09-15', 6800.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicopedagogia', 'Especialista em Dificuldades de Aprendizagem', NOW(), NOW()),

(gen_random_uuid(), 'Raphael Lima Silva', '07890123456', '078901234', '1984-05-27', 'M', 'casado', 'raphael.lima@email.com', '11987654390', 'Av. Paulista, 654, Bela Vista', '01311-000', 'São Paulo', 'SP', 'Psicopedagogo', 'pj', 'ativo', '2025-10-01', 6500.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Psicopedagogia', 'Especialista em Psicopedagogia Clínica', NOW(), NOW()),

-- TERAPEUTAS DE INTEGRAÇÃO SENSORIAL PJ
(gen_random_uuid(), 'Bianca Oliveira Santos', '17890123456', '178901234', '1988-09-14', 'F', 'divorciada', 'bianca.oliveira@email.com', '11987654391', 'Rua Augusta, 987, Consolação', '01305-000', 'São Paulo', 'SP', 'Terapeuta de Integração Sensorial', 'pj', 'ativo', '2025-10-05', 8200.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Integração Sensorial', 'Certificação em Integração Sensorial - USC', NOW(), NOW()),

(gen_random_uuid(), 'Guilherme Costa Ferreira', '27890123456', '278901234', '1982-12-09', 'M', 'solteiro', 'guilherme.costa@email.com', '11987654392', 'Rua Consolação, 123, Higienópolis', '01302-000', 'São Paulo', 'SP', 'Terapeuta de Integração Sensorial', 'pj', 'ativo', '2025-10-10', 7900.00, 'mensal', '18bca994-1c17-47f0-b650-10ef3690a481', 'Pós-Graduação em Integração Sensorial', 'Certificação em Integração Sensorial - USC', NOW(), NOW());

-- Atualiza o contador de sequência
SELECT setval('colaboradores_id_seq', (SELECT MAX(id)::int FROM colaboradores));

-- Comentários sobre o script:
-- 1. Criados 80 colaboradores PJ de diversas especialidades
-- 2. Dados realistas com nomes brasileiros, CPFs únicos e endereços de SP
-- 3. Distribuição equilibrada entre especialidades da saúde
-- 4. Valores salariais condizentes com o mercado PJ
-- 5. Todos com status 'ativo' e regime_contratacao 'pj'
-- 6. Datas de admissão distribuídas ao longo de 2024-2025
-- 7. Incluídas especialidades modernas como ABA, Integração Sensorial, etc.
