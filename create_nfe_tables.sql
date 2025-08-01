-- Tabela principal para NFe
CREATE TABLE IF NOT EXISTS nfe_emissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_nfe VARCHAR(20) UNIQUE NOT NULL,
  serie VARCHAR(10) NOT NULL DEFAULT '001',
  chave_acesso VARCHAR(44) UNIQUE,
  
  -- Dados do destinatário
  destinatario_nome VARCHAR(255) NOT NULL,
  destinatario_documento VARCHAR(20) NOT NULL, -- CPF ou CNPJ
  destinatario_endereco TEXT,
  destinatario_email VARCHAR(255),
  destinatario_telefone VARCHAR(20),
  
  -- Dados fiscais
  natureza_operacao VARCHAR(100) NOT NULL DEFAULT 'Prestação de serviços',
  codigo_servico VARCHAR(20), -- Código do serviço municipal
  cfop VARCHAR(10) DEFAULT '5933', -- CFOP para serviços
  
  -- Valores
  valor_servicos DECIMAL(10,2) NOT NULL,
  valor_iss DECIMAL(10,2) DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  
  -- Tributação
  aliquota_iss DECIMAL(5,2) DEFAULT 5.00,
  situacao_tributaria VARCHAR(10) DEFAULT 'N', -- (N)ormal, (S)ubstituição, (I)sento
  
  -- Status e controle
  status VARCHAR(20) DEFAULT 'rascunho', -- rascunho, autorizada, cancelada, erro
  protocolo_autorizacao VARCHAR(50),
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_autorizacao TIMESTAMP WITH TIME ZONE,
  
  -- Observações e dados adicionais
  observacoes TEXT,
  discriminacao_servicos TEXT NOT NULL,
  
  -- Controle de usuário
  usuario_emissao VARCHAR(255),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para itens/serviços da NFe
CREATE TABLE IF NOT EXISTS nfe_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfe_id UUID REFERENCES nfe_emissoes(id) ON DELETE CASCADE,
  
  -- Dados do item/serviço
  codigo_item VARCHAR(50),
  descricao_servico TEXT NOT NULL,
  unidade VARCHAR(10) DEFAULT 'UN',
  quantidade DECIMAL(10,3) DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  
  -- Dados fiscais do item
  codigo_ncm VARCHAR(10),
  codigo_servico_municipal VARCHAR(20),
  cfop VARCHAR(10) DEFAULT '5933',
  
  -- Tributação do item
  base_calculo_iss DECIMAL(10,2),
  aliquota_iss DECIMAL(5,2) DEFAULT 5.00,
  valor_iss DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para vincular NFe com recebimentos/atendimentos
CREATE TABLE IF NOT EXISTS nfe_vinculacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfe_id UUID REFERENCES nfe_emissoes(id) ON DELETE CASCADE,
  
  -- Pode ser vinculado a recebimento ou atendimento direto
  recebimento_id UUID REFERENCES recebimentos_convenios(id) ON DELETE SET NULL,
  atendimento_id UUID, -- ID do atendimento da view vw_faturamento_completo
  numero_guia VARCHAR(100),
  
  valor_vinculado DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para log de transmissão SEFAZ
CREATE TABLE IF NOT EXISTS nfe_transmissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfe_id UUID REFERENCES nfe_emissoes(id) ON DELETE CASCADE,
  
  tipo_operacao VARCHAR(20) NOT NULL, -- emissao, cancelamento, consulta
  status_retorno VARCHAR(20) NOT NULL, -- sucesso, erro, processando
  codigo_retorno VARCHAR(10),
  mensagem_retorno TEXT,
  protocolo VARCHAR(50),
  
  -- XML de envio e retorno
  xml_envio TEXT,
  xml_retorno TEXT,
  
  tentativa_numero INTEGER DEFAULT 1,
  data_transmissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_nfe_numero ON nfe_emissoes(numero_nfe);
