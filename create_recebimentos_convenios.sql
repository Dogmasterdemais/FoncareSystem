-- Tabela para gerenciar recebimentos de convênios
CREATE TABLE IF NOT EXISTS recebimentos_convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convenio_nome VARCHAR(255) NOT NULL,
  valor_recebido DECIMAL(10,2) NOT NULL,
  data_recebimento DATE NOT NULL,
  comprovante_bancario TEXT, -- URL ou path do comprovante
  numero_lote VARCHAR(100),
  observacoes TEXT,
  usuario_responsavel VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_recebimentos_convenio ON recebimentos_convenios(convenio_nome);
CREATE INDEX IF NOT EXISTS idx_recebimentos_data ON recebimentos_convenios(data_recebimento);
CREATE INDEX IF NOT EXISTS idx_recebimentos_lote ON recebimentos_convenios(numero_lote);

-- Tabela para vincular recebimentos aos atendimentos específicos
CREATE TABLE IF NOT EXISTS recebimentos_atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recebimento_id UUID REFERENCES recebimentos_convenios(id) ON DELETE CASCADE,
  atendimento_id UUID, -- Referência ao ID do atendimento na view vw_faturamento_completo
  numero_guia VARCHAR(100),
  valor_pago DECIMAL(10,2) NOT NULL,
  valor_glosa DECIMAL(10,2) DEFAULT 0,
  motivo_glosa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_recebimentos_atend_recebimento ON recebimentos_atendimentos(recebimento_id);
CREATE INDEX IF NOT EXISTS idx_recebimentos_atend_guia ON recebimentos_atendimentos(numero_guia);

-- View para consolidar informações de recebimentos
CREATE OR REPLACE VIEW vw_recebimentos_consolidado AS
SELECT 
  rc.id,
  rc.convenio_nome,
  rc.valor_recebido,
  rc.data_recebimento,
  rc.comprovante_bancario,
  rc.numero_lote,
  rc.observacoes,
  rc.usuario_responsavel,
  rc.created_at,
  COALESCE(ra.total_atendimentos, 0) as total_atendimentos,
  COALESCE(ra.valor_total_pago, 0) as valor_total_pago,
  COALESCE(ra.valor_total_glosa, 0) as valor_total_glosa,
  (rc.valor_recebido - COALESCE(ra.valor_total_pago, 0)) as diferenca_valor
FROM recebimentos_convenios rc
LEFT JOIN (
  SELECT 
    recebimento_id,
    COUNT(*) as total_atendimentos,
    SUM(valor_pago) as valor_total_pago,
    SUM(valor_glosa) as valor_total_glosa
  FROM recebimentos_atendimentos 
  GROUP BY recebimento_id
) ra ON rc.id = ra.recebimento_id
ORDER BY rc.data_recebimento DESC;

-- RLS (Row Level Security) - só usuários autenticados podem acessar
ALTER TABLE recebimentos_convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebimentos_atendimentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Authenticated users can view recebimentos_convenios" ON recebimentos_convenios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert recebimentos_convenios" ON recebimentos_convenios
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update recebimentos_convenios" ON recebimentos_convenios
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete recebimentos_convenios" ON recebimentos_convenios
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete recebimentos_atendimentos" ON recebimentos_atendimentos
  FOR DELETE TO authenticated USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recebimentos_convenios_updated_at 
  BEFORE UPDATE ON recebimentos_convenios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recebimentos_atendimentos_updated_at 
  BEFORE UPDATE ON recebimentos_atendimentos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
