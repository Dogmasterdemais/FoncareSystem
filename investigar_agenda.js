require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function investigarAgenda() {
  console.log('🔍 INVESTIGANDO PÁGINA /agenda');
  console.log('==================================');
  
  try {
    const hoje = new Date().toISOString().split('T')[0];
    console.log('📅 Data de hoje:', hoje);
    
    // Teste 1: View vw_agenda_tempo_real_automatica (usada na página /agenda)
    console.log('\n🔍 Teste 1: View vw_agenda_tempo_real_automatica');
    try {
      const { data: agendaTempoReal, error: errorTempoReal } = await supabase
        .from('vw_agenda_tempo_real_automatica')
        .select('*')
        .eq('unidade_id', 'a4429bd3-1737-43bc-920e-dae4749e20dd')
        .limit(5);
      
      if (errorTempoReal) {
        console.error('❌ Erro na view tempo real:', errorTempoReal);
      } else {
        console.log('✅ View tempo real existe! Registros:', agendaTempoReal?.length || 0);
        if (agendaTempoReal && agendaTempoReal.length > 0) {
          console.log('📋 Exemplo de agendamento da view tempo real:');
          const exemplo = agendaTempoReal[0];
          console.log(`  - Data: ${exemplo.data_agendamento || 'N/A'}`);
          console.log(`  - Paciente: ${exemplo.paciente_nome || 'N/A'}`);
          console.log(`  - Sala: ${exemplo.sala_nome || 'N/A'}`);
          console.log(`  - Status: ${exemplo.status || 'N/A'}`);
          console.log(`  - Especialidade: ${exemplo.especialidade_nome || 'N/A'}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao acessar view tempo real:', error);
    }
    
    // Teste 2: View vw_agendamentos_completo (usada na página NAC)
    console.log('\n🔍 Teste 2: View vw_agendamentos_completo');
    const { data: agendamentosCompleto, error: errorCompleto } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .eq('data_agendamento', hoje)
      .order('horario_inicio');
    
    if (errorCompleto) {
      console.error('❌ Erro na view completo:', errorCompleto);
    } else {
      console.log('✅ Agendamentos de hoje (view completo):', agendamentosCompleto?.length || 0);
      if (agendamentosCompleto && agendamentosCompleto.length > 0) {
        agendamentosCompleto.forEach(ag => {
          console.log(`  - ${ag.horario_inicio} | ${ag.paciente_nome} | ${ag.especialidade_nome} | Status: ${ag.status}`);
        });
      }
    }
    
    // Teste 3: Verificar se há agendamentos novos que não estão nas views
    console.log('\n🔍 Teste 3: Agendamentos novos de hoje (tabela direta)');
    const { data: agendamentosHoje, error: errorHoje } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('data_agendamento', hoje)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (errorHoje) {
      console.error('❌ Erro ao buscar agendamentos de hoje:', errorHoje);
    } else {
      console.log('✅ Agendamentos de hoje (direto):', agendamentosHoje?.length || 0);
      if (agendamentosHoje && agendamentosHoje.length > 0) {
        console.log('📋 Últimos agendamentos criados hoje:');
        agendamentosHoje.forEach(ag => {
          const criadoEm = new Date(ag.created_at).toLocaleTimeString('pt-BR');
          console.log(`  - ${ag.horario_inicio} | Paciente: ${ag.paciente_id} | Sala: ${ag.sala_id} | Status: ${ag.status} | Criado: ${criadoEm}`);
        });
      }
    }
    
    // Teste 4: Verificar função de processamento automático
    console.log('\n🔍 Teste 4: Executando processamento automático');
    try {
      const { data: processamento, error: errorProcessamento } = await supabase
        .rpc('executar_processamento_automatico');
      
      if (errorProcessamento) {
        console.error('❌ Erro no processamento automático:', errorProcessamento);
      } else {
        console.log('✅ Processamento automático executado');
        
        // Tentar novamente a view tempo real após processamento
        const { data: agendaAposProcessamento, error: errorApos } = await supabase
          .from('vw_agenda_tempo_real_automatica')
          .select('*')
          .eq('unidade_id', 'a4429bd3-1737-43bc-920e-dae4749e20dd')
          .limit(5);
        
        if (!errorApos) {
          console.log('✅ Após processamento, registros na view tempo real:', agendaAposProcessamento?.length || 0);
        }
      }
    } catch (error) {
      console.error('❌ Função de processamento não existe ou erro:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

investigarAgenda();
