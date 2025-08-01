-- Adicionar coluna unidade_id na tabela profissionais se não existir
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id);

-- Atualizar profissionais existentes para ter unidade_id = 1 (NAC)
UPDATE profissionais 
SET unidade_id = (SELECT id FROM unidades WHERE nome = 'NAC - Núcleo de Apoio à Criança' LIMIT 1)
WHERE unidade_id IS NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profissionais_unidade ON profissionais(unidade_id);

-- Adicionar alguns profissionais de teste para diferentes unidades
INSERT INTO profissionais (nome, especialidade_id, unidade_id, email, telefone, crf, ativo) VALUES
-- Unidade NAC (id=1) 
('Dra. Mariana Silva', 1, (SELECT id FROM unidades WHERE nome = 'NAC - Núcleo de Apoio à Criança' LIMIT 1), 'mariana.silva@foncare.com', '(11) 98765-4321', 'CRP 06/123456', true),
('Dr. Ricardo Oliveira', 2, (SELECT id FROM unidades WHERE nome = 'NAC - Núcleo de Apoio à Criança' LIMIT 1), 'ricardo.oliveira@foncare.com', '(11) 98765-4322', 'CRM 123456', true),
('Dra. Patricia Costa', 3, (SELECT id FROM unidades WHERE nome = 'NAC - Núcleo de Apoio à Criança' LIMIT 1), 'patricia.costa@foncare.com', '(11) 98765-4323', 'CREFITO 12345', true),
('Dra. Ana Paula Rocha', 4, (SELECT id FROM unidades WHERE nome = 'NAC - Núcleo de Apoio à Criança' LIMIT 1), 'ana.rocha@foncare.com', '(11) 98765-4324', 'CRP 06/789012', true),
('Dr. Fernando Alves', 5, (SELECT id FROM unidades WHERE nome = 'NAC - Núcleo de Apoio à Criança' LIMIT 1), 'fernando.alves@foncare.com', '(11) 98765-4325', 'CRM 789012', true),

-- Unidade Clínica Central (id=2)
('Dr. Eduardo Campos', 1, (SELECT id FROM unidades WHERE nome = 'Clínica Central' LIMIT 1), 'eduardo.campos@foncare.com', '(11) 97654-3210', 'CRP 06/567890', true),
('Dra. Camila Fernandes', 2, (SELECT id FROM unidades WHERE nome = 'Clínica Central' LIMIT 1), 'camila.fernandes@foncare.com', '(11) 97654-3211', 'CRM 567890', true),
('Dr. Rafael Martins', 3, (SELECT id FROM unidades WHERE nome = 'Clínica Central' LIMIT 1), 'rafael.martins@foncare.com', '(11) 97654-3212', 'CREFITO 90123', true),

-- Unidade Especializada (id=3)
('Dr. Joaquim Freitas', 1, (SELECT id FROM unidades WHERE nome = 'Unidade Especializada' LIMIT 1), 'joaquim.freitas@foncare.com', '(11) 96543-2109', 'CRP 06/456789', true),
('Dra. Larissa Moura', 2, (SELECT id FROM unidades WHERE nome = 'Unidade Especializada' LIMIT 1), 'larissa.moura@foncare.com', '(11) 96543-2108', 'CRM 456789', true)
ON CONFLICT (email) DO NOTHING;

-- Verificar o resultado
SELECT 
  p.nome, 
  p.email, 
  e.nome as especialidade, 
  u.nome as unidade 
FROM profissionais p
LEFT JOIN especialidades e ON p.especialidade_id = e.id
LEFT JOIN unidades u ON p.unidade_id = u.id
WHERE p.ativo = true
ORDER BY u.nome, p.nome;
