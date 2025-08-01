-- Script para inserir dados limpos na nova tabela salas
-- Execute APÓS rodar recriar_salas_vazia.sql

-- Exemplo de inserção para algumas salas principais
-- Você pode ajustar os UUIDs e adicionar profissional_id e sub conforme necessário

-- Salas para Foncare - Osasco 2 (a4429bd3-1737-43bc-920e-dae4749e20dd)
INSERT INTO "public"."salas" (
    "unidade_id", "nome", "numero", "tipo", "capacidade", 
    "equipamentos", "ativo", "observacoes", "cor", 
    "profissional_id", "sub"
) VALUES 
-- Terapia Ocupacional
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Terapia Ocupacional', '01', 'terapia', 1, 
 '{"especialidade": "TO", "cor_tema": "#00FFFF"}', true, 'Sala para Terapia Ocupacional', '#00FFFF', 
 null, null),

-- Psicopedagogia
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Psicopedagogia', '02', 'terapia', 1, 
 '{"especialidade": "PSICOPEDA", "cor_tema": "#C80004"}', true, 'Sala para Psicopedagogia', '#C80004', 
 null, null),

-- Psicomotricidade
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Psicomotricidade', '03', 'terapia', 1, 
 '{"especialidade": "PSICOMOTOR", "cor_tema": "#BC5C00"}', true, 'Sala para Psicomotricidade', '#BC5C00', 
 null, null),

-- Psicologia
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Psicologia', '04', 'terapia', 1, 
 '{"especialidade": "PSI", "cor_tema": "#36771C"}', true, 'Sala para Psicologia', '#36771C', 
 null, null),

-- Neuropsicologia
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Neuropsicologia', '05', 'terapia', 1, 
 '{"especialidade": "NEUROPSICO", "cor_tema": "#7C3AED"}', true, 'Sala para Neuropsicologia', '#7C3AED', 
 null, null),

-- Musicoterapia
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Musicoterapia', '06', 'terapia', 1, 
 '{"especialidade": "MUSICO", "cor_tema": "#FE9900"}', true, 'Sala para Musicoterapia', '#FE9900', 
 null, null),

-- Fonoaudiologia
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Fonoaudiologia', '07', 'terapia', 1, 
 '{"especialidade": "FONO", "cor_tema": "#1055CC"}', true, 'Sala para Fonoaudiologia', '#1055CC', 
 null, null),

-- Fisioterapia
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Fisioterapia', '08', 'terapia', 1, 
 '{"especialidade": "FISIO", "cor_tema": "#C17BA0"}', true, 'Sala para Fisioterapia', '#C17BA0', 
 null, null),

-- Educação Física
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Educação Física', '09', 'terapia', 1, 
 '{"especialidade": "EDUCFIS", "cor_tema": "#C90205"}', true, 'Sala para Educação Física', '#C90205', 
 null, null),

-- Anamnese
('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Sala de Anamnese', '10', 'consulta', 1, 
 '{"especialidade": "ANAMNESE", "cor_tema": "#9333EA"}', true, 'Sala para Anamnese', '#9333EA', 
 null, null);

-- Verificar inserção
SELECT COUNT(*) as total_inserido FROM "public"."salas";
SELECT nome, numero, tipo, cor FROM "public"."salas" WHERE unidade_id = 'a4429bd3-1737-43bc-920e-dae4749e20dd' ORDER BY numero;
