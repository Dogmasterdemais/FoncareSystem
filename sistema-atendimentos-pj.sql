-- ===== ESTRUTURA PARA CONTROLE DE ATENDIMENTOS E PAGAMENTOS PJ =====

-- 1. Tabela de Salas (já existe, mas vamos expandir)
CREATE TABLE IF NOT EXISTS salas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES unidades(id),
  numero VARCHAR(10) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo_sala VARCHAR(50) NOT NULL, -- 'atendimento', 'avaliacao', 'grupo'
  capacidade_profissionais INTEGER DEFAULT 2,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Profissionais por Sala (relacionamento N:N)
CREATE TABLE IF NOT EXISTS sala_profissionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sala_id UUID NOT NULL REFERENCES salas(id),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  data_inicio DATE NOT NULL,
  data_fim DATE NULL,
  valor_hora DECIMAL(10,2) NOT NULL, -- Valor hora específico deste profissional nesta sala
  valor_evolucao DECIMAL(10,2) NOT NULL, -- Valor por evolução
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT sala_profissionais_unique UNIQUE(sala_id, colaborador_id, data_inicio)
);

-- 3. Tabela de Atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL, -- Referência para tabela de pacientes
  sala_id UUID NOT NULL REFERENCES salas(id),
  profissional_principal_id UUID NOT NULL REFERENCES colaboradores(id),
  profissional_auxiliar_id UUID REFERENCES colaboradores(id), -- Pode ser null se for individual
  data_atendimento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_minutos INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (hora_fim - hora_inicio)) / 60
  ) STORED,
  tipo_atendimento VARCHAR(50) NOT NULL, -- 'individual', 'dupla', 'grupo'
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'realizado' CHECK (status IN ('agendado', 'realizado', 'cancelado', 'falta')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Evoluções
CREATE TABLE IF NOT EXISTS evolucoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atendimento_id UUID NOT NULL REFERENCES atendimentos(id),
  profissional_id UUID NOT NULL REFERENCES colaboradores(id),
  evolucao TEXT NOT NULL,
  objetivos_proxima_sessao TEXT,
  data_evolucao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prazo_vencimento TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (
    (SELECT created_at + INTERVAL '12 hours' FROM atendimentos WHERE id = atendimento_id)
  ) STORED,
  status VARCHAR(20) DEFAULT 'no_prazo' CHECK (status IN ('no_prazo', 'atrasada', 'vencida')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT evolucoes_unique UNIQUE(atendimento_id, profissional_id)
);

-- 5. Tabela de Fechamentos Mensais
CREATE TABLE IF NOT EXISTS fechamentos_mensais_pj (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  total_atendimentos INTEGER DEFAULT 0,
  total_horas DECIMAL(10,2) DEFAULT 0,
  total_evolucoes INTEGER DEFAULT 0,
  valor_horas DECIMAL(10,2) DEFAULT 0,
  valor_evolucoes DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  atendimentos_sem_evolucao INTEGER DEFAULT 0, -- Controle de qualidade
  evolucoes_atrasadas INTEGER DEFAULT 0,
  data_fechamento DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado', 'pago')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fechamentos_unique UNIQUE(colaborador_id, ano, mes)
);

-- 6. Tabela de Detalhes do Fechamento (itemização)
CREATE TABLE IF NOT EXISTS fechamento_detalhes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fechamento_id UUID NOT NULL REFERENCES fechamentos_mensais_pj(id),
  atendimento_id UUID NOT NULL REFERENCES atendimentos(id),
  evolucao_id UUID REFERENCES evolucoes(id),
  valor_hora DECIMAL(10,2) NOT NULL,
  valor_evolucao DECIMAL(10,2) DEFAULT 0,
  minutos_atendimento INTEGER NOT NULL,
  tem_evolucao BOOLEAN DEFAULT false,
  evolucao_no_prazo BOOLEAN DEFAULT false,
  valor_total_item DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ÍNDICES PARA PERFORMANCE =====
CREATE INDEX idx_atendimentos_data ON atendimentos(data_atendimento);
CREATE INDEX idx_atendimentos_profissional ON atendimentos(profissional_principal_id);
CREATE INDEX idx_evolucoes_prazo ON evolucoes(prazo_vencimento);
CREATE INDEX idx_fechamentos_periodo ON fechamentos_mensais_pj(ano, mes);
CREATE INDEX idx_sala_profissionais_ativo ON sala_profissionais(ativo, data_inicio, data_fim);

-- ===== TRIGGERS PARA AUTOMAÇÃO =====

-- Trigger para atualizar status da evolução baseado no prazo
CREATE OR REPLACE FUNCTION update_evolucao_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.data_evolucao <= NEW.prazo_vencimento THEN
    NEW.status = 'no_prazo';
  ELSIF NEW.data_evolucao <= NEW.prazo_vencimento + INTERVAL '24 hours' THEN
    NEW.status = 'atrasada';
  ELSE
    NEW.status = 'vencida';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evolucao_status
  BEFORE INSERT OR UPDATE ON evolucoes
  FOR EACH ROW
  EXECUTE FUNCTION update_evolucao_status();

-- ===== FUNÇÕES PARA CÁLCULOS =====

-- Função para calcular valor de um atendimento
CREATE OR REPLACE FUNCTION calcular_valor_atendimento(
  p_atendimento_id UUID,
  p_profissional_id UUID
)
RETURNS TABLE(
  valor_hora DECIMAL(10,2),
  valor_evolucao DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  tem_evolucao BOOLEAN,
  evolucao_no_prazo BOOLEAN
) AS $$
DECLARE
  v_sala_id UUID;
  v_minutos INTEGER;
  v_valor_hora DECIMAL(10,2);
  v_valor_evolucao DECIMAL(10,2);
  v_tem_evolucao BOOLEAN := false;
  v_evolucao_no_prazo BOOLEAN := false;
BEGIN
  -- Buscar dados do atendimento
  SELECT a.sala_id, a.duracao_minutos
  INTO v_sala_id, v_minutos
  FROM atendimentos a
  WHERE a.id = p_atendimento_id;
  
  -- Buscar valores do profissional na sala
  SELECT sp.valor_hora, sp.valor_evolucao
  INTO v_valor_hora, v_valor_evolucao
  FROM sala_profissionais sp
  WHERE sp.sala_id = v_sala_id 
    AND sp.colaborador_id = p_profissional_id
    AND sp.ativo = true;
  
  -- Verificar se tem evolução
  SELECT 
    EXISTS(SELECT 1 FROM evolucoes e WHERE e.atendimento_id = p_atendimento_id AND e.profissional_id = p_profissional_id),
    COALESCE((SELECT e.status = 'no_prazo' FROM evolucoes e WHERE e.atendimento_id = p_atendimento_id AND e.profissional_id = p_profissional_id), false)
  INTO v_tem_evolucao, v_evolucao_no_prazo;
  
  RETURN QUERY SELECT
    v_valor_hora,
    CASE WHEN v_tem_evolucao THEN v_valor_evolucao ELSE 0 END,
    (v_valor_hora * v_minutos / 60.0) + CASE WHEN v_tem_evolucao THEN v_valor_evolucao ELSE 0 END,
    v_tem_evolucao,
    v_evolucao_no_prazo;
END;
$$ LANGUAGE plpgsql;
