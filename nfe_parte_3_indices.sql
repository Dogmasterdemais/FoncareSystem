-- =============================================
-- PARTE 3: ÍNDICES E PERFORMANCE
-- Execute este bloco após a Parte 2
-- =============================================

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
