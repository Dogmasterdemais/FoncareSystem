-- Migração completa para implementar especificações do Foncare System
-- Execute no SQL Editor do Supabase

-- 1. Adicionar campo updated_at na tabela pacientes
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar e criar trigger apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_pacientes_updated_at' 
    AND tgrelid = 'pacientes'::regclass
  ) THEN
    CREATE TRIGGER update_pacientes_updated_at 
      BEFORE UPDATE ON pacientes 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END;
$$;

-- 3. Criar tabela de especialidades e adicionar colunas se necessário
CREATE TABLE IF NOT EXISTS especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
ALTER TABLE especialidades 
ADD COLUMN IF NOT EXISTS cor VARCHAR(7) DEFAULT '#808080',
ADD COLUMN IF NOT EXISTS codigo VARCHAR(20),
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS duracao_padrao_minutos INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS valor_padrao DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Adicionar constraint unique para nome se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'especialidades_nome_key'
  ) THEN
    ALTER TABLE especialidades ADD CONSTRAINT especialidades_nome_key UNIQUE (nome);
  END IF;
END;
$$;

-- 4. Criar tabela de salas e adicionar colunas se necessário
CREATE TABLE IF NOT EXISTS salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar colunas que podem estar faltando
ALTER TABLE salas 
ADD COLUMN IF NOT EXISTS cor VARCHAR(7) DEFAULT '#808080',
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50),
ADD COLUMN IF NOT EXISTS especialidade_id UUID,
ADD COLUMN IF NOT EXISTS capacidade_maxima INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS unidade_id UUID,
ADD COLUMN IF NOT EXISTS equipamentos JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Adicionar foreign keys se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'salas_especialidade_id_fkey'
  ) THEN
    ALTER TABLE salas ADD CONSTRAINT salas_especialidade_id_fkey 
    FOREIGN KEY (especialidade_id) REFERENCES especialidades(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'salas_unidade_id_fkey'
  ) THEN
    ALTER TABLE salas ADD CONSTRAINT salas_unidade_id_fkey 
    FOREIGN KEY (unidade_id) REFERENCES unidades(id);
  END IF;
END;
$$;

-- 5. Criar tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  crf VARCHAR(50),
  especialidade_id UUID REFERENCES especialidades(id),
  telefone VARCHAR(20),
  email VARCHAR(100),
  cep VARCHAR(9),
  logradouro VARCHAR(255),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  tipo_contrato VARCHAR(50),
  valor_hora DECIMAL(10,2),
  carga_horaria_semanal INTEGER,
  data_admissao DATE,
  data_demissao DATE,
  sala_id UUID REFERENCES salas(id),
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Criar tabela de procedimentos TUSS
CREATE TABLE IF NOT EXISTS procedimentos_tuss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  convenio_id UUID REFERENCES convenios(id),
  valor DECIMAL(10,2),
  dados_lista_suspensa JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id),
  convenio_id UUID REFERENCES convenios(id),
  data_agendamento DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'agendado',
  observacoes TEXT,
  numero_agendamento VARCHAR(50),
  profissional_id UUID REFERENCES profissionais(id),
  unidade_id UUID REFERENCES unidades(id),
  sala_id UUID REFERENCES salas(id),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  duracao_minutos INTEGER,
  tipo_sessao VARCHAR(50),
  modalidade VARCHAR(50),
  status_confirmacao VARCHAR(50) DEFAULT 'pendente',
  valor_sessao DECIMAL(10,2),
  codigo_autorizacao VARCHAR(100),
  numero_guia VARCHAR(100),
  data_autorizacao DATE,
  validade_autorizacao DATE,
  is_neuropsicologia BOOLEAN DEFAULT false,
  sessao_sequencia INTEGER DEFAULT 1,
  total_sessoes INTEGER DEFAULT 1,
  agendamento_pai_id UUID REFERENCES agendamentos(id),
  lembrete_enviado BOOLEAN DEFAULT false,
  confirmacao_enviada BOOLEAN DEFAULT false,
  data_lembrete TIMESTAMP,
  data_confirmacao TIMESTAMP,
  whatsapp_paciente VARCHAR(20),
  whatsapp_responsavel VARCHAR(20),
  observacoes_internas TEXT,
  motivo_cancelamento TEXT,
  data_chegada TIMESTAMP,
  data_inicio_atendimento TIMESTAMP,
  data_fim_atendimento TIMESTAMP,
  documentos_necessarios JSONB,
  documentos_entregues JSONB,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Inserir especialidades conforme especificação
