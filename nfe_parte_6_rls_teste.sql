-- =============================================
-- PARTE 6: RLS E POLÍTICAS (OPCIONAL)
-- Execute este bloco por último se quiser ativar RLS
-- =============================================

-- RLS (Row Level Security) - DESCOMENTE SE NECESSÁRIO
-- ALTER TABLE nfe_emissoes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE nfe_itens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE nfe_vinculacoes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE nfe_transmissoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permissivas para desenvolvimento)
-- DESCOMENTE APENAS SE ATIVAR RLS ACIMA
-- CREATE POLICY "Allow all operations nfe_emissoes" ON nfe_emissoes
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations nfe_itens" ON nfe_itens
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations nfe_vinculacoes" ON nfe_vinculacoes
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations nfe_transmissoes" ON nfe_transmissoes
--   FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- TESTE BÁSICO (Execute para verificar)
-- =============================================

-- Testar função de geração de número
SELECT gerar_proximo_numero_nfe() as proximo_numero_nfe;

-- Testar inserção básica
INSERT INTO nfe_emissoes (
  numero_nfe,
  destinatario_nome,
  destinatario_documento,
  valor_servicos,
  valor_total,
  discriminacao_servicos
) VALUES (
  '000000001',
  'Teste Cliente',
  '12345678901',
  100.00,
  95.00,
  'Teste de serviço médico'
);

-- Verificar se funcionou
SELECT * FROM vw_nfe_consolidado LIMIT 1;
