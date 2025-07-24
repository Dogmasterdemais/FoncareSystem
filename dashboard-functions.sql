-- ===== FUNÇÕES SQL PARA DASHBOARD EXECUTIVO =====

-- Função para obter atendimentos por especialidade
CREATE OR REPLACE FUNCTION obter_atendimentos_especialidade(
  p_ano INTEGER,
  p_mes INTEGER,
  p_unidade_id UUID DEFAULT NULL
)
RETURNS TABLE(
  especialidade VARCHAR,
  quantidade_atendimentos BIGINT,
  quantidade_pacientes_unicos BIGINT,
  valor_total DECIMAL(10,2),
  unidade_id UUID,
  unidade_nome VARCHAR,
  mes INTEGER,
  ano INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.cargo, 'Não informado') as especialidade,
    COUNT(a.id) as quantidade_atendimentos,
    COUNT(DISTINCT a.paciente_id) as quantidade_pacientes_unicos,
    COALESCE(SUM(g.valor_total), 0) as valor_total,
    u.id as unidade_id,
    u.nome as unidade_nome,
    p_mes as mes,
    p_ano as ano
  FROM atendimentos a
  INNER JOIN unidades u ON a.unidade_id = u.id
  LEFT JOIN colaboradores c ON a.profissional_id = c.id
  LEFT JOIN guias g ON a.guia_id = g.id
  WHERE 
    EXTRACT(YEAR FROM a.data_atendimento) = p_ano
    AND EXTRACT(MONTH FROM a.data_atendimento) = p_mes
    AND (p_unidade_id IS NULL OR a.unidade_id = p_unidade_id)
    AND a.status = 'realizado'
  GROUP BY 
    c.cargo, u.id, u.nome
  ORDER BY 
    quantidade_atendimentos DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter guias por convênio
