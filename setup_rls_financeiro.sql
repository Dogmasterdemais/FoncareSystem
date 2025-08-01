-- Configuração de Row Level Security (RLS) para o módulo financeiro
-- Execute após o script setup_modulo_financeiro.sql

-- 1. Habilitar RLS nas tabelas
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos_guias_tabuladas ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos_notas_fiscais ENABLE ROW LEVEL SECURITY;

-- 2. Policies para contas_pagar
CREATE POLICY "Usuários autenticados podem ver contas a pagar" ON contas_pagar
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir contas a pagar" ON contas_pagar
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar contas a pagar" ON contas_pagar
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar contas a pagar" ON contas_pagar
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Policies para contas_receber
CREATE POLICY "Usuários autenticados podem ver contas a receber" ON contas_receber
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir contas a receber" ON contas_receber
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar contas a receber" ON contas_receber
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar contas a receber" ON contas_receber
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Policies para atendimentos_guias_tabuladas
CREATE POLICY "Usuários autenticados podem ver atendimentos" ON atendimentos_guias_tabuladas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir atendimentos" ON atendimentos_guias_tabuladas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar atendimentos" ON atendimentos_guias_tabuladas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar atendimentos" ON atendimentos_guias_tabuladas
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Policies para anexos_notas_fiscais
CREATE POLICY "Usuários autenticados podem ver anexos" ON anexos_notas_fiscais
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir anexos" ON anexos_notas_fiscais
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar anexos" ON anexos_notas_fiscais
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar anexos" ON anexos_notas_fiscais
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Configurar funções para facilitar consultas
CREATE OR REPLACE FUNCTION get_dashboard_financeiro()
RETURNS json AS $$
DECLARE
    resultado json;
BEGIN
    SELECT json_build_object(
        'total_pagar', COALESCE(SUM(CASE WHEN cp.status IN ('Pendente', 'Atrasado') THEN cp.valor ELSE 0 END), 0),
        'total_receber', COALESCE(SUM(CASE WHEN cr.status IN ('Pendente', 'Atrasado') THEN cr.valor_liquido ELSE 0 END), 0),
        'receita_mes', COALESCE(SUM(CASE WHEN cr.status = 'Recebido' AND cr.data_recebimento >= DATE_TRUNC('month', CURRENT_DATE) THEN cr.valor_liquido ELSE 0 END), 0),
        'despesa_mes', COALESCE(SUM(CASE WHEN cp.status = 'Pago' AND cp.data_pagamento >= DATE_TRUNC('month', CURRENT_DATE) THEN cp.valor ELSE 0 END), 0),
        'atendimentos_mes', (SELECT COUNT(*) FROM atendimentos_guias_tabuladas WHERE data_atendimento >= DATE_TRUNC('month', CURRENT_DATE)),
        'ticket_medio', COALESCE(AVG(agt.valor_guia), 0),
        'contas_vencendo', (
            SELECT COUNT(*) 
            FROM contas_pagar 
            WHERE status = 'Pendente' 
            AND data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        )
    ) INTO resultado
    FROM contas_pagar cp
    FULL OUTER JOIN contas_receber cr ON 1=1
    FULL OUTER JOIN atendimentos_guias_tabuladas agt ON agt.data_atendimento >= DATE_TRUNC('month', CURRENT_DATE);
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para gerar relatório de superávit por período
CREATE OR REPLACE FUNCTION get_relatorio_superavit(
    data_inicio DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
    data_fim DATE DEFAULT CURRENT_DATE,
    unidade_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
    unidade_id UUID,
    unidade_nome TEXT,
    receita_total DECIMAL,
    despesa_total DECIMAL,
    resultado DECIMAL,
    margem_percentual DECIMAL,
    total_atendimentos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH receitas AS (
        SELECT 
            u.id,
            u.nome,
            COALESCE(SUM(cr.valor_liquido), 0) as receita
        FROM unidades u
        LEFT JOIN contas_receber cr ON u.id = cr.unidade_id 
            AND cr.status = 'Recebido'
            AND cr.data_recebimento BETWEEN data_inicio AND data_fim
        WHERE (unidade_id_param IS NULL OR u.id = unidade_id_param)
        GROUP BY u.id, u.nome
    ),
    despesas AS (
        SELECT 
            u.id,
            COALESCE(SUM(cp.valor), 0) as despesa
        FROM unidades u
        LEFT JOIN contas_pagar cp ON u.id = cp.unidade_id 
            AND cp.status = 'Pago'
            AND cp.data_pagamento BETWEEN data_inicio AND data_fim
        WHERE (unidade_id_param IS NULL OR u.id = unidade_id_param)
        GROUP BY u.id
    ),
    atendimentos AS (
        SELECT 
            u.id,
            COUNT(agt.id) as total
        FROM unidades u
        LEFT JOIN atendimentos_guias_tabuladas agt ON u.id = agt.unidade_id 
            AND agt.data_atendimento BETWEEN data_inicio AND data_fim
        WHERE (unidade_id_param IS NULL OR u.id = unidade_id_param)
        GROUP BY u.id
    )
    SELECT 
        r.id,
        r.nome::TEXT,
        r.receita::DECIMAL,
        d.despesa::DECIMAL,
        (r.receita - d.despesa)::DECIMAL,
        CASE 
            WHEN r.receita > 0 THEN ROUND(((r.receita - d.despesa) / r.receita) * 100, 2)::DECIMAL
            ELSE 0::DECIMAL
        END,
        a.total
    FROM receitas r
    JOIN despesas d ON r.id = d.id
    JOIN atendimentos a ON r.id = a.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Verificar se as policies foram criadas
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE POLICIES ===';
    RAISE NOTICE 'Policies contas_pagar: %', (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE tablename = 'contas_pagar'
    );
    RAISE NOTICE 'Policies contas_receber: %', (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE tablename = 'contas_receber'
    );
    RAISE NOTICE 'Policies atendimentos: %', (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE tablename = 'atendimentos_guias_tabuladas'
    );
    RAISE NOTICE 'Policies anexos: %', (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE tablename = 'anexos_notas_fiscais'
    );
    RAISE NOTICE 'RLS configurado com sucesso! ✓';
END $$;
