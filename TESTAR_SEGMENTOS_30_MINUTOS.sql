-- ============================================================
-- TESTE PRÁTICO DO SISTEMA DE SEGMENTOS
-- Execute este script no Supabase para testar a funcionalidade
-- ============================================================

-- 1. VERIFICAR SE SISTEMA ESTÁ FUNCIONANDO
DO $$
DECLARE
    v_teste_agendamento_id UUID;
    v_sala_id UUID;
    v_paciente_id UUID;
    v_profissional_id UUID;
    v_unidade_id UUID;
    v_count_segmentos INTEGER;
BEGIN
    -- Buscar IDs necessários para teste
    SELECT id INTO v_sala_id FROM salas WHERE eh_sala_terapia_90min(nome) LIMIT 1;
    SELECT id INTO v_paciente_id FROM pacientes LIMIT 1;
    SELECT id INTO v_profissional_id FROM colaboradores LIMIT 1;
    SELECT id INTO v_unidade_id FROM unidades LIMIT 1;
    
    IF v_sala_id IS NOT NULL AND v_paciente_id IS NOT NULL AND v_profissional_id IS NOT NULL THEN
        -- Criar agendamento teste
        INSERT INTO agendamentos (
            paciente_id,
            profissional_id,
            sala_id,
            unidade_id,
            data_agendamento,
            horario_inicio,
            horario_fim,
            duracao_minutos,
            tipo_sessao,
            modalidade,
            valor_sessao,
            observacoes
        ) VALUES (
            v_paciente_id,
            v_profissional_id,
            v_sala_id,
            v_unidade_id,
            CURRENT_DATE + 1,
            '14:00',
            '15:30',
            90,
            'Terapia',
            'presencial',
            300.00,
            'TESTE AUTOMÁTICO - Sistema de Segmentos'
        ) RETURNING id INTO v_teste_agendamento_id;
        
        -- Aguardar trigger executar
        PERFORM pg_sleep(1);
        
        -- Verificar se segmentos foram criados
        SELECT COUNT(*) INTO v_count_segmentos
        FROM agendamentos_segmentos 
        WHERE agendamento_principal_id = v_teste_agendamento_id;
        
        RAISE NOTICE '=== TESTE DO SISTEMA DE SEGMENTOS ===';
        RAISE NOTICE 'Agendamento teste criado: %', v_teste_agendamento_id;
        RAISE NOTICE 'Segmentos criados automaticamente: %', v_count_segmentos;
        
        IF v_count_segmentos = 3 THEN
            RAISE NOTICE '✅ SISTEMA FUNCIONANDO CORRETAMENTE!';
            
            -- Mostrar detalhes dos segmentos
            RAISE NOTICE 'Detalhes dos segmentos:';
            FOR i IN 1..3 LOOP
                DECLARE
                    v_horario_inicio TIME;
                    v_valor DECIMAL(10,2);
                BEGIN
                    SELECT horario_inicio_segmento, valor_segmento 
                    INTO v_horario_inicio, v_valor
                    FROM agendamentos_segmentos 
                    WHERE agendamento_principal_id = v_teste_agendamento_id 
                      AND numero_segmento = i;
                    
                    RAISE NOTICE 'Segmento %: % - R$ %', i, v_horario_inicio, v_valor;
                END;
            END LOOP;
        ELSE
            RAISE NOTICE '❌ ERRO: Esperado 3 segmentos, criados %', v_count_segmentos;
        END IF;
        
        -- Limpar teste
        DELETE FROM agendamentos WHERE id = v_teste_agendamento_id;
        RAISE NOTICE 'Agendamento teste removido.';
        
    ELSE
        RAISE NOTICE '❌ ERRO: Não foi possível encontrar dados para teste';
        RAISE NOTICE 'Sala terapia: %', v_sala_id;
        RAISE NOTICE 'Paciente: %', v_paciente_id;
        RAISE NOTICE 'Profissional: %', v_profissional_id;
    END IF;
END;
$$;

-- 2. MOSTRAR ESTATÍSTICAS FINAIS
SELECT 
    'ESTATÍSTICAS FINAIS' as titulo,
    (SELECT COUNT(*) FROM agendamentos) as total_agendamentos,
    (SELECT COUNT(*) FROM agendamentos_segmentos) as total_segmentos,
    (SELECT COUNT(*) FROM agendamentos a INNER JOIN salas s ON a.sala_id = s.id WHERE eh_sala_terapia_90min(s.nome)) as agendamentos_terapia;

-- ============================================================
-- TESTE CONCLUÍDO
-- 
-- Se o teste passou:
-- ✅ Sistema está funcionando
-- ✅ Triggers automáticos ativos
-- ✅ Segmentos sendo criados corretamente
-- ============================================================
