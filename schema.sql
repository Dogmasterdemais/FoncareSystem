-- Estrutura inicial do banco de dados para Supabase (PostgreSQL)

-- Tabela de Unidades
CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Especialidades
CREATE TABLE especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(7) DEFAULT '#808080',
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Convênios
CREATE TABLE convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(50),
  contato TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Salas
CREATE TABLE salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(7) DEFAULT '#808080',
  tipo VARCHAR(50),
  especialidade_id UUID REFERENCES especialidades(id),
  unidade_id UUID REFERENCES unidades(id) NOT NULL,
  capacidade_maxima INTEGER DEFAULT 6,
  capacidade_criancas INTEGER DEFAULT 6,
  capacidade_profissionais INTEGER DEFAULT 3,
  equipamentos JSONB DEFAULT '[]',
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adicionando campos necessários para colaboradores (valores hora para PJ)
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS valor_hora_pj NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS valor_hora_clt NUMERIC(10,2);

CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20),
  data_nascimento DATE,
  documento VARCHAR(20),
  cpf VARCHAR(14),
  unidade_id UUID REFERENCES unidades(id),
  convenio_id UUID REFERENCES convenios(id),
  convenio_nome VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id),
  profissional_id UUID,
  especialidade_id UUID REFERENCES especialidades(id),
  sala_id UUID REFERENCES salas(id),
  unidade_id UUID REFERENCES unidades(id),
  data_agendamento DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  duracao_minutos INTEGER DEFAULT 60,
  status VARCHAR(20) DEFAULT 'agendado',
  tipo_sessao VARCHAR(100),
  modalidade VARCHAR(100),
  is_neuropsicologia BOOLEAN DEFAULT false,
  sessao_sequencia INTEGER DEFAULT 1,
  total_sessoes INTEGER DEFAULT 1,
  agendamento_pai_id UUID REFERENCES agendamentos(id),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id),
  tipo VARCHAR(20),
  valor NUMERIC(10,2),
  data TIMESTAMP,
  descricao TEXT,
  unidade_id UUID REFERENCES unidades(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  unidade_id UUID REFERENCES unidades(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- === TABELAS DO SISTEMA DE RH ===

-- Tabela de Colaboradores (expandida)
CREATE TABLE colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo VARCHAR(150) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  data_nascimento DATE,
  sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
  estado_civil VARCHAR(20),
  email_pessoal VARCHAR(100),
  email_corporativo VARCHAR(100),
  telefone_celular VARCHAR(20),
  telefone_fixo VARCHAR(20),
  endereco_completo TEXT,
  cep VARCHAR(10),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  pais VARCHAR(50) DEFAULT 'Brasil',
  
  -- Dados profissionais
  cargo VARCHAR(100) NOT NULL,
  setor VARCHAR(100),
  regime_contratacao VARCHAR(20) NOT NULL CHECK (regime_contratacao IN ('clt', 'pj', 'autonomo', 'estagiario', 'terceirizado', 'cooperado')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'afastado', 'demitido', 'aposentado', 'licenca')),
  data_admissao DATE NOT NULL,
  data_demissao DATE,
  motivo_desligamento TEXT,
  unidade_id UUID REFERENCES unidades(id) NOT NULL,
  
  -- Dados salariais
  salario_valor NUMERIC(10,2),
  tipo_salario VARCHAR(20) DEFAULT 'mensal' CHECK (tipo_salario IN ('mensal', 'quinzenal', 'semanal', 'diario', 'hora')),
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  tipo_conta VARCHAR(20),
  pix_chave VARCHAR(100),
  
  -- Dados complementares
  escolaridade VARCHAR(50),
  profissao_anterior VARCHAR(100),
  tem_dependentes BOOLEAN DEFAULT false,
  total_dependentes INTEGER DEFAULT 0,
  observacoes TEXT,
  foto_url TEXT,
  
  -- Documentos e registros
  ctps_numero VARCHAR(20),
  ctps_serie VARCHAR(10),
  ctps_uf VARCHAR(2),
  pis_pasep VARCHAR(20),
  titulo_eleitor VARCHAR(20),
  reservista VARCHAR(30),
  cnh_numero VARCHAR(20),
  cnh_categoria VARCHAR(5),
  cnh_vencimento DATE,
  
  -- Contatos de emergência
  contato_emergencia_nome VARCHAR(100),
  contato_emergencia_telefone VARCHAR(20),
  contato_emergencia_parentesco VARCHAR(50),
  
  -- Auditoria
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Dependentes
CREATE TABLE dependentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  nome_completo VARCHAR(150) NOT NULL,
  cpf VARCHAR(14),
  data_nascimento DATE NOT NULL,
  parentesco VARCHAR(50) NOT NULL,
  sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
  tem_ir BOOLEAN DEFAULT false,
  tem_salario_familia BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Descontos (nova funcionalidade solicitada)
CREATE TABLE descontos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo_desconto VARCHAR(50) NOT NULL,
  descricao TEXT,
  valor NUMERIC(10,2) NOT NULL,
  tipo_valor VARCHAR(20) DEFAULT 'fixo' CHECK (tipo_valor IN ('fixo', 'percentual')),
  mes_referencia INTEGER CHECK (mes_referencia BETWEEN 1 AND 12),
  ano_referencia INTEGER,
  data_inicio DATE,
  data_fim DATE,
  recorrente BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Folha de Pagamento CLT
CREATE TABLE folha_pagamento_clt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes_referencia INTEGER NOT NULL CHECK (mes_referencia BETWEEN 1 AND 12),
  ano_referencia INTEGER NOT NULL,
  
  -- Vencimentos
  salario_base NUMERIC(10,2) NOT NULL,
  horas_extras NUMERIC(10,2) DEFAULT 0,
  adicional_noturno NUMERIC(10,2) DEFAULT 0,
  adicional_periculosidade NUMERIC(10,2) DEFAULT 0,
  adicional_insalubridade NUMERIC(10,2) DEFAULT 0,
  comissoes NUMERIC(10,2) DEFAULT 0,
  bonus NUMERIC(10,2) DEFAULT 0,
  vale_transporte NUMERIC(10,2) DEFAULT 0,
  vale_refeicao NUMERIC(10,2) DEFAULT 0,
  vale_alimentacao NUMERIC(10,2) DEFAULT 0,
  outros_vencimentos NUMERIC(10,2) DEFAULT 0,
  total_vencimentos NUMERIC(10,2) NOT NULL,
  
  -- Descontos obrigatórios
  inss NUMERIC(10,2) DEFAULT 0,
  irrf NUMERIC(10,2) DEFAULT 0,
  fgts NUMERIC(10,2) DEFAULT 0,
  
  -- Descontos adicionais
  desconto_vale_transporte NUMERIC(10,2) DEFAULT 0,
  desconto_vale_refeicao NUMERIC(10,2) DEFAULT 0,
  desconto_plano_saude NUMERIC(10,2) DEFAULT 0,
  desconto_plano_odonto NUMERIC(10,2) DEFAULT 0,
  adiantamento NUMERIC(10,2) DEFAULT 0,
  emprestimo NUMERIC(10,2) DEFAULT 0,
  outros_descontos NUMERIC(10,2) DEFAULT 0,
  total_descontos NUMERIC(10,2) NOT NULL,
  
  -- Resultado
  salario_liquido NUMERIC(10,2) NOT NULL,
  
  -- Status e controle
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga', 'cancelada')),
  data_pagamento DATE,
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(colaborador_id, mes_referencia, ano_referencia)
);

