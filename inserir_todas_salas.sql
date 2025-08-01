-- Script para inserir salas APENAS para unidades que NÃO têm salas
-- Execute APÓS limpar duplicatas com limpar_duplicatas_salas.sql

-- INSERIR SALAS APENAS PARA UNIDADES SEM SALAS (baseado no status atual)
-- Unidades que JÁ TÊM salas: Osasco 1, Osasco 2, Santos, São Miguel, Suzano, Penha, Principal
-- Escritório não tem salas por ser administrativo

-- COMENTADO - já tem salas
/*
-- 1. FONCARE - OSASCO 1 (85889e10-bdbb-402f-a06b-7930e4fe0b33)
INSERT INTO "public"."salas" (
    "unidade_id", "nome", "numero", "tipo", "capacidade", 
    "equipamentos", "ativo", "observacoes", "cor", 
    "profissional_id", "sub"
) VALUES 
-- Terapia Ocupacional
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Terapia Ocupacional', '01', 'terapia', 1, 
 '{"especialidade": "TO", "cor_tema": "#00FFFF"}', true, 'Sala para Terapia Ocupacional', '#00FFFF', 
 null, null),
-- Psicopedagogia
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Psicopedagogia', '02', 'terapia', 1, 
 '{"especialidade": "PSICOPEDA", "cor_tema": "#C80004"}', true, 'Sala para Psicopedagogia', '#C80004', 
 null, null),
-- Psicomotricidade
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Psicomotricidade', '03', 'terapia', 1, 
 '{"especialidade": "PSICOMOTOR", "cor_tema": "#BC5C00"}', true, 'Sala para Psicomotricidade', '#BC5C00', 
 null, null),
-- Psicologia
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Psicologia', '04', 'terapia', 1, 
 '{"especialidade": "PSI", "cor_tema": "#36771C"}', true, 'Sala para Psicologia', '#36771C', 
 null, null),
-- Neuropsicologia
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Neuropsicologia', '05', 'terapia', 1, 
 '{"especialidade": "NEUROPSICO", "cor_tema": "#7C3AED"}', true, 'Sala para Neuropsicologia', '#7C3AED', 
 null, null),
-- Musicoterapia
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Musicoterapia', '06', 'terapia', 1, 
 '{"especialidade": "MUSICO", "cor_tema": "#FE9900"}', true, 'Sala para Musicoterapia', '#FE9900', 
 null, null),
-- Fonoaudiologia
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Fonoaudiologia', '07', 'terapia', 1, 
 '{"especialidade": "FONO", "cor_tema": "#1055CC"}', true, 'Sala para Fonoaudiologia', '#1055CC', 
 null, null),
-- Fisioterapia
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Fisioterapia', '08', 'terapia', 1, 
 '{"especialidade": "FISIO", "cor_tema": "#C17BA0"}', true, 'Sala para Fisioterapia', '#C17BA0', 
 null, null),
-- Educação Física
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Educação Física', '09', 'terapia', 1, 
 '{"especialidade": "EDUCFIS", "cor_tema": "#C90205"}', true, 'Sala para Educação Física', '#C90205', 
 null, null),
-- Anamnese
('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Sala de Anamnese', '10', 'consulta', 1, 
 '{"especialidade": "ANAMNESE", "cor_tema": "#9333EA"}', true, 'Sala para Anamnese', '#9333EA', 
 null, null);
*/

