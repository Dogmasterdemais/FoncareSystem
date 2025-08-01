-- Primeiro, vamos verificar se temos especialidades cadastradas
SELECT id, nome FROM especialidades ORDER BY nome;

-- Se não tiver, vamos criar as especialidades baseadas nas salas
INSERT INTO especialidades (id, nome, ativo, created_at, updated_at) VALUES
  ('esp_anamnese', 'Anamnese', true, NOW(), NOW()),
  ('esp_educacao_fisica', 'Educação Física', true, NOW(), NOW()),
  ('esp_fisioterapia', 'Fisioterapia', true, NOW(), NOW()),
  ('esp_fonoaudiologia', 'Fonoaudiologia', true, NOW(), NOW()),
  ('esp_musicoterapia', 'Musicoterapia', true, NOW(), NOW()),
  ('esp_neuropsicologia', 'Neuropsicologia', true, NOW(), NOW()),
  ('esp_psicologia', 'Psicologia', true, NOW(), NOW()),
  ('esp_psicomotricidade', 'Psicomotricidade', true, NOW(), NOW()),
  ('esp_psicopedagogia', 'Psicopedagogia', true, NOW(), NOW()),
  ('esp_terapia_ocupacional', 'Terapia Ocupacional', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar o resultado
SELECT id, nome FROM especialidades ORDER BY nome;