-- Tabela de Folha de Pagamento PJ
CREATE TABLE folha_pagamento_pj (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes_referencia INTEGER NOT NULL CHECK (mes_referencia BETWEEN 1 AND 12),
  ano_referencia INTEGER NOT NULL,
  
  -- Dados PJ
  cnpj VARCHAR(18),
  razao_social VARCHAR(150),
  
  -- Valores
  valor_bruto NUMERIC(10,2) NOT NULL,
  iss NUMERIC(10,2) DEFAULT 0,
  ir_fonte NUMERIC(10,2) DEFAULT 0,
  csll NUMERIC(10,2) DEFAULT 0,
  cofins NUMERIC(10,2) DEFAULT 0,
  pis NUMERIC(10,2) DEFAULT 0,
  outros_descontos NUMERIC(10,2) DEFAULT 0,
  total_descontos NUMERIC(10,2) NOT NULL,
  valor_liquido NUMERIC(10,2) NOT NULL,
  
  -- Status e controle
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga', 'cancelada')),
  data_pagamento DATE,
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(colaborador_id, mes_referencia, ano_referencia)
);

-- Tabela de Registros de Ponto
CREATE TABLE registros_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  data_registro DATE NOT NULL,
  entrada TIME,
  saida_almoco TIME,
  retorno_almoco TIME,
  saida TIME,
  horas_trabalhadas VARCHAR(10),
  horas_extras VARCHAR(10),
  observacoes TEXT,
  justificativa TEXT,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  aprovado_por UUID,
  data_aprovacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(colaborador_id, data_registro)
);

