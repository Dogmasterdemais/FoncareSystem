-- Script para atualizar capacidade máxima das salas para 3 profissionais
-- Execute este script no Supabase SQL Editor

-- Atualizar todas as salas existentes para capacidade máxima de 3
UPDATE salas 
SET capacidade_maxima = 3 
WHERE capacidade_maxima IS NULL OR capacidade_maxima != 3;

-- Verificar o resultado
SELECT 
    nome,
    capacidade_maxima,
    COUNT(*) as total_salas
FROM salas 
WHERE ativo = true
GROUP BY nome, capacidade_maxima
ORDER BY nome;

-- Estatísticas das alterações
SELECT 
    COUNT(*) as total_salas_atualizadas,
    'Capacidade máxima atualizada para 3 profissionais' as descricao
FROM salas 
WHERE ativo = true AND capacidade_maxima = 3;
