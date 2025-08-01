-- =============================================
-- PARTE 2: TABELAS RELACIONADAS
-- Execute este bloco após a Parte 1
-- =============================================

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
  recebimento_id UUID,
  atendimento_id UUID,
  numero_guia VARCHAR(100),
  
  valor_vinculado DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para log de transmissão SEFAZ
CREATE TABLE IF NOT EXISTS nfe_transmissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfe_id UUID REFERENCES nfe_emissoes(id) ON DELETE CASCADE,
  
  tipo_operacao VARCHAR(20) NOT NULL,
  status_retorno VARCHAR(20) NOT NULL,
  codigo_retorno VARCHAR(10),
  mensagem_retorno TEXT,
  protocolo VARCHAR(50),
  
  -- XML de envio e retorno
  xml_envio TEXT,
  xml_retorno TEXT,
  
  tentativa_numero INTEGER DEFAULT 1,
  data_transmissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