-- Tabela de Banco de Horas
CREATE TABLE banco_horas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes_referencia INTEGER NOT NULL CHECK (mes_referencia BETWEEN 1 AND 12),
  ano_referencia INTEGER NOT NULL,
  saldo_anterior VARCHAR(10) DEFAULT '00:00',
  horas_positivas VARCHAR(10) DEFAULT '00:00',
  horas_negativas VARCHAR(10) DEFAULT '00:00',
  saldo_atual VARCHAR(10) DEFAULT '00:00',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(colaborador_id, mes_referencia, ano_referencia)
);

-- Tabela de Documentos do Colaborador
CREATE TABLE colaborador_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(50) NOT NULL,
  nome_arquivo VARCHAR(200) NOT NULL,
  arquivo_url TEXT NOT NULL,
  tamanho_bytes INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Histórico de Alterações
CREATE TABLE colaborador_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  campo_alterado VARCHAR(100) NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  motivo TEXT,
  alterado_por UUID,
  data_alteracao TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pacientes_unidade ON pacientes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_salas_unidade ON salas(unidade_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_unidade ON agendamentos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Índices para tabelas de RH
CREATE INDEX IF NOT EXISTS idx_colaboradores_unidade ON colaboradores(unidade_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON colaboradores(status);
CREATE INDEX IF NOT EXISTS idx_colaboradores_cpf ON colaboradores(cpf);
CREATE INDEX IF NOT EXISTS idx_dependentes_colaborador ON dependentes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_descontos_colaborador ON descontos(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_folha_clt_colaborador ON folha_pagamento_clt(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_folha_pj_colaborador ON folha_pagamento_pj(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_registros_ponto_colaborador ON registros_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_registros_ponto_data ON registros_ponto(data_registro);
CREATE INDEX IF NOT EXISTS idx_banco_horas_colaborador ON banco_horas(colaborador_id);

-- Dados iniciais das unidades
INSERT INTO unidades (nome, endereco, telefone) VALUES 
  ('Unidade Central', 'Rua Principal, 123', '(11) 1234-5678'),
  ('Unidade Norte', 'Av. Norte, 456', '(11) 2345-6789'),
  ('Unidade Sul', 'Rua Sul, 789', '(11) 3456-7890')
ON CONFLICT DO NOTHING;

-- Dados iniciais das especialidades
INSERT INTO especialidades (nome, cor) VALUES 
  ('Fonoaudiologia', '#0052CC'),
  ('Terapia Ocupacional', '#00E6F6'),
  ('Psicologia', '#38712F'),
  ('Psicopedagogia', '#D20000'),
  ('Neuropsicopedagogia', '#D20000'),
  ('Educador Físico', '#B45A00'),
  ('Psicomotricidade', '#F58B00'),
  ('Musicoterapia', '#F5C344'),
  ('Ludoterapia', '#F5C344'),
  ('Arterapia', '#F5C344'),
  ('Fisioterapia', '#C47B9C'),
  ('Anamnese', '#808080'),
  ('Neuropsicologia', '#000000')
ON CONFLICT DO NOTHING;

-- Dados iniciais dos convênios
INSERT INTO convenios (nome, codigo) VALUES 
  ('SUS', 'SUS001'),
  ('Bradesco Saúde', 'BRA001'),
  ('Amil', 'AMI001'),
  ('Unimed', 'UNI001'),
  ('Particular', 'PAR001')
ON CONFLICT DO NOTHING;

-- Dados iniciais das salas (exemplo para cada unidade)
INSERT INTO salas (nome, cor, tipo, unidade_id) 
SELECT 
  'Sala ' || (ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY u.nome)),
  '#4F46E5',
  'Atendimento Individual',
  u.id
FROM unidades u
WHERE u.ativo = true
ON CONFLICT DO NOTHING;

-- Dados iniciais de colaboradores (exemplos)
INSERT INTO colaboradores (
  nome_completo, cpf, cargo, regime_contratacao, status, data_admissao, 
  salario_valor, unidade_id, email_pessoal, telefone_celular
) 
SELECT 
  'João Silva Santos', '123.456.789-01', 'Fisioterapeuta', 'clt', 'ativo', '2024-01-15',
  4500.00, u.id, 'joao.silva@email.com', '(11) 99999-9999'
FROM unidades u WHERE u.nome = 'Unidade Central'
UNION ALL
SELECT 
  'Maria Oliveira Costa', '987.654.321-02', 'Psicóloga', 'pj', 'ativo', '2024-02-01',
  3800.00, u.id, 'maria.oliveira@email.com', '(11) 88888-8888'
FROM unidades u WHERE u.nome = 'Unidade Norte'
UNION ALL
SELECT 
  'Carlos Eduardo Lima', '456.789.123-03', 'Recepcionista', 'clt', 'ativo', '2024-03-10',
  2200.00, u.id, 'carlos.lima@email.com', '(11) 77777-7777'
FROM unidades u WHERE u.nome = 'Unidade Central'
ON CONFLICT (cpf) DO NOTHING;

-- Views para dashboard
CREATE VIEW vw_agendamentos_diarios AS
SELECT data::date AS dia, COUNT(*) AS total
FROM agendamentos
GROUP BY dia
ORDER BY dia DESC;

CREATE VIEW vw_financeiro_mensal AS
SELECT date_trunc('month', data) AS mes, SUM(valor) AS total
FROM financeiro
GROUP BY mes
ORDER BY mes DESC;

-- Views para RH
CREATE VIEW vw_colaboradores_ativos AS
SELECT 
  c.*,
  u.nome as unidade_nome,
  COUNT(d.id) as total_dependentes
FROM colaboradores c
LEFT JOIN unidades u ON c.unidade_id = u.id
LEFT JOIN dependentes d ON c.id = d.colaborador_id
WHERE c.ativo = true AND c.status = 'ativo'
GROUP BY c.id, u.nome;

CREATE VIEW vw_folha_resumo AS
SELECT 
  c.id,
  c.nome_completo,
  c.cargo,
  c.regime_contratacao,
  COALESCE(fclt.salario_liquido, fpj.valor_liquido) as valor_liquido,
  COALESCE(fclt.status, fpj.status) as status_folha,
  COALESCE(fclt.mes_referencia, fpj.mes_referencia) as mes_ref,
  COALESCE(fclt.ano_referencia, fpj.ano_referencia) as ano_ref
FROM colaboradores c
LEFT JOIN folha_pagamento_clt fclt ON c.id = fclt.colaborador_id 
LEFT JOIN folha_pagamento_pj fpj ON c.id = fpj.colaborador_id
WHERE c.ativo = true;

-- Triggers para auditoria
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folha_clt_updated_at BEFORE UPDATE ON folha_pagamento_clt
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folha_pj_updated_at BEFORE UPDATE ON folha_pagamento_pj
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banco_horas_updated_at BEFORE UPDATE ON banco_horas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- EXTENSÕES PARA MÓDULO TERAPÊUTICO AVANÇADO
-- ========================================

-- Tabela para múltiplas especialidades por sala
CREATE TABLE sala_especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id UUID REFERENCES salas(id) ON DELETE CASCADE,
  especialidade_id UUID REFERENCES especialidades(id) ON DELETE CASCADE,
  is_principal BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(sala_id, especialidade_id)
);

-- Adicionando novos campos na tabela agendamentos para controle terapêutico
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS status_terapeutico VARCHAR(30) DEFAULT 'agendado',
ADD COLUMN IF NOT EXISTS horario_chegada TIMESTAMP,
ADD COLUMN IF NOT EXISTS horario_inicio_real TIMESTAMP,
ADD COLUMN IF NOT EXISTS horario_fim_real TIMESTAMP,
ADD COLUMN IF NOT EXISTS duracao_real_minutos INTEGER,
ADD COLUMN IF NOT EXISTS evolucao_realizada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS supervisionado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS liberado_pagamento BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS observacoes_supervisao TEXT;

-- Constraint para status terapêutico
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS check_status_terapeutico;
ALTER TABLE agendamentos ADD CONSTRAINT check_status_terapeutico 
CHECK (status_terapeutico IN (
  'agendado', 'chegou', 'pronto_para_terapia', 'em_atendimento', 
  'sessao_concluida', 'nao_compareceu', 'cancelado', 'encerrado_antecipadamente'
));

-- Tabela de alocação de profissionais em salas por turno
CREATE TABLE profissionais_salas_turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  sala_id UUID REFERENCES salas(id) ON DELETE CASCADE,
  turno VARCHAR(10) CHECK (turno IN ('manha', 'tarde', 'noite')),
  dia_semana INTEGER CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Segunda, 7=Domingo
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profissional_id, sala_id, turno, dia_semana, data_inicio)
);

-- Tabela de ocorrências da recepção
CREATE TABLE ocorrencias_recepcao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id),
  tipo_ocorrencia VARCHAR(30) CHECK (tipo_ocorrencia IN (
    'atraso', 'falha_convenio', 'ausencia_guia', 'falta', 
    'encerramento_antecipado', 'problema_comportamental', 'emergencia'
  )),
  descricao TEXT NOT NULL,
  minutos_atraso INTEGER,
  desconto_aplicado BOOLEAN DEFAULT false,
  valor_desconto DECIMAL(10,2),
  responsavel_registro UUID REFERENCES colaboradores(id),
  data_ocorrencia TIMESTAMP DEFAULT NOW(),
  resolvido BOOLEAN DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de controle de ocupação em tempo real
