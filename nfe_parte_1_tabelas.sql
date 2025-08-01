-- =============================================
-- PARTE 1: TABELAS PRINCIPAIS NFe
-- Execute este bloco primeiro
-- =============================================

-- Tabela principal para NFe
CREATE TABLE IF NOT EXISTS nfe_emissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_nfe VARCHAR(20) UNIQUE NOT NULL,
  serie VARCHAR(10) NOT NULL DEFAULT '001',
  chave_acesso VARCHAR(44) UNIQUE,
  
  -- Dados do destinatário
  destinatario_nome VARCHAR(255) NOT NULL,
  destinatario_documento VARCHAR(20) NOT NULL,
  destinatario_endereco TEXT,
  destinatario_email VARCHAR(255),
  destinatario_telefone VARCHAR(20),
  
  -- Dados fiscais
  natureza_operacao VARCHAR(100) NOT NULL DEFAULT 'Prestação de serviços',
  codigo_servico VARCHAR(20),
  cfop VARCHAR(10) DEFAULT '5933',
  
  -- Valores
  valor_servicos DECIMAL(10,2) NOT NULL,
  valor_iss DECIMAL(10,2) DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  
  -- Tributação
  aliquota_iss DECIMAL(5,2) DEFAULT 5.00,
  situacao_tributaria VARCHAR(10) DEFAULT 'N',
  
  -- Status e controle
  status VARCHAR(20) DEFAULT 'rascunho',
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
