-- Criar tabela procedimentos_tuss se não existir
CREATE TABLE IF NOT EXISTS procedimentos_tuss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  convenio_nome VARCHAR(100) NOT NULL,
  dados_lista_suspensa JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_procedimentos_tuss_convenio ON procedimentos_tuss(convenio_nome);
CREATE INDEX IF NOT EXISTS idx_procedimentos_tuss_codigo ON procedimentos_tuss(codigo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_procedimentos_tuss_codigo_convenio ON procedimentos_tuss(codigo, convenio_nome);

-- Inserir alguns dados de exemplo (evitar duplicatas)
INSERT INTO procedimentos_tuss (codigo, descricao, convenio_nome, dados_lista_suspensa) VALUES
-- GNDI
('03.01.01.007-2', 'Consulta médica em atenção primária', 'GNDI', '{"tipo": "consulta", "categoria": "atenção_primaria"}'),
('03.01.01.008-0', 'Consulta médica em atenção especializada', 'GNDI', '{"tipo": "consulta", "categoria": "especializada"}'),
('03.01.07.002-6', 'Psicoterapia individual', 'GNDI', '{"tipo": "terapia", "categoria": "psicologia"}'),
('03.01.07.003-4', 'Psicoterapia em grupo', 'GNDI', '{"tipo": "terapia", "categoria": "psicologia"}'),
('03.01.07.004-2', 'Psicodiagnóstico', 'GNDI', '{"tipo": "avaliacao", "categoria": "psicologia"}'),
('03.01.07.005-0', 'Neuropsicologia', 'GNDI', '{"tipo": "avaliacao", "categoria": "neuropsicologia"}'),

-- SEPACO
('0301010072', 'Consulta médica - atenção primária', 'SEPACO', '{"tipo": "consulta", "categoria": "atenção_primaria"}'),
('0301010080', 'Consulta médica - atenção especializada', 'SEPACO', '{"tipo": "consulta", "categoria": "especializada"}'),
('0301070026', 'Psicoterapia individual', 'SEPACO', '{"tipo": "terapia", "categoria": "psicologia"}'),
('0301070034', 'Psicoterapia de grupo', 'SEPACO', '{"tipo": "terapia", "categoria": "psicologia"}'),
('0301070042', 'Avaliação psicológica', 'SEPACO', '{"tipo": "avaliacao", "categoria": "psicologia"}'),
('0301070050', 'Avaliação neuropsicológica', 'SEPACO', '{"tipo": "avaliacao", "categoria": "neuropsicologia"}'),

-- TOTAL MED CARE
('30101007-2', 'Consulta médica básica', 'TOTAL MED CARE', '{"tipo": "consulta", "categoria": "basica"}'),
('30101008-0', 'Consulta especializada', 'TOTAL MED CARE', '{"tipo": "consulta", "categoria": "especializada"}'),
('30107002-6', 'Sessão de psicoterapia', 'TOTAL MED CARE', '{"tipo": "terapia", "categoria": "psicologia"}'),
('30107003-4', 'Terapia em grupo', 'TOTAL MED CARE', '{"tipo": "terapia", "categoria": "psicologia"}'),
('30107004-2', 'Teste psicológico', 'TOTAL MED CARE', '{"tipo": "avaliacao", "categoria": "psicologia"}'),
('30107005-0', 'Avaliação neuropsicológica', 'TOTAL MED CARE', '{"tipo": "avaliacao", "categoria": "neuropsicologia"}'),

-- UNIHOSP
('UNI-001', 'Consulta ambulatorial', 'UNIHOSP', '{"tipo": "consulta", "categoria": "ambulatorial"}'),
('UNI-002', 'Consulta especializada', 'UNIHOSP', '{"tipo": "consulta", "categoria": "especializada"}'),
('UNI-PSI-001', 'Psicoterapia individual', 'UNIHOSP', '{"tipo": "terapia", "categoria": "psicologia"}'),
('UNI-PSI-002', 'Psicoterapia grupal', 'UNIHOSP', '{"tipo": "terapia", "categoria": "psicologia"}'),
('UNI-PSI-003', 'Avaliação psicológica', 'UNIHOSP', '{"tipo": "avaliacao", "categoria": "psicologia"}'),
('UNI-NEU-001', 'Avaliação neuropsicológica', 'UNIHOSP', '{"tipo": "avaliacao", "categoria": "neuropsicologia"}')

ON CONFLICT (codigo, convenio_nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  dados_lista_suspensa = EXCLUDED.dados_lista_suspensa,
  updated_at = NOW();