CREATE TABLE ocupacao_salas_tempo_real (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id UUID REFERENCES salas(id) ON DELETE CASCADE,
  data_ocupacao DATE NOT NULL,
  turno VARCHAR(10) CHECK (turno IN ('manha', 'tarde', 'noite')),
  horario TIME NOT NULL,
  criancas_presentes INTEGER DEFAULT 0,
  profissionais_presentes INTEGER DEFAULT 0,
  percentual_ocupacao_criancas DECIMAL(5,2),
  percentual_ocupacao_profissionais DECIMAL(5,2),
  alerta_capacidade BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(sala_id, data_ocupacao, turno, horario)
);

-- Tabela de evolução de sessões
CREATE TABLE evolucoes_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES colaboradores(id),
  data_evolucao TIMESTAMP DEFAULT NOW(),
  conteudo_evolucao TEXT NOT NULL,
  objetivos_alcancados TEXT,
  observacoes_comportamentais TEXT,
  proximos_passos TEXT,
  materiais_utilizados TEXT[],
  tempo_atendimento INTEGER, -- em minutos
  qualidade_sessao INTEGER CHECK (qualidade_sessao BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de controle de pagamentos por sessão
CREATE TABLE pagamentos_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES colaboradores(id),
  evolucao_id UUID REFERENCES evolucoes_sessoes(id),
  valor_base_hora DECIMAL(10,2) NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  percentual_pagamento DECIMAL(5,2) DEFAULT 100.00, -- 50% para 30min, 100% para 60min
  valor_calculado DECIMAL(10,2) NOT NULL,
  aprovado_supervisao BOOLEAN DEFAULT false,
  supervisor_id UUID REFERENCES colaboradores(id),
  data_aprovacao TIMESTAMP,
  observacoes_pagamento TEXT,
  incluido_folha BOOLEAN DEFAULT false,
  mes_referencia DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sala_especialidades_sala ON sala_especialidades(sala_id);
CREATE INDEX IF NOT EXISTS idx_sala_especialidades_especialidade ON sala_especialidades(especialidade_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status_terapeutico ON agendamentos(status_terapeutico);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_status ON agendamentos(data_agendamento, status_terapeutico);
CREATE INDEX IF NOT EXISTS idx_profissionais_salas_turnos_ativo ON profissionais_salas_turnos(ativo, data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias_recepcao(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_ocupacao_data_sala ON ocupacao_salas_tempo_real(data_ocupacao, sala_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_agendamento ON evolucoes_sessoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_sessoes_mes ON pagamentos_sessoes(mes_referencia, profissional_id);

-- Triggers para atualização automática
CREATE TRIGGER update_sala_especialidades_updated_at BEFORE UPDATE ON sala_especialidades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profissionais_salas_turnos_updated_at BEFORE UPDATE ON profissionais_salas_turnos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular ocupação em tempo real
CREATE OR REPLACE FUNCTION calcular_ocupacao_sala(
  p_sala_id UUID,
  p_data DATE,
  p_horario TIME
) RETURNS JSONB AS $$
DECLARE
  sala_info RECORD;
  ocupacao_info JSONB;
  criancas_count INTEGER;
  profissionais_count INTEGER;
BEGIN
  -- Busca informações da sala
  SELECT capacidade_maxima INTO sala_info
  FROM salas WHERE id = p_sala_id;
  
  -- Conta crianças agendadas para o horário
  SELECT COUNT(*) INTO criancas_count
  FROM agendamentos 
  WHERE sala_id = p_sala_id 
    AND data_agendamento = p_data
    AND horario_inicio <= p_horario 
    AND horario_fim > p_horario
    AND status_terapeutico IN ('pronto_para_terapia', 'em_atendimento');
    
  -- Conta profissionais alocados
  SELECT COUNT(DISTINCT profissional_id) INTO profissionais_count
  FROM agendamentos 
  WHERE sala_id = p_sala_id 
    AND data_agendamento = p_data
    AND horario_inicio <= p_horario 
    AND horario_fim > p_horario
    AND status_terapeutico IN ('pronto_para_terapia', 'em_atendimento');
  
  ocupacao_info := jsonb_build_object(
    'criancas_presentes', criancas_count,
    'profissionais_presentes', profissionais_count,
    'capacidade_maxima_criancas', sala_info.capacidade_maxima,
    'capacidade_maxima_profissionais', 3,
    'percentual_criancas', ROUND((criancas_count::DECIMAL / sala_info.capacidade_maxima) * 100, 2),
    'percentual_profissionais', ROUND((profissionais_count::DECIMAL / 3) * 100, 2),
    'alerta_capacidade', (criancas_count > sala_info.capacidade_maxima OR profissionais_count > 3)
  );
  
  RETURN ocupacao_info;
END;
$$ LANGUAGE plpgsql;

-- View para dashboard terapêutico
CREATE OR REPLACE VIEW vw_dashboard_terapeutico AS
SELECT 
  a.id,
  a.data_agendamento,
  a.horario_inicio,
  a.horario_fim,
  a.status_terapeutico,
  a.duracao_real_minutos,
  a.evolucao_realizada,
  a.supervisionado,
  a.liberado_pagamento,
  p.nome as paciente_nome,
  c.nome_completo as profissional_nome,
  s.nome as sala_nome,
  s.cor as sala_cor,
  e.nome as especialidade_nome,
  ps.valor_calculado as valor_sessao,
  ev.qualidade_sessao
FROM agendamentos a
LEFT JOIN pacientes p ON a.paciente_id = p.id
LEFT JOIN colaboradores c ON a.profissional_id = c.id
LEFT JOIN salas s ON a.sala_id = s.id
LEFT JOIN especialidades e ON a.especialidade_id = e.id
LEFT JOIN pagamentos_sessoes ps ON a.id = ps.agendamento_id
LEFT JOIN evolucoes_sessoes ev ON a.id = ev.agendamento_id
WHERE a.data_agendamento >= CURRENT_DATE - INTERVAL '30 days';

-- Inserindo dados iniciais para teste
INSERT INTO sala_especialidades (sala_id, especialidade_id, is_principal, ordem)
SELECT s.id, s.especialidade_id, true, 1
FROM salas s
WHERE s.especialidade_id IS NOT NULL
ON CONFLICT (sala_id, especialidade_id) DO NOTHING;
