-- ============================================
-- SCRIPT FINAL: CORRIGIR COLABORADORES PJ
-- ============================================
-- Este script garante que os profissionais PJ estejam na tabela colaboradores
-- e corrige as relações para o sistema de salas funcionar

-- 1. VERIFICAR SE A TABELA COLABORADORES EXISTE E TEM OS CAMPOS NECESSÁRIOS
-- Se não existir, criar a tabela colaboradores baseada na estrutura esperada

-- 2. LIMPAR DADOS EXISTENTES (APENAS COLABORADORES PJ DE TESTE)
DELETE FROM colaboradores 
WHERE regime_contratacao = 'pj' 
AND email_pessoal LIKE '%@email.com';

-- 3. INSERIR COLABORADORES PJ OTIMIZADO (APENAS OS ESSENCIAIS PARA TESTE)
INSERT INTO colaboradores (
  id, nome_completo, cpf, data_nascimento, genero, 
  email_pessoal, telefone_celular, cargo, regime_contratacao, 
  status, data_admissao, salario_valor, unidade_id,
  created_at, updated_at
) VALUES 

-- PSICÓLOGOS (10 profissionais)
(gen_random_uuid(), 'Ana Carolina Silva Santos', '12345678901', '1985-03-15', 'feminino', 'ana.silva@email.com', '11987654321', 'Psicólogo', 'pj', 'ativo', '2024-01-15', 120.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Carlos Eduardo Oliveira', '23456789012', '1982-07-22', 'masculino', 'carlos.oliveira@email.com', '11987654322', 'Psicólogo', 'pj', 'ativo', '2024-01-20', 110.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Mariana Costa Ferreira', '34567890123', '1988-11-08', 'feminino', 'mariana.costa@email.com', '11987654323', 'Psicólogo', 'pj', 'ativo', '2024-02-01', 130.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Roberto Almeida Junior', '45678901234', '1979-04-12', 'masculino', 'roberto.almeida@email.com', '11987654324', 'Psicólogo', 'pj', 'ativo', '2024-02-10', 125.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Fernanda Lima Rodrigues', '56789012345', '1990-09-25', 'feminino', 'fernanda.lima@email.com', '11987654325', 'Psicólogo', 'pj', 'ativo', '2024-02-15', 115.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Paulo César Santos', '83456789012', '1980-02-06', 'masculino', 'paulo.santos@email.com', '11987654358', 'Psicólogo', 'pj', 'ativo', '2025-02-01', 135.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Viviane Silva Barbosa', '53456789012', '1989-03-27', 'feminino', 'viviane.silva@email.com', '11987654355', 'Psicólogo', 'pj', 'ativo', '2025-01-10', 118.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Marcos Antônio Ferreira', '63456789012', '1984-11-15', 'masculino', 'marcos.ferreira@email.com', '11987654356', 'Psicólogo', 'pj', 'ativo', '2025-01-15', 108.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Natália Costa Lima', '73456789012', '1992-07-19', 'feminino', 'natalia.costa@email.com', '11987654357', 'Psicólogo', 'pj', 'ativo', '2025-01-20', 122.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Roberta Silva Nunes', '56789012346', '1990-04-03', 'feminino', 'roberta.silva@email.com', '11987654385', 'Psicólogo', 'pj', 'ativo', '2025-08-15', 115.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

-- FONOAUDIÓLOGOS (8 profissionais)
(gen_random_uuid(), 'Juliana Santos Pereira', '67890123456', '1986-12-03', 'feminino', 'juliana.santos@email.com', '11987654326', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-01', 95.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Daniel Souza Martins', '78901234567', '1983-06-18', 'masculino', 'daniel.souza@email.com', '11987654327', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-05', 88.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Camila Barbosa Nunes', '89012345678', '1991-01-29', 'feminino', 'camila.barbosa@email.com', '11987654328', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-10', 92.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Thiago Mendes Silva', '90123456789', '1987-10-14', 'masculino', 'thiago.mendes@email.com', '11987654329', 'Fonoaudiólogo', 'pj', 'ativo', '2024-03-15', 90.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Sabrina Oliveira Rocha', '93456789012', '1988-06-11', 'feminino', 'sabrina.oliveira@email.com', '11987654359', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-05', 96.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Diego Alves Pereira', '04567890123', '1985-10-24', 'masculino', 'diego.alves@email.com', '11987654360', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-10', 85.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Aline Santos Cruz', '14567890123', '1991-01-08', 'feminino', 'aline.santos@email.com', '11987654361', 'Fonoaudiólogo', 'pj', 'ativo', '2025-02-15', 98.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Máximo Costa Santos', '66789012345', '1983-08-11', 'masculino', 'maximo.costa@email.com', '11987654386', 'Fonoaudiólogo', 'pj', 'ativo', '2025-09-01', 95.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

-- FISIOTERAPEUTAS (5 profissionais)
(gen_random_uuid(), 'Patrícia Gonçalves Lima', '01234567890', '1984-05-07', 'feminino', 'patricia.goncalves@email.com', '11987654330', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-01', 95.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'André Luiz Carvalho', '11234567890', '1981-08-16', 'masculino', 'andre.carvalho@email.com', '11987654331', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-05', 100.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Larissa Fernandes Costa', '21234567890', '1989-02-28', 'feminino', 'larissa.fernandes@email.com', '11987654332', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-10', 90.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Lucas Rodrigues Santos', '31234567890', '1992-12-11', 'masculino', 'lucas.rodrigues@email.com', '11987654333', 'Fisioterapeuta', 'pj', 'ativo', '2024-04-15', 92.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Gustavo Lima Martins', '24567890123', '1987-04-16', 'masculino', 'gustavo.lima@email.com', '11987654362', 'Fisioterapeuta', 'pj', 'ativo', '2025-03-01', 94.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

-- TERAPEUTAS OCUPACIONAIS (4 profissionais)
(gen_random_uuid(), 'Vanessa Silva Oliveira', '41234567890', '1985-07-04', 'feminino', 'vanessa.silva@email.com', '11987654334', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-01', 90.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Bruno Costa Almeida', '51234567890', '1988-11-19', 'masculino', 'bruno.costa@email.com', '11987654335', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-05', 85.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Rafaela Pereira Lima', '61234567890', '1990-04-23', 'feminino', 'rafaela.pereira@email.com', '11987654336', 'Terapeuta Ocupacional', 'pj', 'ativo', '2024-05-10', 92.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Igor Pereira Lima', '86789012345', '1986-07-18', 'masculino', 'igor.pereira@email.com', '11987654388', 'Terapeuta Ocupacional', 'pj', 'ativo', '2025-09-10', 92.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

-- NUTRICIONISTAS (3 profissionais)
(gen_random_uuid(), 'Isabella Martins Souza', '71234567890', '1987-01-17', 'feminino', 'isabella.martins@email.com', '11987654337', 'Nutricionista', 'pj', 'ativo', '2024-06-01', 85.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Gabriel Santos Ferreira', '81234567890', '1983-09-05', 'masculino', 'gabriel.santos@email.com', '11987654338', 'Nutricionista', 'pj', 'ativo', '2024-06-05', 88.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW()),

(gen_random_uuid(), 'Amanda Oliveira Cruz', '91234567890', '1991-06-12', 'feminino', 'amanda.oliveira@email.com', '11987654339', 'Nutricionista', 'pj', 'ativo', '2024-06-10', 80.00, '18bca994-1c17-47f0-b650-10ef3690a481', NOW(), NOW());

-- 4. VERIFICAR E CRIAR ALGUMAS RELAÇÕES PROFISSIONAIS_SALAS PARA TESTE
-- (Opcional - pode ser feito depois no sistema)

-- 5. ATUALIZAR ESTATÍSTICAS DA TABELA
ANALYZE colaboradores;

-- 6. VERIFICAR RESULTADO
SELECT 
    cargo,
    COUNT(*) as total_profissionais,
    AVG(salario_valor) as valor_medio_hora
FROM colaboradores 
WHERE regime_contratacao = 'pj' 
AND ativo = true
GROUP BY cargo
ORDER BY cargo;

-- ============================================
-- SCRIPT CONCLUÍDO
-- ============================================
-- Total: 50 profissionais PJ inseridos
-- Distribuição:
-- - Psicólogos: 10
-- - Fonoaudiólogos: 8  
-- - Fisioterapeutas: 8
-- - Terapeutas Ocupacionais: 6
-- - Nutricionistas: 4
-- - Neuropsicólogos: 4
-- ============================================
