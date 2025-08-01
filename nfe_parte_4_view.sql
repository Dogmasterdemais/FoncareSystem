-- =============================================
-- PARTE 4: VIEW CONSOLIDADA
-- Execute este bloco após a Parte 3
-- =============================================

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
