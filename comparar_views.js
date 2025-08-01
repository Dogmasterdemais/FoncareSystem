require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function compararViews() {
  console.log('🔍 COMPARANDO AS DUAS VIEWS');
  console.log('============================');
  
  try {
    const hoje = new Date().toISOString().split('T')[0];
    console.log('📅 Buscando agendamentos de:', hoje);
    
    // Teste 1: vw_agendamentos_completo (usada no NAC)
    console.log('\n🔍 View 1: vw_agendamentos_completo (NAC)');
    const { data: agendamentosNAC, error: errorNAC } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .eq('data_agendamento', hoje)
      .order('horario_inicio');
    
    if (errorNAC) {
      console.error('❌ Erro na view NAC:', errorNAC);
    } else {
      console.log('✅ Agendamentos NAC:', agendamentosNAC?.length || 0);
      agendamentosNAC?.forEach((ag, i) => {
        console.log(`  ${i+1}. ${ag.horario_inicio} | ${ag.paciente_nome} | ${ag.especialidade_nome} | Status: ${ag.status}`);
      });
    }
    
    // Teste 2: vw_agenda_tempo_real_automatica (usada na Agenda)
    console.log('\n🔍 View 2: vw_agenda_tempo_real_automatica (Agenda)');
    const { data: agendamentosAgenda, error: errorAgenda } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .eq('data_agendamento', hoje)
      .order('horario_inicio');
    
    if (errorAgenda) {
      console.error('❌ Erro na view Agenda:', errorAgenda);
    } else {
      console.log('✅ Agendamentos Agenda:', agendamentosAgenda?.length || 0);
      agendamentosAgenda?.forEach((ag, i) => {
        console.log(`  ${i+1}. ${ag.horario_inicio} | ${ag.paciente_nome} | ${ag.especialidade_nome} | Status: ${ag.status}`);
      });
    }
    
    // Teste 3: Comparar estruturas das views
    console.log('\n🔍 Comparando estruturas das views...');
    
    if (agendamentosNAC && agendamentosNAC.length > 0) {
      console.log('\n📋 Estrutura vw_agendamentos_completo:');
      console.log('Campos:', Object.keys(agendamentosNAC[0]).join(', '));
    }
    
    if (agendamentosAgenda && agendamentosAgenda.length > 0) {
      console.log('\n📋 Estrutura vw_agenda_tempo_real_automatica:');
      console.log('Campos:', Object.keys(agendamentosAgenda[0]).join(', '));
    }
    
    // Teste 4: Buscar sem filtro de data para ver se há agendamentos
    console.log('\n🔍 Teste 4: Buscando agendamentos sem filtro de data...');
    
    const { data: todosNAC, error: errorTodosNAC } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .limit(5)
      .order('data_agendamento', { ascending: false });
    
    const { data: todosAgenda, error: errorTodosAgenda } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .limit(5)
      .order('data_agendamento', { ascending: false });
    
    console.log('📊 Total recente vw_agendamentos_completo:', todosNAC?.length || 0);
    console.log('📊 Total recente vw_agenda_tempo_real_automatica:', todosAgenda?.length || 0);
    
    if (todosNAC && todosNAC.length > 0) {
      console.log('\n📋 Últimos agendamentos vw_agendamentos_completo:');
      todosNAC.forEach(ag => {
        console.log(`  - ${ag.data_agendamento} | ${ag.paciente_nome} | ${ag.especialidade_nome}`);
      });
    }
    
    if (todosAgenda && todosAgenda.length > 0) {
      console.log('\n📋 Últimos agendamentos vw_agenda_tempo_real_automatica:');
      todosAgenda.forEach(ag => {
        console.log(`  - ${ag.data_agendamento} | ${ag.paciente_nome} | ${ag.especialidade_nome}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

compararViews();
