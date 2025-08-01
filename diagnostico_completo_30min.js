const { createClient } = require('@supabase/supabase-js');

// Credenciais diretas para o teste
const supabase = createClient(
  'https://urpfjihtkvvqehjppbrg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4'
);

async function diagnosticarECorrigir() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO SISTEMA');
  console.log('=' .repeat(60));

  try {
    const hoje = new Date().toISOString().split('T')[0];

    // 1. VERIFICAR ESTRUTURA DA TABELA AGENDAMENTOS
    console.log('1️⃣ VERIFICANDO ESTRUTURA DA TABELA AGENDAMENTOS...');
    
    try {
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select('*')
        .limit(1);

      if (agendamentosError) {
        console.log('❌ Erro na tabela agendamentos:', agendamentosError.message);
      } else {
        console.log('✅ Tabela agendamentos acessível');
        if (agendamentos && agendamentos.length > 0) {
          console.log('📋 Campos disponíveis:', Object.keys(agendamentos[0]));
          
          // Verificar se tem paciente_nome ou paciente_id
          const campos = Object.keys(agendamentos[0]);
          const temPacienteNome = campos.includes('paciente_nome');
          const temPacienteId = campos.includes('paciente_id');
          
          console.log(`   📝 paciente_nome: ${temPacienteNome ? '✅' : '❌'}`);
          console.log(`   📝 paciente_id: ${temPacienteId ? '✅' : '❌'}`);
          console.log(`   📝 sessao_iniciada_em: ${campos.includes('sessao_iniciada_em') ? '✅' : '❌'}`);
          console.log(`   📝 profissional_ativo: ${campos.includes('profissional_ativo') ? '✅' : '❌'}`);
          console.log(`   📝 tipo_sessao: ${campos.includes('tipo_sessao') ? '✅' : '❌'}`);
        }
      }
    } catch (e) {
      console.log('❌ Erro inesperado:', e.message);
    }

    // 2. VERIFICAR VIEW VW_AGENDAMENTOS_COMPLETO
    console.log('\n2️⃣ VERIFICANDO VIEW VW_AGENDAMENTOS_COMPLETO...');
    
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .limit(1);

      if (viewError) {
        console.log('❌ Erro na view:', viewError.message);
      } else {
        console.log('✅ View vw_agendamentos_completo acessível');
        if (viewData && viewData.length > 0) {
          console.log('📋 Campos da view:', Object.keys(viewData[0]));
          
          const campos = Object.keys(viewData[0]);
          console.log(`   📝 paciente_nome: ${campos.includes('paciente_nome') ? '✅' : '❌'}`);
          console.log(`   📝 profissional_nome: ${campos.includes('profissional_nome') ? '✅' : '❌'}`);
          console.log(`   📝 especialidade_nome: ${campos.includes('especialidade_nome') ? '✅' : '❌'}`);
        }
      }
    } catch (e) {
      console.log('❌ Erro inesperado na view:', e.message);
    }

    // 3. TESTAR FUNÇÃO ATUAL
    console.log('\n3️⃣ TESTANDO FUNÇÃO ATUAL...');
    
    try {
      const { data: funcaoData, error: funcaoError } = await supabase
        .rpc('executar_processamento_automatico');
      
      if (funcaoError) {
        console.log('❌ Função falhou:', funcaoError.message);
        
        if (funcaoError.message.includes('logs_agendamentos')) {
          console.log('🔧 PROBLEMA: Função tentando usar tabela logs_agendamentos que não existe');
        }
        if (funcaoError.message.includes('does not exist')) {
          console.log('🔧 PROBLEMA: Função não existe no banco');
        }
      } else {
        console.log('✅ Função executou:', funcaoData);
      }
    } catch (e) {
      console.log('❌ Erro na função:', e.message);
    }

    // 4. VERIFICAR AGENDAMENTOS HOJE
    console.log('\n4️⃣ VERIFICANDO AGENDAMENTOS DE HOJE...');
    
    try {
      // Tentar com a view primeiro
      const { data: agendamentosHoje, error: agendamentosHojeError } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .eq('data_agendamento', hoje);

      if (agendamentosHojeError) {
        console.log('❌ Erro ao buscar agendamentos da view:', agendamentosHojeError.message);
        
        // Tentar com tabela direta
        const { data: agendamentosTabela, error: agendamentosTabelaError } = await supabase
          .from('agendamentos')
          .select(`
            id,
            status,
            data_agendamento,
            paciente_id,
            horario_inicio,
            salas(numero, nome),
            pacientes(nome)
          `)
          .eq('data_agendamento', hoje);

        if (agendamentosTabelaError) {
          console.log('❌ Erro ao buscar agendamentos da tabela:', agendamentosTabelaError.message);
        } else {
          console.log(`✅ Encontrados ${agendamentosTabela?.length || 0} agendamentos hoje (tabela direta)`);
          if (agendamentosTabela && agendamentosTabela.length > 0) {
            agendamentosTabela.slice(0, 3).forEach((ag, i) => {
              console.log(`   ${i + 1}. ${ag.pacientes?.nome || 'SEM NOME'} - Status: ${ag.status} - Sala: ${ag.salas?.numero}`);
            });
          }
        }
      } else {
        console.log(`✅ Encontrados ${agendamentosHoje?.length || 0} agendamentos hoje (view)`);
        if (agendamentosHoje && agendamentosHoje.length > 0) {
          agendamentosHoje.slice(0, 3).forEach((ag, i) => {
            console.log(`   ${i + 1}. ${ag.paciente_nome || 'SEM NOME'} - Status: ${ag.status} - Sala: ${ag.sala_numero}`);
          });
        }
      }
    } catch (e) {
      console.log('❌ Erro inesperado ao buscar agendamentos:', e.message);
    }

    // 5. MOSTRAR SQL CORRIGIDO
    console.log('\n5️⃣ SQL CORRIGIDO PARA EXECUTAR NO SUPABASE DASHBOARD:');
    console.log('=' .repeat(60));
    
    const sqlCorrigido = `
-- FUNÇÃO CORRIGIDA PARA SISTEMA DE 30 MINUTOS
CREATE OR REPLACE FUNCTION processar_transicoes_automaticas()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    agendamento_record RECORD;
    tempo_atual INTEGER;
    observacao_log TEXT;
    contador_processados INTEGER := 0;
    resultado TEXT := '';
BEGIN
    -- Usar agendamentos com JOIN para pacientes
    FOR agendamento_record IN 
        SELECT 
            a.id,
            p.nome as paciente_nome,
            a.tipo_sessao,
            a.profissional_ativo,
            a.sessao_iniciada_em,
            a.tempo_profissional_1,
            a.tempo_profissional_2,
            a.tempo_profissional_3,
            EXTRACT(EPOCH FROM (NOW() - a.sessao_iniciada_em))::INTEGER / 60 as tempo_decorrido_minutos
        FROM agendamentos a
        LEFT JOIN pacientes p ON a.paciente_id = p.id
        WHERE a.status = 'em_atendimento' 
        AND a.sessao_iniciada_em IS NOT NULL
    LOOP
        tempo_atual := agendamento_record.tempo_decorrido_minutos;
        observacao_log := '';

        -- INDIVIDUAL: 30min → concluído
        IF agendamento_record.tipo_sessao = 'individual' OR agendamento_record.tipo_sessao IS NULL THEN
            IF tempo_atual >= 30 THEN
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão individual concluída aos 30min';
                contador_processados := contador_processados + 1;
            END IF;

        -- COMPARTILHADA: 30min → Prof.2, 60min → concluído
        ELSIF agendamento_record.tipo_sessao = 'compartilhada' THEN
            IF tempo_atual >= 30 AND tempo_atual < 60 AND agendamento_record.profissional_ativo = 1 THEN
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 2 assumiu aos 30min';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 60 AND agendamento_record.profissional_ativo = 2 THEN
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão compartilhada concluída aos 60min';
                contador_processados := contador_processados + 1;
            END IF;

        -- TRIPLA: 30min → Prof.2, 60min → Prof.3, 90min → concluído
        ELSIF agendamento_record.tipo_sessao = 'tripla' THEN
            IF tempo_atual >= 30 AND tempo_atual < 60 AND agendamento_record.profissional_ativo = 1 THEN
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 2,
                    tempo_profissional_1 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 2 assumiu aos 30min';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 60 AND tempo_atual < 90 AND agendamento_record.profissional_ativo = 2 THEN
                UPDATE agendamentos 
                SET 
                    profissional_ativo = 3,
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_sessao_atual = tempo_atual,
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Profissional 3 assumiu aos 60min';
                contador_processados := contador_processados + 1;
                
            ELSIF tempo_atual >= 90 AND agendamento_record.profissional_ativo = 3 THEN
                UPDATE agendamentos 
                SET 
                    status = 'concluido',
                    tempo_profissional_1 = 30,
                    tempo_profissional_2 = 30,
                    tempo_profissional_3 = 30,
                    tempo_sessao_atual = tempo_atual,
                    sessao_finalizada_em = NOW(),
                    updated_at = NOW()
                WHERE id = agendamento_record.id;
                observacao_log := 'AUTO: Sessão tripla concluída aos 90min';
                contador_processados := contador_processados + 1;
            END IF;
        END IF;

        -- Log do resultado
        IF observacao_log != '' THEN
            resultado := resultado || 'Paciente: ' || COALESCE(agendamento_record.paciente_nome, 'SEM NOME') || ' - ' || observacao_log || E'\\n';
            RAISE NOTICE 'Transição: % - %', agendamento_record.id, observacao_log;
        END IF;
    END LOOP;

    IF contador_processados = 0 THEN
        resultado := 'Nenhuma transição automática necessária';
    ELSE
        resultado := 'Processados: ' || contador_processados || ' agendamentos' || E'\\n' || resultado;
    END IF;

    RETURN resultado;
END;
$$;

-- Função principal
CREATE OR REPLACE FUNCTION executar_processamento_automatico()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    resultado TEXT;
BEGIN
    resultado := processar_transicoes_automaticas();
    resultado := '[' || NOW()::TEXT || '] ' || resultado;
    RAISE NOTICE 'PROCESSAMENTO: %', resultado;
    RETURN resultado;
END;
$$;
`;

    console.log(sqlCorrigido);
    console.log('=' .repeat(60));

    // 6. RESUMO
    console.log('\n6️⃣ RESUMO DO DIAGNÓSTICO:');
    console.log('✅ Sistema detectou os problemas principais');
    console.log('🔧 SQL corrigido mostrado acima');
    console.log('📋 Próximos passos:');
    console.log('   1. Copie o SQL acima');
    console.log('   2. Execute no Supabase Dashboard > SQL Editor');
    console.log('   3. Teste com: SELECT executar_processamento_automatico();');
    console.log('   4. Configure timer automático no frontend (a cada 30s)');

    return true;

  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
    return false;
  }
}

// Executar diagnóstico
diagnosticarECorrigir()
  .then(sucesso => {
    if (sucesso) {
      console.log('\n🎉 DIAGNÓSTICO COMPLETO REALIZADO!');
    } else {
      console.log('\n💥 ERRO NO DIAGNÓSTICO');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 ERRO FATAL:', error);
    process.exit(1);
  });
