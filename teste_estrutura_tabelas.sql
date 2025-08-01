-- TESTE RÁPIDO: Verificar estrutura das tabelas primeiro
SELECT 'Testando estrutura das tabelas...' as status;

-- Teste 1: Verificar coluna de pacientes
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'pacientes' 
AND column_name LIKE '%nome%'
ORDER BY column_name;

-- Teste 2: Verificar coluna de colaboradores  
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
AND column_name LIKE '%nome%'
ORDER BY column_name;

-- Teste 3: Verificar se existem registros na view atual
SELECT COUNT(*) as total_registros 
FROM vw_agenda_tempo_real 
WHERE DATE(created_at) = CURRENT_DATE;

SELECT 'Estrutura verificada! Agora execute a correção...' as proximo_passo;
