-- Script rápido para testar a tabela NFes
-- Execute este comando no Supabase SQL Editor antes de usar o teste

-- Verificar se a tabela existe
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'nfes' 
ORDER BY ordinal_position;

-- Se a tabela não existir, execute o comando abaixo:
-- (DESCOMENTADO PARA CRIAR A TABELA)

CREATE TABLE IF NOT EXISTS nfes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_nfe VARCHAR(50),
    destinatario_nome VARCHAR(255) NOT NULL,
    destinatario_documento VARCHAR(20) NOT NULL,
    destinatario_email VARCHAR(255),
    destinatario_endereco TEXT NOT NULL,
    destinatario_telefone VARCHAR(20),
    natureza_operacao VARCHAR(255) NOT NULL DEFAULT 'Prestação de Serviços',
    codigo_servico VARCHAR(10) NOT NULL DEFAULT '04472',
    valor_servicos DECIMAL(10,2) NOT NULL,
    aliquota_iss DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    valor_iss DECIMAL(10,2) NOT NULL,
    valor_liquido DECIMAL(10,2) NOT NULL,
    pis DECIMAL(5,2) NOT NULL DEFAULT 0.65,
    cofins DECIMAL(5,2) NOT NULL DEFAULT 3.00,
    irrf DECIMAL(5,2) NOT NULL DEFAULT 1.50,
    csll DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    discriminacao_servicos TEXT NOT NULL,
    observacoes TEXT,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'rascunho',
    chave_acesso VARCHAR(255),
    protocolo VARCHAR(255),
    erro_processamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_nfes_status ON nfes(status);
CREATE INDEX IF NOT EXISTS idx_nfes_data_emissao ON nfes(data_emissao);
CREATE INDEX IF NOT EXISTS idx_nfes_destinatario_nome ON nfes(destinatario_nome);
CREATE INDEX IF NOT EXISTS idx_nfes_numero_nfe ON nfes(numero_nfe);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS update_nfes_updated_at ON nfes;
CREATE TRIGGER update_nfes_updated_at
    BEFORE UPDATE ON nfes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE nfes IS 'Tabela para gestão de Notas Fiscais Eletrônicas (NFe)';
COMMENT ON COLUMN nfes.codigo_servico IS 'Código do serviço fixo: 04472 para serviços terapêuticos';
COMMENT ON COLUMN nfes.aliquota_iss IS 'Alíquota ISS fixa: 2.00%';
COMMENT ON COLUMN nfes.pis IS 'Alíquota PIS fixa: 0.65%';
COMMENT ON COLUMN nfes.cofins IS 'Alíquota COFINS fixa: 3.00%';
COMMENT ON COLUMN nfes.irrf IS 'Alíquota IRRF fixa: 1.50%';
COMMENT ON COLUMN nfes.csll IS 'Alíquota CSLL/CRF fixa: 1.00%';

-- Verificar quantas NFes já existem (só executará se a tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nfes') THEN
        RAISE NOTICE '✅ Tabela NFes criada com sucesso!';
        
        -- Mostrar estrutura da tabela
        RAISE NOTICE '📋 Estrutura da tabela:';
        PERFORM column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'nfes' 
        ORDER BY ordinal_position;
        
        -- Verificar se há dados
        RAISE NOTICE '📊 Verificando dados existentes...';
    ELSE
        RAISE NOTICE '❌ Erro: Tabela NFes não foi criada!';
    END IF;
END $$;

-- Consultar dados se a tabela existir
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '📊 Tabela criada e vazia - pronta para uso!'
        ELSE CONCAT('📊 Tabela tem ', COUNT(*), ' registros')
    END as status_tabela
FROM nfes;

-- Mostrar estrutura final da tabela
SELECT 
    column_name as "Campo",
    data_type as "Tipo",
    is_nullable as "Nulo?",
    column_default as "Padrão"
FROM information_schema.columns 
WHERE table_name = 'nfes' 
ORDER BY ordinal_position;