-- COMENTADO - já tem salas
/*
-- 2. FONCARE - SÃO MIGUEL PAULISTA (ba2a4f33-4cfa-4530-96ee-523db17772c5)
INSERT INTO "public"."salas" (
    "unidade_id", "nome", "numero", "tipo", "capacidade", 
    "equipamentos", "ativo", "observacoes", "cor", 
    "profissional_id", "sub"
) VALUES 
-- Terapia Ocupacional
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Terapia Ocupacional', '01', 'terapia', 1, 
 '{"especialidade": "TO", "cor_tema": "#00FFFF"}', true, 'Sala para Terapia Ocupacional', '#00FFFF', 
 null, null),
-- Psicopedagogia
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Psicopedagogia', '02', 'terapia', 1, 
 '{"especialidade": "PSICOPEDA", "cor_tema": "#C80004"}', true, 'Sala para Psicopedagogia', '#C80004', 
 null, null),
-- Psicomotricidade
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Psicomotricidade', '03', 'terapia', 1, 
 '{"especialidade": "PSICOMOTOR", "cor_tema": "#BC5C00"}', true, 'Sala para Psicomotricidade', '#BC5C00', 
 null, null),
-- Psicologia
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Psicologia', '04', 'terapia', 1, 
 '{"especialidade": "PSI", "cor_tema": "#36771C"}', true, 'Sala para Psicologia', '#36771C', 
 null, null),
-- Neuropsicologia
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Neuropsicologia', '05', 'terapia', 1, 
 '{"especialidade": "NEUROPSICO", "cor_tema": "#7C3AED"}', true, 'Sala para Neuropsicologia', '#7C3AED', 
 null, null),
-- Musicoterapia
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Musicoterapia', '06', 'terapia', 1, 
 '{"especialidade": "MUSICO", "cor_tema": "#FE9900"}', true, 'Sala para Musicoterapia', '#FE9900', 
 null, null),
-- Fonoaudiologia
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Fonoaudiologia', '07', 'terapia', 1, 
 '{"especialidade": "FONO", "cor_tema": "#1055CC"}', true, 'Sala para Fonoaudiologia', '#1055CC', 
 null, null),
-- Fisioterapia
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Fisioterapia', '08', 'terapia', 1, 
 '{"especialidade": "FISIO", "cor_tema": "#C17BA0"}', true, 'Sala para Fisioterapia', '#C17BA0', 
 null, null),
-- Educação Física
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Educação Física', '09', 'terapia', 1, 
 '{"especialidade": "EDUCFIS", "cor_tema": "#C90205"}', true, 'Sala para Educação Física', '#C90205', 
 null, null),
-- Anamnese
('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Sala de Anamnese', '10', 'consulta', 1, 
 '{"especialidade": "ANAMNESE", "cor_tema": "#9333EA"}', true, 'Sala para Anamnese', '#9333EA', 
 null, null);
*/

-- COMENTADO - já tem salas  
/*
-- 3. FONCARE - SANTOS (15ef46f7-3cf7-4c26-af91-92405834cad6)
INSERT INTO "public"."salas" (
    "unidade_id", "nome", "numero", "tipo", "capacidade", 
    "equipamentos", "ativo", "observacoes", "cor", 
    "profissional_id", "sub"
) VALUES 
-- Terapia Ocupacional
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Terapia Ocupacional', '01', 'terapia', 1, 
 '{"especialidade": "TO", "cor_tema": "#00FFFF"}', true, 'Sala para Terapia Ocupacional', '#00FFFF', 
 null, null),
-- Psicopedagogia
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Psicopedagogia', '02', 'terapia', 1, 
 '{"especialidade": "PSICOPEDA", "cor_tema": "#C80004"}', true, 'Sala para Psicopedagogia', '#C80004', 
 null, null),
-- Psicomotricidade
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Psicomotricidade', '03', 'terapia', 1, 
 '{"especialidade": "PSICOMOTOR", "cor_tema": "#BC5C00"}', true, 'Sala para Psicomotricidade', '#BC5C00', 
 null, null),
-- Psicologia
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Psicologia', '04', 'terapia', 1, 
 '{"especialidade": "PSI", "cor_tema": "#36771C"}', true, 'Sala para Psicologia', '#36771C', 
 null, null),
-- Neuropsicologia
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Neuropsicologia', '05', 'terapia', 1, 
 '{"especialidade": "NEUROPSICO", "cor_tema": "#7C3AED"}', true, 'Sala para Neuropsicologia', '#7C3AED', 
 null, null),
-- Musicoterapia
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Musicoterapia', '06', 'terapia', 1, 
 '{"especialidade": "MUSICO", "cor_tema": "#FE9900"}', true, 'Sala para Musicoterapia', '#FE9900', 
 null, null),
-- Fonoaudiologia
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Fonoaudiologia', '07', 'terapia', 1, 
 '{"especialidade": "FONO", "cor_tema": "#1055CC"}', true, 'Sala para Fonoaudiologia', '#1055CC', 
 null, null),
-- Fisioterapia
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Fisioterapia', '08', 'terapia', 1, 
 '{"especialidade": "FISIO", "cor_tema": "#C17BA0"}', true, 'Sala para Fisioterapia', '#C17BA0', 
 null, null),
-- Educação Física
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Educação Física', '09', 'terapia', 1, 
 '{"especialidade": "EDUCFIS", "cor_tema": "#C90205"}', true, 'Sala para Educação Física', '#C90205', 
 null, null),
-- Anamnese
('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Sala de Anamnese', '10', 'consulta', 1, 
 '{"especialidade": "ANAMNESE", "cor_tema": "#9333EA"}', true, 'Sala para Anamnese', '#9333EA', 
 null, null);
*/