INSERT INTO especialidades (nome, cor, codigo, descricao, duracao_padrao_minutos, ativo) VALUES 
('Fonoaudiologia', '#0052CC', 'FONO', 'Sala Azul - Fonoaudiologia', 60, true),
('Terapia Ocupacional', '#00E6F6', 'TO', 'Sala Azul Claro - Terapia Ocupacional', 60, true),
('Psicologia', '#38712F', 'PSI', 'Sala Verde - Psicologia', 60, true),
('Psicopedagogia', '#D20000', 'PSICOPEDA', 'Sala Vermelha - Psicopedagogia/Neuropsicopedagogia', 60, true),
('Educador Físico', '#B45A00', 'ED_FISICO', 'Sala Laranja Escuro - Educador Físico', 60, true),
('Psicomotricidade', '#F58B00', 'PSICOMOTR', 'Sala Amarela - Psicomotricidade', 60, true),
('Musicoterapia', '#F5C344', 'MUSICO', 'Sala Amarelo Claro - Musicoterapia/Ludoterapia/Arterapia', 60, true),
('Fisioterapia', '#C47B9C', 'FISIO', 'Sala Lilás - Fisioterapia', 60, true),
('Anamnese', '#808080', 'ANAMNESE', 'Sala Cinza - Anamnese (sessão única)', 60, true),
('Neuropsicologia', '#000000', 'NEUROPSI', 'Sala Preta - Avaliação Neuropsicológica (6 sessões)', 60, true)
ON CONFLICT (nome) DO UPDATE SET
  cor = EXCLUDED.cor,
  codigo = EXCLUDED.codigo,
  descricao = EXCLUDED.descricao,
  duracao_padrao_minutos = EXCLUDED.duracao_padrao_minutos,
  ativo = EXCLUDED.ativo;

-- 9. Inserir salas para cada especialidade
DO $$
BEGIN
    -- Temporariamente remover constraint de tipo se existir
    ALTER TABLE salas DROP CONSTRAINT IF EXISTS salas_tipo_check;
    
    -- Inserir as salas
    INSERT INTO salas (nome, cor, tipo, especialidade_id, unidade_id) 
    SELECT 
      COALESCE(e.descricao, 'Sala de ' || e.nome) as nome,
      COALESCE(e.cor, '#808080') as cor,
      'consultorio' as tipo,
      e.id,
      u.id
    FROM especialidades e
    CROSS JOIN unidades u
    WHERE u.ativo = true 
      AND e.ativo = true
      AND NOT EXISTS (
        SELECT 1 FROM salas s 
        WHERE s.especialidade_id = e.id 
        AND s.unidade_id = u.id
      );
    
    -- Recriar constraint básica
    ALTER TABLE salas ADD CONSTRAINT salas_tipo_check 
    CHECK (tipo IN ('consultorio', 'sala', 'espera', 'recepcao'));
    
    RAISE NOTICE 'Salas inseridas com sucesso';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Erro ao inserir salas: %', SQLERRM;
END;
$$;

-- 10. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_sala ON agendamentos(sala_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_profissionais_especialidade ON profissionais(especialidade_id);
CREATE INDEX IF NOT EXISTS idx_salas_unidade ON salas(unidade_id);

-- 11. Adicionar triggers para updated_at nas novas tabelas
DO $$
BEGIN
  -- Trigger para especialidades
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_especialidades_updated_at' 
    AND tgrelid = 'especialidades'::regclass
  ) THEN
    CREATE TRIGGER update_especialidades_updated_at 
      BEFORE UPDATE ON especialidades 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  -- Trigger para salas
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_salas_updated_at' 
    AND tgrelid = 'salas'::regclass
  ) THEN
    CREATE TRIGGER update_salas_updated_at 
      BEFORE UPDATE ON salas 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  -- Trigger para profissionais
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_profissionais_updated_at' 
    AND tgrelid = 'profissionais'::regclass
  ) THEN
    CREATE TRIGGER update_profissionais_updated_at 
      BEFORE UPDATE ON profissionais 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  -- Trigger para procedimentos_tuss
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_procedimentos_tuss_updated_at' 
    AND tgrelid = 'procedimentos_tuss'::regclass
  ) THEN
    CREATE TRIGGER update_procedimentos_tuss_updated_at 
      BEFORE UPDATE ON procedimentos_tuss 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  -- Trigger para agendamentos
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_agendamentos_updated_at' 
    AND tgrelid = 'agendamentos'::regclass
  ) THEN
    CREATE TRIGGER update_agendamentos_updated_at 
      BEFORE UPDATE ON agendamentos 
      FOR EACH ROW 
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END;
$$;

