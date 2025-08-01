-- Script para recriar view vw_agendamentos_completo
-- Execute APÓS rodar recriar_salas_vazia.sql e inserir dados

-- Recriar a view vw_agendamentos_completo
CREATE OR REPLACE VIEW "public"."vw_agendamentos_completo" AS
SELECT 
    a.id,
    a.paciente_id,
    a.profissional_id,
    a.sala_id,
    a.unidade_id,
    a.data_agendamento,
    a.horario_inicio,
    a.horario_fim,
    a.status,
    a.observacoes,
    a.created_at,
    a.updated_at,
    
    -- Dados da sala
    s.nome as sala_nome,
    s.numero as sala_numero,
    s.tipo as sala_tipo,
    s.cor as sala_cor,
    
    -- Dados do paciente (se houver tabela pacientes)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pacientes') 
        THEN (SELECT nome FROM pacientes WHERE id = a.paciente_id)
        ELSE NULL 
    END as paciente_nome,
    
    -- Dados da unidade (se houver tabela unidades)
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unidades') 
        THEN (SELECT nome FROM unidades WHERE id = a.unidade_id)
        ELSE NULL 
    END as unidade_nome

FROM "public"."agendamentos" a
LEFT JOIN "public"."salas" s ON a.sala_id = s.id;

-- Comentário da view
COMMENT ON VIEW "public"."vw_agendamentos_completo" IS 'View que combina dados de agendamentos com informações das salas, pacientes e unidades';

-- Verificar se a view foi criada
SELECT 'View vw_agendamentos_completo recriada com sucesso!' as resultado;