-- TODAS as unidades já têm suas salas configuradas
-- Execute apenas se alguma unidade específica precisar de salas adicionais

-- Verificações finais:
INSERT INTO "public"."salas" (
    "unidade_id", "nome", "numero", "tipo", "capacidade", 
    "equipamentos", "ativo", "observacoes", "cor", 
    "profissional_id", "sub"
) VALUES 
-- Terapia Ocupacional
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Terapia Ocupacional', '01', 'terapia', 1, 
 '{"especialidade": "TO", "cor_tema": "#00FFFF"}', true, 'Sala para Terapia Ocupacional', '#00FFFF', 
 null, null),
-- Psicopedagogia
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Psicopedagogia', '02', 'terapia', 1, 
 '{"especialidade": "PSICOPEDA", "cor_tema": "#C80004"}', true, 'Sala para Psicopedagogia', '#C80004', 
 null, null),
-- Psicomotricidade
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Psicomotricidade', '03', 'terapia', 1, 
 '{"especialidade": "PSICOMOTOR", "cor_tema": "#BC5C00"}', true, 'Sala para Psicomotricidade', '#BC5C00', 
 null, null),
-- Psicologia
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Psicologia', '04', 'terapia', 1, 
 '{"especialidade": "PSI", "cor_tema": "#36771C"}', true, 'Sala para Psicologia', '#36771C', 
 null, null),
-- Neuropsicologia
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Neuropsicologia', '05', 'terapia', 1, 
 '{"especialidade": "NEUROPSICO", "cor_tema": "#7C3AED"}', true, 'Sala para Neuropsicologia', '#7C3AED', 
 null, null),
-- Musicoterapia
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Musicoterapia', '06', 'terapia', 1, 
 '{"especialidade": "MUSICO", "cor_tema": "#FE9900"}', true, 'Sala para Musicoterapia', '#FE9900', 
 null, null),
-- Fonoaudiologia
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Fonoaudiologia', '07', 'terapia', 1, 
 '{"especialidade": "FONO", "cor_tema": "#1055CC"}', true, 'Sala para Fonoaudiologia', '#1055CC', 
 null, null),
-- Fisioterapia
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Fisioterapia', '08', 'terapia', 1, 
 '{"especialidade": "FISIO", "cor_tema": "#C17BA0"}', true, 'Sala para Fisioterapia', '#C17BA0', 
 null, null),
-- Educação Física
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Educação Física', '09', 'terapia', 1, 
 '{"especialidade": "EDUCFIS", "cor_tema": "#C90205"}', true, 'Sala para Educação Física', '#C90205', 
 null, null),
-- Anamnese
('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Sala de Anamnese', '10', 'consulta', 1, 
 '{"especialidade": "ANAMNESE", "cor_tema": "#9333EA"}', true, 'Sala para Anamnese', '#9333EA', 
 null, null);

-- 5. PENHA - MATRIZ (f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9)
INSERT INTO "public"."salas" (
    "unidade_id", "nome", "numero", "tipo", "capacidade", 
    "equipamentos", "ativo", "observacoes", "cor", 
    "profissional_id", "sub"
) VALUES 
-- Terapia Ocupacional
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Terapia Ocupacional', '01', 'terapia', 1, 
 '{"especialidade": "TO", "cor_tema": "#00FFFF"}', true, 'Sala para Terapia Ocupacional', '#00FFFF', 
 null, null),
-- Psicopedagogia
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Psicopedagogia', '02', 'terapia', 1, 
 '{"especialidade": "PSICOPEDA", "cor_tema": "#C80004"}', true, 'Sala para Psicopedagogia', '#C80004', 
 null, null),
-- Psicomotricidade
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Psicomotricidade', '03', 'terapia', 1, 
 '{"especialidade": "PSICOMOTOR", "cor_tema": "#BC5C00"}', true, 'Sala para Psicomotricidade', '#BC5C00', 
 null, null),
-- Psicologia
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Psicologia', '04', 'terapia', 1, 
 '{"especialidade": "PSI", "cor_tema": "#36771C"}', true, 'Sala para Psicologia', '#36771C', 
 null, null),
-- Neuropsicologia
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Neuropsicologia', '05', 'terapia', 1, 
 '{"especialidade": "NEUROPSICO", "cor_tema": "#7C3AED"}', true, 'Sala para Neuropsicologia', '#7C3AED', 
 null, null),