-- 12. Criar views para relatórios
DO $$
BEGIN
    -- Primeiro, tentar dropar a view se ela existir
    DROP VIEW IF EXISTS vw_agendamentos_completo;
    
    -- Agora criar a nova view
    CREATE VIEW vw_agendamentos_completo AS
    SELECT 
      a.*,
      p.nome as paciente_nome,
      p.telefone as paciente_telefone,
      p.responsavel_nome,
      p.responsavel_telefone,
      pr.nome as profissional_nome,
      s.nome as sala_nome,
      s.cor as sala_cor,
      e.nome as especialidade_nome,
      c.nome as convenio_nome,
      u.nome as unidade_nome
    FROM agendamentos a
    LEFT JOIN pacientes p ON a.paciente_id = p.id
    LEFT JOIN profissionais pr ON a.profissional_id = pr.id
    LEFT JOIN salas s ON a.sala_id = s.id
    LEFT JOIN especialidades e ON s.especialidade_id = e.id
    LEFT JOIN convenios c ON a.convenio_id = c.id
    LEFT JOIN unidades u ON a.unidade_id = u.id;
    
    RAISE NOTICE 'View vw_agendamentos_completo criada com sucesso';
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Erro ao criar view: %', SQLERRM;
END;
$$;

-- 13. Comentários nas tabelas
COMMENT ON TABLE especialidades IS 'Especialidades médicas e terapêuticas disponíveis';
COMMENT ON TABLE salas IS 'Salas de atendimento por unidade';
COMMENT ON TABLE profissionais IS 'Cadastro de profissionais da clínica';
COMMENT ON TABLE procedimentos_tuss IS 'Procedimentos TUSS para convênios';
COMMENT ON TABLE agendamentos IS 'Sistema de agendamentos completo';

-- 14. Função para gerar número de agendamento
-- Primeiro dropar o trigger que depende da função
DROP TRIGGER IF EXISTS gerar_numero_agendamento_trigger ON agendamentos;
DROP FUNCTION IF EXISTS trigger_gerar_numero_agendamento();
DROP FUNCTION IF EXISTS gerar_numero_agendamento();

CREATE FUNCTION gerar_numero_agendamento()
RETURNS TEXT AS $$
DECLARE
  numero TEXT;
  ano TEXT := TO_CHAR(NOW(), 'YYYY');
  sequencial TEXT;
BEGIN
  -- Buscar último número do ano
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_agendamento FROM 6) AS INTEGER)), 0) + 1
  INTO sequencial
  FROM agendamentos 
  WHERE numero_agendamento LIKE ano || '%';
  
  -- Formatar: YYYY + sequencial com 6 dígitos
  numero := ano || LPAD(sequencial::TEXT, 6, '0');
  
  RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- 15. Trigger para gerar número de agendamento automaticamente
CREATE FUNCTION trigger_gerar_numero_agendamento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_agendamento IS NULL THEN
    NEW.numero_agendamento := gerar_numero_agendamento();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar e criar trigger apenas se não existir
DO $$
BEGIN
  -- Sempre tentar criar o trigger (já foi dropado acima)
  CREATE TRIGGER gerar_numero_agendamento_trigger
    BEFORE INSERT ON agendamentos
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_gerar_numero_agendamento();
    
  RAISE NOTICE 'Trigger gerar_numero_agendamento_trigger criado com sucesso';
  
EXCEPTION WHEN others THEN
  -- Se o trigger já existir, apenas logar
  IF SQLSTATE = '42710' THEN
    RAISE NOTICE 'Trigger gerar_numero_agendamento_trigger já existe';
  ELSE
    RAISE NOTICE 'Erro ao criar trigger: %', SQLERRM;
  END IF;
END;
$$;

-- Finalização
SELECT 'Migração completa executada com sucesso!' as resultado;
