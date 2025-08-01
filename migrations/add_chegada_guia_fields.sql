-- Adicionar campos para controle de chegada e dados da guia
-- Execute este script no Supabase SQL Editor

-- Criar tabela de profissionais se não existir
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  especialidade_id UUID REFERENCES especialidades(id),
  unidade_id UUID REFERENCES unidades(id),
  telefone VARCHAR(20),
  email VARCHAR(100),
  crp VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar campo numero na tabela salas se não existir
ALTER TABLE salas 
ADD COLUMN IF NOT EXISTS numero VARCHAR(10);

-- Adicionar campos na tabela agendamentos
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS data_chegada TIMESTAMP,
ADD COLUMN IF NOT EXISTS codigo_autorizacao VARCHAR(100),
ADD COLUMN IF NOT EXISTS numero_guia VARCHAR(100),
ADD COLUMN IF NOT EXISTS data_autorizacao DATE,
ADD COLUMN IF NOT EXISTS validade_autorizacao DATE,
ADD COLUMN IF NOT EXISTS numero_agendamento VARCHAR(50),
ADD COLUMN IF NOT EXISTS convenio_id UUID REFERENCES convenios(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_chegada ON agendamentos(data_chegada);
CREATE INDEX IF NOT EXISTS idx_agendamentos_codigo_autorizacao ON agendamentos(codigo_autorizacao);
CREATE INDEX IF NOT EXISTS idx_agendamentos_numero_agendamento ON agendamentos(numero_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_agendamento ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Atualizar a view vw_agendamentos_completo para incluir os novos campos
-- Primeiro, remover a view existente
DROP VIEW IF EXISTS vw_agendamentos_completo;

-- Recriar a view com a estrutura completa
CREATE VIEW vw_agendamentos_completo AS
SELECT 
  a.id,
  a.paciente_id,
  a.profissional_id,
  a.sala_id,
  a.unidade_id,
  a.convenio_id,
  a.especialidade_id,
  a.data_agendamento,
  a.horario_inicio,
  a.horario_fim,
  a.status,
  a.observacoes,
  a.created_at,
  a.updated_at,
  a.numero_agendamento,
  a.data_chegada,
  a.codigo_autorizacao,
  a.numero_guia,
  a.data_autorizacao,
  a.validade_autorizacao,
  
  -- Campos da sala
  s.nome as sala_nome,
  s.numero as sala_numero,
  s.tipo as sala_tipo,
  s.cor as sala_cor,
  
  -- Campos do paciente
  p.nome as paciente_nome,
  p.telefone as paciente_telefone,
  
  -- Campos da unidade
  u.nome as unidade_nome,
  
  -- Campos do convênio
  c.nome as convenio_nome,
  
  -- Campos da especialidade
  e.nome as especialidade_nome,
  
  -- Campos do profissional (quando houver)
  prof.nome as profissional_nome
  
FROM agendamentos a
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN unidades u ON a.unidade_id = u.id
LEFT JOIN convenios c ON a.convenio_id = c.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN profissionais prof ON a.profissional_id = prof.id;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
