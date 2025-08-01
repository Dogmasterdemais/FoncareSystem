-- Migração para expandir a tabela pacientes com todos os campos necessários
-- Execute estas queries no Supabase SQL Editor

-- Adicionar novos campos à tabela pacientes
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS sexo VARCHAR(1),
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS rg VARCHAR(20),
ADD COLUMN IF NOT EXISTS documento VARCHAR(20),
ADD COLUMN IF NOT EXISTS cep VARCHAR(9),
ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255),
ADD COLUMN IF NOT EXISTS numero VARCHAR(10),
ADD COLUMN IF NOT EXISTS complemento VARCHAR(100),
ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS uf VARCHAR(2),
ADD COLUMN IF NOT EXISTS convenio_id UUID,
ADD COLUMN IF NOT EXISTS numero_carteirinha VARCHAR(50),
ADD COLUMN IF NOT EXISTS validade_carteira DATE,
ADD COLUMN IF NOT EXISTS profissao VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(20),
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS responsavel_nome VARCHAR(100),
ADD COLUMN IF NOT EXISTS responsavel_telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS responsavel_parentesco VARCHAR(50),
ADD COLUMN IF NOT EXISTS responsavel_cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS unidade_id UUID;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_rg ON pacientes(rg);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_telefone ON pacientes(telefone);
CREATE INDEX IF NOT EXISTS idx_pacientes_ativo ON pacientes(ativo);
CREATE INDEX IF NOT EXISTS idx_pacientes_created_at ON pacientes(created_at);

-- Criar tabela de convenios se não existir
CREATE TABLE IF NOT EXISTS convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(20),
  tipo VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de unidades se não existir
CREATE TABLE IF NOT EXISTS unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  endereco VARCHAR(255),
  telefone VARCHAR(20),
  email VARCHAR(100),
  responsavel VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir dados de exemplo para convenios
INSERT INTO convenios (nome, codigo, tipo) VALUES 
('Particular', 'PART', 'Particular'),
('SUS', 'SUS', 'Público'),
('Unimed', 'UNIMED', 'Plano de Saúde'),
('Bradesco Saúde', 'BRADESCO', 'Plano de Saúde'),
('Amil', 'AMIL', 'Plano de Saúde')
ON CONFLICT DO NOTHING;

-- Inserir dados de exemplo para unidades
INSERT INTO unidades (nome, endereco, telefone) VALUES 
('Unidade Central', 'Rua Principal, 100 - Centro', '(11) 1234-5678'),
('Unidade Norte', 'Av. Norte, 200 - Zona Norte', '(11) 2345-6789'),
('Unidade Sul', 'Rua Sul, 300 - Zona Sul', '(11) 3456-7890')
ON CONFLICT DO NOTHING;

-- Criar foreign keys
ALTER TABLE pacientes 
ADD CONSTRAINT fk_pacientes_convenio 
FOREIGN KEY (convenio_id) REFERENCES convenios(id);

ALTER TABLE pacientes 
ADD CONSTRAINT fk_pacientes_unidade 
FOREIGN KEY (unidade_id) REFERENCES unidades(id);

-- Criar view para relatórios
CREATE OR REPLACE VIEW vw_pacientes_completo AS
SELECT 
  p.*,
  c.nome as convenio_nome,
  c.tipo as convenio_tipo,
  u.nome as unidade_nome,
  u.endereco as unidade_endereco,
  CASE 
    WHEN p.data_nascimento IS NOT NULL 
    THEN DATE_PART('year', AGE(p.data_nascimento))
    ELSE NULL
  END as idade
FROM pacientes p
LEFT JOIN convenios c ON p.convenio_id = c.id
LEFT JOIN unidades u ON p.unidade_id = u.id;

-- Comentários nas colunas
COMMENT ON COLUMN pacientes.sexo IS 'M=Masculino, F=Feminino, O=Outro';
COMMENT ON COLUMN pacientes.cpf IS 'CPF do paciente (formato: 000.000.000-00)';
COMMENT ON COLUMN pacientes.rg IS 'RG do paciente';
COMMENT ON COLUMN pacientes.documento IS 'Documento geral (pode ser usado para outros tipos de documento)';
COMMENT ON COLUMN pacientes.ativo IS 'true=Ativo, false=Inativo';
COMMENT ON COLUMN pacientes.estado_civil IS 'Solteiro, Casado, Divorciado, Viúvo';
COMMENT ON COLUMN pacientes.responsavel_parentesco IS 'Pai, Mãe, Responsável Legal, etc.';

-- Função para calcular idade
CREATE OR REPLACE FUNCTION calcular_idade(data_nascimento DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(data_nascimento));
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar campo updated_at se adicionarmos no futuro
-- ALTER TABLE pacientes ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