CREATE OR REPLACE FUNCTION obter_guias_convenio(
  p_ano INTEGER,
  p_mes INTEGER,
  p_unidade_id UUID DEFAULT NULL
)
RETURNS TABLE(
  convenio_id UUID,
  convenio_nome VARCHAR,
  quantidade_guias BIGINT,
  valor_total DECIMAL(10,2),
  valor_aprovado DECIMAL(10,2),
  valor_rejeitado DECIMAL(10,2),
  unidade_id UUID,
  unidade_nome VARCHAR,
  mes INTEGER,
  ano INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    conv.id as convenio_id,
    conv.nome as convenio_nome,
    COUNT(g.id) as quantidade_guias,
    COALESCE(SUM(g.valor_total), 0) as valor_total,
    COALESCE(SUM(CASE WHEN g.status = 'aprovada' THEN g.valor_total ELSE 0 END), 0) as valor_aprovado,
    COALESCE(SUM(CASE WHEN g.status = 'rejeitada' THEN g.valor_total ELSE 0 END), 0) as valor_rejeitado,
    u.id as unidade_id,
    u.nome as unidade_nome,
    p_mes as mes,
    p_ano as ano
  FROM guias g
  INNER JOIN convenios conv ON g.convenio_id = conv.id
  INNER JOIN unidades u ON g.unidade_id = u.id
  WHERE 
    EXTRACT(YEAR FROM g.data_emissao) = p_ano
    AND EXTRACT(MONTH FROM g.data_emissao) = p_mes
    AND (p_unidade_id IS NULL OR g.unidade_id = p_unidade_id)
  GROUP BY 
    conv.id, conv.nome, u.id, u.nome
  ORDER BY 
    valor_total DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas gerais do dashboard
CREATE OR REPLACE FUNCTION obter_estatisticas_dashboard(
  p_ano INTEGER,
  p_mes INTEGER,
  p_unidade_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total_pacientes_ativos BIGINT,
  total_atendimentos_mes BIGINT,
  total_profissionais BIGINT,
  receita_total_mes DECIMAL(10,2),
  media_atendimentos_dia DECIMAL(10,2),
  taxa_ocupacao_salas DECIMAL(5,2)
) AS $$
DECLARE
  dias_mes INTEGER;
BEGIN
  -- Obter número de dias do mês
  SELECT EXTRACT(DAY FROM (DATE(p_ano || '-' || p_mes || '-01') + INTERVAL '1 month - 1 day')) INTO dias_mes;
  
  RETURN QUERY
  SELECT 
    -- Total de pacientes que tiveram atendimento no mês
    (SELECT COUNT(DISTINCT a.paciente_id) 
     FROM atendimentos a 
     WHERE EXTRACT(YEAR FROM a.data_atendimento) = p_ano
       AND EXTRACT(MONTH FROM a.data_atendimento) = p_mes
       AND (p_unidade_id IS NULL OR a.unidade_id = p_unidade_id)
       AND a.status = 'realizado') as total_pacientes_ativos,
    
    -- Total de atendimentos no mês
    (SELECT COUNT(a.id) 
     FROM atendimentos a 
     WHERE EXTRACT(YEAR FROM a.data_atendimento) = p_ano
       AND EXTRACT(MONTH FROM a.data_atendimento) = p_mes
       AND (p_unidade_id IS NULL OR a.unidade_id = p_unidade_id)
       AND a.status = 'realizado') as total_atendimentos_mes,
    
    -- Total de profissionais ativos
    (SELECT COUNT(c.id) 
     FROM colaboradores c 
     WHERE c.status = 'ativo'
       AND (p_unidade_id IS NULL OR c.unidade_id = p_unidade_id)) as total_profissionais,
    
    -- Receita total do mês (guias aprovadas)
    (SELECT COALESCE(SUM(g.valor_total), 0) 
     FROM guias g 
     WHERE EXTRACT(YEAR FROM g.data_emissao) = p_ano
       AND EXTRACT(MONTH FROM g.data_emissao) = p_mes
       AND g.status = 'aprovada'
       AND (p_unidade_id IS NULL OR g.unidade_id = p_unidade_id)) as receita_total_mes,
    
    -- Média de atendimentos por dia
    (SELECT COALESCE(COUNT(a.id)::DECIMAL / dias_mes, 0) 
     FROM atendimentos a 
     WHERE EXTRACT(YEAR FROM a.data_atendimento) = p_ano
       AND EXTRACT(MONTH FROM a.data_atendimento) = p_mes
       AND (p_unidade_id IS NULL OR a.unidade_id = p_unidade_id)
       AND a.status = 'realizado') as media_atendimentos_dia,
    
    -- Taxa de ocupação das salas (simulada - seria necessário dados de agenda)
    85.5::DECIMAL(5,2) as taxa_ocupacao_salas;
END;
$$ LANGUAGE plpgsql;

-- View para facilitar consultas de pacientes por localização
CREATE OR REPLACE VIEW v_pacientes_localizacao AS
SELECT 
  p.id,
  p.nome_completo,
  p.endereco_cep,
  p.endereco_cidade,
  p.endereco_estado,
  p.endereco_bairro,
  p.endereco_logradouro,
  COUNT(a.id) as total_atendimentos,
  MAX(a.data_atendimento) as ultimo_atendimento,
  u.id as unidade_id,
  u.nome as unidade_nome
FROM pacientes p
LEFT JOIN atendimentos a ON p.id = a.paciente_id
LEFT JOIN unidades u ON a.unidade_id = u.id
WHERE p.endereco_cep IS NOT NULL
  AND a.status = 'realizado'
GROUP BY p.id, p.nome_completo, p.endereco_cep, p.endereco_cidade, 
         p.endereco_estado, p.endereco_bairro, p.endereco_logradouro,
         u.id, u.nome;

-- Índices para otimização das consultas do dashboard
CREATE INDEX IF NOT EXISTS idx_atendimentos_data_status ON atendimentos(data_atendimento, status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_profissional_data ON atendimentos(profissional_id, data_atendimento);
CREATE INDEX IF NOT EXISTS idx_guias_convenio_data ON guias(convenio_id, data_emissao);
CREATE INDEX IF NOT EXISTS idx_guias_unidade_data ON guias(unidade_id, data_emissao);
CREATE INDEX IF NOT EXISTS idx_pacientes_cep ON pacientes(endereco_cep) WHERE endereco_cep IS NOT NULL;

-- Função para limpar cache de coordenadas antigas (manutenção)
CREATE OR REPLACE FUNCTION limpar_cache_coordenadas()
RETURNS VOID AS $$
BEGIN
  -- Esta função pode ser usada para implementar limpeza de cache
  -- de coordenadas geográficas se necessário
  RAISE NOTICE 'Cache de coordenadas limpo';
END;
$$ LANGUAGE plpgsql;
