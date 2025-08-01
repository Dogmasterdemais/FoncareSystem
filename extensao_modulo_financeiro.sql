-- Extensão das funcionalidades do Módulo Financeiro
-- Adicionando: Upload de Notas Fiscais, Análise de Unidades e Atendimentos por Guias

-- 1. Tabela para anexos de notas fiscais em contas a pagar
CREATE TABLE IF NOT EXISTS anexos_notas_fiscais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conta_pagar_id UUID REFERENCES contas_pagar(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    url_arquivo TEXT NOT NULL,
    tamanho_arquivo BIGINT NOT NULL,
    tipo_arquivo VARCHAR(100) NOT NULL,
    hash_arquivo VARCHAR(255), -- Para verificação de integridade
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela para registros detalhados de atendimentos por guias tabuladas
CREATE TABLE IF NOT EXISTS atendimentos_guias_tabuladas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unidade_id UUID REFERENCES unidades(id),
    numero_guia VARCHAR(50) UNIQUE NOT NULL,
    paciente_nome VARCHAR(255) NOT NULL,
    paciente_documento VARCHAR(20),
    convenio VARCHAR(100) NOT NULL,
    procedimento TEXT NOT NULL,
    codigo_procedimento VARCHAR(20),
    valor_guia DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_pago DECIMAL(12,2),
    valor_glosa DECIMAL(12,2) DEFAULT 0,
    data_atendimento DATE NOT NULL,
    data_autorizacao DATE,
    profissional_nome VARCHAR(255),
    profissional_id UUID,
    status VARCHAR(20) DEFAULT 'Realizado' CHECK (status IN ('Agendado', 'Realizado', 'Cancelado', 'Em_Processamento')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. View para análise de superávit por unidade
CREATE OR REPLACE VIEW vw_analise_superavit_unidades AS
WITH receitas_unidade AS (
    SELECT 
        u.id as unidade_id,
        u.nome as unidade_nome,
        COALESCE(SUM(CASE WHEN cr.origem = 'Particular' THEN cr.valor_liquido END), 0) as receita_particular,
        COALESCE(SUM(CASE WHEN cr.origem = 'Guia_Tabulada' THEN cr.valor_liquido END), 0) as receita_guias,
        COALESCE(SUM(CASE WHEN cr.origem NOT IN ('Particular', 'Guia_Tabulada') THEN cr.valor_liquido END), 0) as receita_convenios,
        COALESCE(SUM(cr.valor_liquido), 0) as receita_total
    FROM unidades u
    LEFT JOIN contas_receber cr ON u.id = cr.unidade_id 
        AND cr.status = 'Recebido'
        AND cr.data_vencimento >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY u.id, u.nome
),
despesas_unidade AS (
    SELECT 
        u.id as unidade_id,
        u.nome as unidade_nome,
        COALESCE(SUM(CASE WHEN cp.categoria = 'Consumo' THEN cp.valor END), 0) as despesa_consumo,
        COALESCE(SUM(CASE WHEN cp.categoria = 'Fixa' THEN cp.valor END), 0) as despesa_fixa,
        COALESCE(SUM(CASE WHEN cp.categoria = 'Variavel' THEN cp.valor END), 0) as despesa_variavel,
        COALESCE(SUM(cp.valor), 0) as despesa_total
    FROM unidades u
    LEFT JOIN contas_pagar cp ON u.id = cp.unidade_id 
        AND cp.status IN ('Pago', 'Pendente')
        AND cp.data_vencimento >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY u.id, u.nome
),
folha_unidade AS (
    SELECT 
        u.id as unidade_id,
        COALESCE(SUM(fc.salario_base + fc.encargos), 0) as folha_clt,
        COALESCE(SUM(fp.valor_bruto), 0) as folha_pj
    FROM unidades u
    LEFT JOIN folha_clt fc ON u.id = fc.unidade_id 
        AND fc.mes_referencia = DATE_TRUNC('month', CURRENT_DATE)
    LEFT JOIN folha_pj fp ON u.id = fp.unidade_id 
        AND fp.mes_referencia = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY u.id
),
atendimentos_unidade AS (
    SELECT 
        u.id as unidade_id,
        COUNT(agt.id) as total_atendimentos,
        COUNT(CASE WHEN agt.convenio != 'Particular' THEN 1 END) as atendimentos_guias,
        COUNT(CASE WHEN agt.convenio = 'Particular' THEN 1 END) as atendimentos_particular,
        COALESCE(AVG(agt.valor_guia), 0) as ticket_medio
    FROM unidades u
    LEFT JOIN atendimentos_guias_tabuladas agt ON u.id = agt.unidade_id 
        AND agt.status = 'Realizado'
        AND agt.data_atendimento >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY u.id
)
SELECT 
    r.unidade_id,
    r.unidade_nome,
    r.receita_particular,
    r.receita_guias,
    r.receita_convenios,
    r.receita_total,
    d.despesa_consumo,
    d.despesa_fixa,
    d.despesa_variavel,
    d.despesa_total,
    f.folha_clt,
    f.folha_pj,
    (d.despesa_total + f.folha_clt + f.folha_pj) as custo_total,
    (r.receita_total - (d.despesa_total + f.folha_clt + f.folha_pj)) as superavit,
    CASE 
        WHEN r.receita_total > 0 THEN 
            ROUND(((r.receita_total - (d.despesa_total + f.folha_clt + f.folha_pj)) / r.receita_total * 100), 2)
        ELSE 0 
    END as margem_percentual,
    CASE 
        WHEN (r.receita_total - (d.despesa_total + f.folha_clt + f.folha_pj)) > 0 THEN 'Lucro'
        WHEN (r.receita_total - (d.despesa_total + f.folha_clt + f.folha_pj)) < 0 THEN 'Prejuizo'
        ELSE 'Equilibrio'
    END as status_financeiro,
    a.total_atendimentos,
    a.atendimentos_guias,
    a.atendimentos_particular,
    a.ticket_medio
FROM receitas_unidade r
LEFT JOIN despesas_unidade d ON r.unidade_id = d.unidade_id
LEFT JOIN folha_unidade f ON r.unidade_id = f.unidade_id
LEFT JOIN atendimentos_unidade a ON r.unidade_id = a.unidade_id;

-- 4. View para análise detalhada de atendimentos por guias
CREATE OR REPLACE VIEW vw_resumo_atendimentos_guias AS
SELECT 
    u.nome as unidade_nome,
    agt.convenio,
    COUNT(*) as total_atendimentos,
    SUM(agt.valor_guia) as valor_total_guias,
    AVG(agt.valor_guia) as ticket_medio,
    SUM(agt.valor_glosa) as total_glosas,
    CASE 
        WHEN SUM(agt.valor_guia) > 0 THEN 
            ROUND((SUM(agt.valor_glosa) / SUM(agt.valor_guia) * 100), 2)
        ELSE 0 
    END as percentual_glosa,
    DATE_TRUNC('month', agt.data_atendimento) as mes_referencia
FROM atendimentos_guias_tabuladas agt
JOIN unidades u ON agt.unidade_id = u.id
WHERE agt.status = 'Realizado'
    AND agt.data_atendimento >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
GROUP BY u.nome, agt.convenio, DATE_TRUNC('month', agt.data_atendimento)
ORDER BY mes_referencia DESC, u.nome, agt.convenio;

-- 5. Função para calcular ranking de unidades por performance
CREATE OR REPLACE FUNCTION calcular_ranking_unidades(periodo_meses INTEGER DEFAULT 1)
RETURNS TABLE (
    unidade_id UUID,
    unidade_nome VARCHAR,
    receita_total DECIMAL,
    custo_total DECIMAL,
    superavit DECIMAL,
    margem_percentual DECIMAL,
    total_atendimentos BIGINT,
    ranking_receita INTEGER,
    ranking_margem INTEGER,
    ranking_atendimentos INTEGER,
    score_geral DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH dados_unidades AS (
        SELECT * FROM vw_analise_superavit_unidades
    ),
    rankings AS (
        SELECT 
            du.*,
            ROW_NUMBER() OVER (ORDER BY du.receita_total DESC) as rank_receita,
            ROW_NUMBER() OVER (ORDER BY du.margem_percentual DESC) as rank_margem,
            ROW_NUMBER() OVER (ORDER BY du.total_atendimentos DESC) as rank_atendimentos
        FROM dados_unidades du
    )
    SELECT 
        r.unidade_id,
        r.unidade_nome,
        r.receita_total,
        r.custo_total,
        r.superavit,
        r.margem_percentual,
        r.total_atendimentos,
        r.rank_receita::INTEGER,
        r.rank_margem::INTEGER,
        r.rank_atendimentos::INTEGER,
        -- Score geral (média ponderada dos rankings)
        ROUND((
            (10 - r.rank_receita) * 0.4 + 
            (10 - r.rank_margem) * 0.4 + 
            (10 - r.rank_atendimentos) * 0.2
        ), 2) as score_geral
    FROM rankings r
    ORDER BY score_geral DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Triggers para auditoria
CREATE TRIGGER anexos_notas_fiscais_updated_at
    BEFORE UPDATE ON anexos_notas_fiscais
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER atendimentos_guias_updated_at
    BEFORE UPDATE ON atendimentos_guias_tabuladas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS (Row Level Security)
ALTER TABLE anexos_notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos_guias_tabuladas ENABLE ROW LEVEL SECURITY;

-- Políticas para anexos de notas fiscais
CREATE POLICY "Usuários podem ver anexos da sua unidade" ON anexos_notas_fiscais
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contas_pagar cp 
            WHERE cp.id = conta_pagar_id 
            AND cp.unidade_id = get_user_unidade_id()
        )
    );

CREATE POLICY "Usuários podem inserir anexos na sua unidade" ON anexos_notas_fiscais
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM contas_pagar cp 
            WHERE cp.id = conta_pagar_id 
            AND cp.unidade_id = get_user_unidade_id()
        )
    );