-- Musicoterapia
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Musicoterapia', '06', 'terapia', 1, 
 '{"especialidade": "MUSICO", "cor_tema": "#FE9900"}', true, 'Sala para Musicoterapia', '#FE9900', 
 null, null),
-- Fonoaudiologia
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Fonoaudiologia', '07', 'terapia', 1, 
 '{"especialidade": "FONO", "cor_tema": "#1055CC"}', true, 'Sala para Fonoaudiologia', '#1055CC', 
 null, null),
-- Fisioterapia
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Fisioterapia', '08', 'terapia', 1, 
 '{"especialidade": "FISIO", "cor_tema": "#C17BA0"}', true, 'Sala para Fisioterapia', '#C17BA0', 
 null, null),
-- Educação Física
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Educação Física', '09', 'terapia', 1, 
 '{"especialidade": "EDUCFIS", "cor_tema": "#C90205"}', true, 'Sala para Educação Física', '#C90205', 
 null, null),
-- Anamnese
('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Sala de Anamnese', '10', 'consulta', 1, 
 '{"especialidade": "ANAMNESE", "cor_tema": "#9333EA"}', true, 'Sala para Anamnese', '#9333EA', 
 null, null);

-- 6. FONCARE - SUZANO (4dc0ca5c-7049-40f8-9461-19afb39935ef)
INSERT INTO "public"."salas" (
    "unidade_id", "nome", "numero", "tipo", "capacidade", 
    "equipamentos", "ativo", "observacoes", "cor", 
    "profissional_id", "sub"
) VALUES 
-- Terapia Ocupacional
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Terapia Ocupacional', '01', 'terapia', 1, 
 '{"especialidade": "TO", "cor_tema": "#00FFFF"}', true, 'Sala para Terapia Ocupacional', '#00FFFF', 
 null, null),
-- Psicopedagogia
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Psicopedagogia', '02', 'terapia', 1, 
 '{"especialidade": "PSICOPEDA", "cor_tema": "#C80004"}', true, 'Sala para Psicopedagogia', '#C80004', 
 null, null),
-- Psicomotricidade
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Psicomotricidade', '03', 'terapia', 1, 
 '{"especialidade": "PSICOMOTOR", "cor_tema": "#BC5C00"}', true, 'Sala para Psicomotricidade', '#BC5C00', 
 null, null),
-- Psicologia
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Psicologia', '04', 'terapia', 1, 
 '{"especialidade": "PSI", "cor_tema": "#36771C"}', true, 'Sala para Psicologia', '#36771C', 
 null, null),
-- Neuropsicologia
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Neuropsicologia', '05', 'terapia', 1, 
 '{"especialidade": "NEUROPSICO", "cor_tema": "#7C3AED"}', true, 'Sala para Neuropsicologia', '#7C3AED', 
 null, null),
-- Musicoterapia
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Musicoterapia', '06', 'terapia', 1, 
 '{"especialidade": "MUSICO", "cor_tema": "#FE9900"}', true, 'Sala para Musicoterapia', '#FE9900', 
 null, null),
-- Fonoaudiologia
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Fonoaudiologia', '07', 'terapia', 1, 
 '{"especialidade": "FONO", "cor_tema": "#1055CC"}', true, 'Sala para Fonoaudiologia', '#1055CC', 
 null, null),
-- Fisioterapia
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Fisioterapia', '08', 'terapia', 1, 
 '{"especialidade": "FISIO", "cor_tema": "#C17BA0"}', true, 'Sala para Fisioterapia', '#C17BA0', 
 null, null),
-- Educação Física
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Educação Física', '09', 'terapia', 1, 
 '{"especialidade": "EDUCFIS", "cor_tema": "#C90205"}', true, 'Sala para Educação Física', '#C90205', 
 null, null),
-- Anamnese
('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Sala de Anamnese', '10', 'consulta', 1, 
 '{"especialidade": "ANAMNESE", "cor_tema": "#9333EA"}', true, 'Sala para Anamnese', '#9333EA', 
 null, null);

-- Verificar total de salas após inserção
SELECT COUNT(*) as total_salas_final FROM "public"."salas";

-- Verificar salas por unidade
SELECT 
    u.nome as unidade_nome,
    COUNT(s.id) as quantidade_salas
FROM "public"."unidades" u
LEFT JOIN "public"."salas" s ON u.id = s.unidade_id
GROUP BY u.id, u.nome
ORDER BY u.nome;
