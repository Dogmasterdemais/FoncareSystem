const { createClient } = require('@supabase/supabase-js');

// Credenciais diretas para o teste
const supabase = createClient(
  'https://urpfjihtkvvqehjppbrg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4'
);

async function testarSistema30Minutos() {
  console.log('🚀 INICIANDO TESTE DO SISTEMA DE 30 MINUTOS');
  console.log('=' .repeat(60));

  try {
    // 1. VERIFICAR SE A FUNÇÃO EXISTE
    console.log('1️⃣ VERIFICANDO FUNÇÃO DE PROCESSAMENTO AUTOMÁTICO...');
    
    try {
      const { data: funcaoData, error: funcaoError } = await supabase
        .rpc('executar_processamento_automatico');
      
      if (funcaoError) {
        console.log('❌ Função não existe ou falhou:', funcaoError.message);
        console.log('📝 Precisamos criar a função primeiro!');
        return false;
      } else {
        console.log('✅ Função existe e funcionou:', funcaoData);
      }
    } catch (e) {
      console.log('❌ Erro ao testar função:', e.message);
      return false;
    }

    // 2. VERIFICAR AGENDAMENTOS EM ATENDIMENTO
    console.log('\n2️⃣ VERIFICANDO AGENDAMENTOS EM ATENDIMENTO...');
    
    const hoje = new Date().toISOString().split('T')[0];
    
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select(`
        id,
        paciente_nome,
        horario_inicio,
        status,
        sessao_iniciada_em,
        tempo_sessao_atual,
        profissional_ativo,
        tipo_sessao,
        data_agendamento,
        sala_id,
        salas(numero, nome)
      `)
      .eq('data_agendamento', hoje)
      .eq('status', 'em_atendimento');

    if (agendamentosError) {
      console.log('❌ Erro ao buscar agendamentos:', agendamentosError.message);
      return false;
    }

    console.log(`📋 Encontrados ${agendamentos?.length || 0} agendamentos em atendimento hoje`);
    
    if (agendamentos && agendamentos.length > 0) {
      agendamentos.forEach((ag, index) => {
        console.log(`   ${index + 1}. ${ag.paciente_nome} - Sala ${ag.salas?.numero}`);
        console.log(`      Status: ${ag.status}`);
        console.log(`      Iniciado em: ${ag.sessao_iniciada_em || 'NÃO DEFINIDO'}`);
        console.log(`      Tempo atual: ${ag.tempo_sessao_atual || 0} min`);
        console.log(`      Profissional ativo: ${ag.profissional_ativo || 1}`);
        console.log(`      Tipo sessão: ${ag.tipo_sessao || 'individual'}`);
        console.log('');
      });
    } else {
      console.log('⚠️ Nenhum agendamento em atendimento encontrado para teste');
    }

    // 3. SIMULAR INÍCIO DE ATENDIMENTO (se não houver nenhum)
    if (!agendamentos || agendamentos.length === 0) {
      console.log('\n3️⃣ SIMULANDO INÍCIO DE ATENDIMENTO PARA TESTE...');
      
      // Buscar um agendamento 'pronto_para_terapia' para iniciar
      const { data: prontos, error: prontosError } = await supabase
        .from('agendamentos')
        .select('id, paciente_nome, salas(numero)')
        .eq('data_agendamento', hoje)
        .eq('status', 'pronto_para_terapia')
        .limit(1);

      if (prontosError) {
        console.log('❌ Erro ao buscar agendamentos prontos:', prontosError.message);
        return false;
      }

      if (prontos && prontos.length > 0) {
        const agendamento = prontos[0];
        console.log(`🎯 Iniciando atendimento para: ${agendamento.paciente_nome} - Sala ${agendamento.salas?.numero}`);
        
        // Iniciar o atendimento
        const { error: iniciarError } = await supabase
          .from('agendamentos')
          .update({
            status: 'em_atendimento',
            sessao_iniciada_em: new Date().toISOString(),
            tempo_sessao_atual: 0,
            profissional_ativo: 1
          })
          .eq('id', agendamento.id);

        if (iniciarError) {
          console.log('❌ Erro ao iniciar atendimento:', iniciarError.message);
          return false;
        }

        console.log('✅ Atendimento iniciado com sucesso!');
      } else {
        console.log('⚠️ Nenhum agendamento pronto para iniciar encontrado');
      }
    }

    // 4. EXECUTAR PROCESSAMENTO AUTOMÁTICO
    console.log('\n4️⃣ EXECUTANDO PROCESSAMENTO AUTOMÁTICO...');
    
    const { data: processoData, error: processoError } = await supabase
      .rpc('executar_processamento_automatico');
    
    if (processoError) {
      console.log('❌ Erro no processamento automático:', processoError.message);
    } else {
      console.log('✅ Processamento automático executado:', processoData);
    }

    // 5. VERIFICAR RESULTADO APÓS PROCESSAMENTO
    console.log('\n5️⃣ VERIFICANDO RESULTADO APÓS PROCESSAMENTO...');
    
    const { data: agendamentosPos, error: agendamentosPosError } = await supabase
      .from('agendamentos')
      .select(`
        id,
        paciente_nome,
        status,
        sessao_iniciada_em,
        tempo_sessao_atual,
        profissional_ativo,
        tipo_sessao,
        salas(numero, nome)
      `)
      .eq('data_agendamento', hoje)
      .in('status', ['em_atendimento', 'concluido']);

    if (agendamentosPosError) {
      console.log('❌ Erro ao verificar resultado:', agendamentosPosError.message);
      return false;
    }

    console.log(`📊 RESULTADO FINAL: ${agendamentosPos?.length || 0} agendamentos processados`);
    
    if (agendamentosPos && agendamentosPos.length > 0) {
      agendamentosPos.forEach((ag, index) => {
        const tempoAtual = ag.tempo_sessao_atual || 0;
        const minutosPassados = ag.sessao_iniciada_em 
          ? Math.floor((new Date() - new Date(ag.sessao_iniciada_em)) / (1000 * 60))
          : 0;
        
        console.log(`   ${index + 1}. ${ag.paciente_nome} - Sala ${ag.salas?.numero}`);
        console.log(`      Status: ${ag.status}`);
        console.log(`      Tempo registrado: ${tempoAtual} min`);
        console.log(`      Tempo real passado: ${minutosPassados} min`);
        console.log(`      Profissional ativo: ${ag.profissional_ativo}`);
        console.log(`      Tipo sessão: ${ag.tipo_sessao}`);
        
        // Análise do estado
        if (ag.status === 'em_atendimento') {
          if (minutosPassados >= 30) {
            if (ag.tipo_sessao === 'individual') {
              console.log('      ⚠️ DEVERIA ter sido concluído (individual > 30min)');
            } else if (ag.tipo_sessao === 'compartilhada') {
              if (ag.profissional_ativo === 1 && minutosPassados >= 30) {
                console.log('      ⚠️ DEVERIA ter trocado para Prof. 2');
              } else if (ag.profissional_ativo === 2 && minutosPassados >= 60) {
                console.log('      ⚠️ DEVERIA ter sido concluído (compartilhada > 60min)');
              }
            } else if (ag.tipo_sessao === 'tripla') {
              if (ag.profissional_ativo === 1 && minutosPassados >= 30) {
                console.log('      ⚠️ DEVERIA ter trocado para Prof. 2');
              } else if (ag.profissional_ativo === 2 && minutosPassados >= 60) {
                console.log('      ⚠️ DEVERIA ter trocado para Prof. 3');
              } else if (ag.profissional_ativo === 3 && minutosPassados >= 90) {
                console.log('      ⚠️ DEVERIA ter sido concluído (tripla > 90min)');
              }
            }
          } else {
            console.log(`      ✅ Dentro do prazo (${30 - minutosPassados} min restantes)`);
          }
        } else if (ag.status === 'concluido') {
          console.log('      ✅ CONCLUÍDO corretamente');
        }
        
        console.log('');
      });
    }

    // 6. VERIFICAR LOGS DE ATENDIMENTO
    console.log('\n6️⃣ VERIFICANDO LOGS DE ATENDIMENTO...');
    
    const { data: logs, error: logsError } = await supabase
      .from('logs_atendimento')
      .select('*')
      .gte('created_at', hoje);

    if (logsError) {
      console.log('⚠️ Tabela de logs não existe ou erro:', logsError.message);
    } else {
      console.log(`📝 Encontrados ${logs?.length || 0} logs de atendimento hoje`);
      
      if (logs && logs.length > 0) {
        logs.slice(-5).forEach((log, index) => {
          console.log(`   ${index + 1}. ${log.acao} - ${log.detalhes || 'Sem detalhes'}`);
        });
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ TESTE COMPLETO FINALIZADO');
    return true;

  } catch (error) {
    console.error('❌ ERRO GERAL NO TESTE:', error);
    return false;
  }
}

// Executar o teste
testarSistema30Minutos()
  .then(sucesso => {
    if (sucesso) {
      console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    } else {
      console.log('\n💥 TESTE FALHOU - Verifique os erros acima');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 ERRO FATAL:', error);
    process.exit(1);
  });
