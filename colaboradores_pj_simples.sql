-- Script simplificado para inserir colaboradores PJ
-- Apenas profissionais essenciais para teste

INSERT INTO colaboradores (
    id,
    nome_completo,
    cpf,
    rg,
    data_nascimento,
    genero,
    email_pessoal,
    telefone_celular,
    cargo,
    regime_contratacao,
    status,
    data_admissao,
    salario_valor,
    unidade_id,
    created_at,
    updated_at,
    nome_mae
) VALUES 
-- PSICÓLOGOS (5 profissionais)
(gen_random_uuid(), 'Ana Carolina Silva Santos', '12345678901', '123456789', '1985-03-15', 'feminino', 'ana.carolina@email.com', '11987654321', 'Psicólogo', 'pj', 'ativo', '2024-01-15', 120.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Maria Santos Silva'),

(gen_random_uuid(), 'João Pedro Oliveira Costa', '23456789012', '234567890', '1988-07-22', 'masculino', 'joao.pedro@email.com', '11987654322', 'Psicólogo', 'pj', 'ativo', '2024-02-01', 110.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Ana Costa Oliveira'),

(gen_random_uuid(), 'Marina Souza Lima', '34567890123', '345678901', '1990-11-08', 'feminino', 'marina.souza@email.com', '11987654323', 'Psicólogo', 'pj', 'ativo', '2024-02-15', 125.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Carmen Lima Souza'),

(gen_random_uuid(), 'Rafael Martins Pereira', '45678901234', '456789012', '1987-05-30', 'masculino', 'rafael.martins@email.com', '11987654324', 'Psicólogo', 'pj', 'ativo', '2024-03-01', 115.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Rosa Pereira Martins'),

(gen_random_uuid(), 'Fernanda Costa Almeida', '56789012345', '567890123', '1992-09-14', 'feminino', 'fernanda.costa@email.com', '11987654325', 'Psicólogo', 'pj', 'ativo', '2024-03-15', 118.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Sandra Almeida Costa'),

-- FONOAUDIÓLOGOS (3 profissionais)
(gen_random_uuid(), 'Beatriz Ferreira Santos', '67890123456', '678901234', '1986-01-12', 'feminino', 'beatriz.ferreira@email.com', '11987654326', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-20', 100.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Lucia Santos Ferreira'),

(gen_random_uuid(), 'Carlos Eduardo Silva', '78901234567', '789012345', '1984-04-28', 'masculino', 'carlos.eduardo@email.com', '11987654327', 'Fonoaudiólogo', 'pj', 'ativo', '2024-04-01', 105.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Vera Silva Eduardo'),

(gen_random_uuid(), 'Juliana Rodrigues Lima', '89012345678', '890123456', '1991-08-17', 'feminino', 'juliana.rodrigues@email.com', '11987654328', 'Fonoaudiólogo', 'pj', 'ativo', '2024-04-15', 95.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Patricia Lima Rodrigues'),

-- FISIOTERAPEUTAS (3 profissionais)
(gen_random_uuid(), 'Patrícia Gonçalves Lima', '01234567890', '012345678', '1984-05-07', 'feminino', 'patricia.goncalves@email.com', '11987654330', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-01', 95.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Helena Lima Gonçalves'),

(gen_random_uuid(), 'André Luiz Carvalho', '11234567890', '112345678', '1981-08-16', 'masculino', 'andre.carvalho@email.com', '11987654331', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-05', 100.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Marisa Carvalho Luiz'),

(gen_random_uuid(), 'Larissa Fernandes Costa', '21234567890', '212345678', '1989-02-28', 'feminino', 'larissa.fernandes@email.com', '11987654332', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-10', 90.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Claudia Costa Fernandes'),

-- TERAPEUTAS OCUPACIONAIS (2 profissionais)
(gen_random_uuid(), 'Vanessa Silva Oliveira', '41234567890', '412345678', '1985-07-04', 'feminino', 'vanessa.silva@email.com', '11987654334', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-01', 90.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Isabel Oliveira Silva'),

(gen_random_uuid(), 'Bruno Costa Almeida', '51234567890', '512345678', '1988-11-19', 'masculino', 'bruno.costa@email.com', '11987654335', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-05', 85.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Lucia Almeida Costa'),

-- NUTRICIONISTAS (2 profissionais)
(gen_random_uuid(), 'Isabella Martins Souza', '71234567890', '712345678', '1987-01-17', 'feminino', 'isabella.martins@email.com', '11987654337', 'Nutricionista', 'pj', 'ativo', '2024-06-01', 85.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Regina Souza Martins'),

(gen_random_uuid(), 'Gabriel Santos Ferreira', '81234567890', '812345678', '1983-09-05', 'masculino', 'gabriel.santos@email.com', '11987654338', 'Nutricionista', 'pj', 'ativo', '2024-06-05', 88.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW(), 'Beatriz Ferreira Santos');
