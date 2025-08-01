-- Inserir unidades com IDs corretos para corresponder às salas existentes
-- Execute este script para garantir que as unidades existam com os IDs esperados

INSERT INTO unidades (id, nome, endereco, telefone, created_at, updated_at) VALUES 
  ('85889e10-bdbb-402f-a06b-7930e4fe0b33', 'Foncare - Osasco 1', 'Rua Principal, 123 - Osasco 1', '(11) 1234-5678', NOW(), NOW()),
  ('ba2a4f33-4cfa-4530-96ee-523db17772c5', 'Foncare - São Miguel Paulista', 'Av. Norte, 456 - São Miguel Paulista', '(11) 2345-6789', NOW(), NOW()),
  ('a4429bd3-1737-43bc-920e-dae4749e20dd', 'Foncare - Osasco 2', 'Rua Sul, 789 - Osasco 2', '(11) 3456-7890', NOW(), NOW()),
  ('15ef46f7-3cf7-4c26-af91-92405834cad6', 'Foncare - Santos', 'Av. Santos, 321 - Santos', '(11) 4567-8901', NOW(), NOW()),
  ('ca28a3c6-f1a1-4c55-8f75-a15fd9ec5b30', 'Unidade Principal', 'Rua Central, 654 - Centro', '(11) 5678-9012', NOW(), NOW()),
  ('f2a39b51-c8a3-4afe-bf0d-18ed50d7a6a9', 'Penha - Matriz', 'Av. Penha, 987 - Penha', '(11) 6789-0123', NOW(), NOW()),
  ('18bca994-1c17-47f0-b650-10ef3690a481', 'Escritório', 'Rua Escritório, 147 - Centro', '(11) 7890-1234', NOW(), NOW()),
  ('4dc0ca5c-7049-40f8-9461-19afb39935ef', 'Foncare - Suzano', 'Av. Suzano, 258 - Suzano', '(11) 8901-2345', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  nome = EXCLUDED.nome,
  endereco = EXCLUDED.endereco,
  telefone = EXCLUDED.telefone,
  updated_at = NOW();