CREATE INDEX IF NOT EXISTS idx_nfe_chave ON nfe_emissoes(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_nfe_destinatario ON nfe_emissoes(destinatario_documento);
CREATE INDEX IF NOT EXISTS idx_nfe_status ON nfe_emissoes(status);
CREATE INDEX IF NOT EXISTS idx_nfe_data_emissao ON nfe_emissoes(data_emissao);
CREATE INDEX IF NOT EXISTS idx_nfe_itens_nfe ON nfe_itens(nfe_id);
CREATE INDEX IF NOT EXISTS idx_nfe_vinc_nfe ON nfe_vinculacoes(nfe_id);
CREATE INDEX IF NOT EXISTS idx_nfe_vinc_rec ON nfe_vinculacoes(recebimento_id);
CREATE INDEX IF NOT EXISTS idx_nfe_trans_nfe ON nfe_transmissoes(nfe_id);

-- View consolidada para relatórios
CREATE OR REPLACE VIEW vw_nfe_consolidado AS
SELECT 
  n.id,
  n.numero_nfe,
  n.serie,
  n.chave_acesso,
  n.destinatario_nome,
  n.destinatario_documento,
  n.destinatario_email,
  n.natureza_operacao,
  n.valor_servicos,
  n.valor_iss,
  n.valor_desconto,
  n.valor_total,
  n.aliquota_iss,
  n.status,
  n.protocolo_autorizacao,
  n.data_emissao,
  n.data_autorizacao,
  n.discriminacao_servicos,
  n.usuario_emissao,
  
  -- Totais de itens
  COALESCE(itens.total_itens, 0) as total_itens,
  COALESCE(itens.valor_total_itens, 0) as valor_total_itens,
  
  -- Informações de vinculação
  COALESCE(vinc.total_vinculacoes, 0) as total_vinculacoes,
  COALESCE(vinc.valor_total_vinculado, 0) as valor_total_vinculado,
  
  -- Status da última transmissão
  trans.ultimo_status_transmissao,
  trans.ultima_mensagem_retorno,
  trans.ultima_data_transmissao,
  
  n.created_at,
  n.updated_at
FROM nfe_emissoes n
LEFT JOIN (
  SELECT 
    nfe_id,
    COUNT(*) as total_itens,
    SUM(valor_total) as valor_total_itens
  FROM nfe_itens 
  GROUP BY nfe_id
) itens ON n.id = itens.nfe_id
LEFT JOIN (
  SELECT 
    nfe_id,
    COUNT(*) as total_vinculacoes,
    SUM(valor_vinculado) as valor_total_vinculado
  FROM nfe_vinculacoes 
  GROUP BY nfe_id
) vinc ON n.id = vinc.nfe_id
LEFT JOIN (
  SELECT DISTINCT ON (nfe_id)
    nfe_id,
    status_retorno as ultimo_status_transmissao,
    mensagem_retorno as ultima_mensagem_retorno,
    data_transmissao as ultima_data_transmissao
  FROM nfe_transmissoes 
  ORDER BY nfe_id, data_transmissao DESC
) trans ON n.id = trans.nfe_id
ORDER BY n.data_emissao DESC;

-- RLS (Row Level Security)
ALTER TABLE nfe_emissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_vinculacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_transmissoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permissivas para desenvolvimento)
CREATE POLICY "Allow all operations nfe_emissoes" ON nfe_emissoes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations nfe_itens" ON nfe_itens
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations nfe_vinculacoes" ON nfe_vinculacoes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations nfe_transmissoes" ON nfe_transmissoes
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nfe_emissoes_updated_at 
  BEFORE UPDATE ON nfe_emissoes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar próximo número de NFe
CREATE OR REPLACE FUNCTION gerar_proximo_numero_nfe(p_serie VARCHAR DEFAULT '001')
RETURNS VARCHAR AS $$
DECLARE
    proximo_numero INTEGER;
    numero_formatado VARCHAR;
BEGIN
    -- Buscar o maior número da série
    SELECT COALESCE(MAX(CAST(numero_nfe AS INTEGER)), 0) + 1 
    INTO proximo_numero
    FROM nfe_emissoes 
    WHERE serie = p_serie 
    AND numero_nfe ~ '^[0-9]+$'; -- Apenas números
    
    -- Formatar com zeros à esquerda
    numero_formatado := LPAD(proximo_numero::TEXT, 9, '0');
    
    RETURN numero_formatado;
END;
$$ LANGUAGE plpgsql;