-- Políticas para atendimentos por guias
CREATE POLICY "Usuários podem ver atendimentos da sua unidade" ON atendimentos_guias_tabuladas
    FOR SELECT USING (unidade_id = get_user_unidade_id());

CREATE POLICY "Usuários podem inserir atendimentos na sua unidade" ON atendimentos_guias_tabuladas
    FOR INSERT WITH CHECK (unidade_id = get_user_unidade_id());

CREATE POLICY "Usuários podem editar atendimentos da sua unidade" ON atendimentos_guias_tabuladas
    FOR UPDATE USING (unidade_id = get_user_unidade_id());

-- 8. Índices para performance
CREATE INDEX IF NOT EXISTS idx_anexos_notas_conta_pagar ON anexos_notas_fiscais(conta_pagar_id);
CREATE INDEX IF NOT EXISTS idx_anexos_notas_data_upload ON anexos_notas_fiscais(data_upload);

CREATE INDEX IF NOT EXISTS idx_atendimentos_guias_unidade ON atendimentos_guias_tabuladas(unidade_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_guias_data ON atendimentos_guias_tabuladas(data_atendimento);
CREATE INDEX IF NOT EXISTS idx_atendimentos_guias_convenio ON atendimentos_guias_tabuladas(convenio);
CREATE INDEX IF NOT EXISTS idx_atendimentos_guias_status ON atendimentos_guias_tabuladas(status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_guias_numero ON atendimentos_guias_tabuladas(numero_guia);

-- 9. Inserir dados de exemplo para atendimentos por guias
INSERT INTO atendimentos_guias_tabuladas (
    unidade_id, numero_guia, paciente_nome, convenio, procedimento, 
    valor_guia, data_atendimento, profissional_nome, status
) VALUES 
    (
        (SELECT id FROM unidades LIMIT 1),
        'GT2025001',
        'João Silva Santos',
        'Unimed',
        'Consulta Cardiológica',
        180.00,
        CURRENT_DATE - INTERVAL '5 days',
        'Dr. Carlos Mendes',
        'Realizado'
    ),
    (
        (SELECT id FROM unidades LIMIT 1),
        'GT2025002',
        'Maria Oliveira Lima',
        'Bradesco Saúde',
        'Terapia Individual',
        120.00,
        CURRENT_DATE - INTERVAL '3 days',
        'Dra. Ana Paula Rocha',
        'Realizado'
    ),
    (
        (SELECT id FROM unidades OFFSET 1 LIMIT 1),
        'GT2025003',
        'Pedro Costa Almeida',
        'SulAmérica',
        'Consulta Neurológica',
        220.00,
        CURRENT_DATE - INTERVAL '2 days',
        'Dr. Roberto Ferreira',
        'Realizado'
    )
ON CONFLICT (numero_guia) DO NOTHING;

COMMENT ON TABLE anexos_notas_fiscais IS 'Anexos de notas fiscais para contas a pagar com upload de arquivos';
COMMENT ON TABLE atendimentos_guias_tabuladas IS 'Registros detalhados de atendimentos realizados através de guias tabuladas';
COMMENT ON VIEW vw_analise_superavit_unidades IS 'Análise completa de superávit financeiro por unidade incluindo receitas, despesas e atendimentos';
COMMENT ON VIEW vw_resumo_atendimentos_guias IS 'Resumo de atendimentos por guias tabuladas agrupado por unidade e convênio';
COMMENT ON FUNCTION calcular_ranking_unidades IS 'Calcula ranking de performance das unidades baseado em receita, margem e atendimentos';
