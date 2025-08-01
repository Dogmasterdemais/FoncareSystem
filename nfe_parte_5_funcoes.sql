-- =============================================
-- PARTE 5: FUNÇÕES E TRIGGERS
-- Execute este bloco após a Parte 4
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
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
    AND numero_nfe ~ '^[0-9]+$';
    
    -- Formatar com zeros à esquerda
    numero_formatado := LPAD(proximo_numero::TEXT, 9, '0');
    
    RETURN numero_formatado;
END;
$$ LANGUAGE plpgsql;
