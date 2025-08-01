require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function compararViews() {
  console.log('🔍 COMPARANDO VIEWS DE AGENDAMENTOS');
  console.log('====================================');
  
  try {
    const hoje = new Date().toISOString().split('T')[0];
    console.log('📅 Data de teste:', hoje);
    
    // Teste 1: vw_agendamentos_completo
    console.log('\n🔍 Teste 1: vw_agendamentos_completo');
    const { data: viewCompleto, error: errorCompleto } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .eq('data_agendamento', hoje)
      .order('horario_inicio');
    
    if (errorCompleto) {
      console.error('❌ Erro vw_agendamentos_completo:', errorCompleto);
    } else {
      console.log('✅ Registros encontrados:', viewCompleto?.length || 0);
      viewCompleto?.forEach((ag, index) => {
        console.log(`  ${index + 1}. ${ag.paciente_nome} | ${ag.especialidade_nome} | ${ag.sala_nome} | ${ag.horario_inicio}`);
      });
    }
    
    // Teste 2: vw_agenda_tempo_real_automatica
    console.log('\n🔍 Teste 2: vw_agenda_tempo_real_automatica');
    const { data: viewTempoReal, error: errorTempoReal } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .eq('data_agendamento', hoje)
      .order('horario_inicio');
    
    if (errorTempoReal) {
      console.error('❌ Erro vw_agenda_tempo_real_automatica:', errorTempoReal);
    } else {
      console.log('✅ Registros encontrados:', viewTempoReal?.length || 0);
      viewTempoReal?.forEach((ag, index) => {
        console.log(`  ${index + 1}. ${ag.paciente_nome} | ${ag.especialidade_nome} | ${ag.sala_nome} | ${ag.horario_inicio}`);
      });
    }
    
    // Comparação
    console.log('\n📊 COMPARAÇÃO');
    console.log(`vw_agendamentos_completo: ${viewCompleto?.length || 0} registros`);
    console.log(`vw_agenda_tempo_real_automatica: ${viewTempoReal?.length || 0} registros`);
    
    if (viewCompleto && viewTempoReal) {
      const idsCompleto = new Set(viewCompleto.map(ag => ag.id));
      const idsTempoReal = new Set(viewTempoReal.map(ag => ag.id));
      
      const apenasCompleto = viewCompleto.filter(ag => !idsTempoReal.has(ag.id));
      const apenasTempoReal = viewTempoReal.filter(ag => !idsCompleto.has(ag.id));
      
      if (apenasCompleto.length > 0) {
        console.log('\n⚠️ Agendamentos APENAS em vw_agendamentos_completo:');
        apenasCompleto.forEach(ag => {
          console.log(`  - ${ag.paciente_nome} | ${ag.especialidade_nome} | ${ag.status}`);
        });
      }
      
      if (apenasTempoReal.length > 0) {
        console.log('\n⚠️ Agendamentos APENAS em vw_agenda_tempo_real_automatica:');
        apenasTempoReal.forEach(ag => {
          console.log(`  - ${ag.paciente_nome} | ${ag.especialidade_nome} | ${ag.status}`);
        });
      }
      
      if (apenasCompleto.length === 0 && apenasTempoReal.length === 0) {
        console.log('\n✅ Ambas as views retornam os mesmos agendamentos!');
      }
    }
    
    // Teste 3: Verificar estrutura das views
    console.log('\n🔍 Teste 3: Estrutura das views');
    
    // Buscar uma amostra de cada view para comparar campos
    const { data: sampleCompleto } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .limit(1);
    
    const { data: sampleTempoReal } = await supabase
      .from('vw_agenda_tempo_real_automatica')
      .select('*')
      .limit(1);
    
    if (sampleCompleto && sampleCompleto[0]) {
      console.log('\n📋 Campos vw_agendamentos_completo:');
      console.log(Object.keys(sampleCompleto[0]).sort().join(', '));
    }
    
    if (sampleTempoReal && sampleTempoReal[0]) {
      console.log('\n📋 Campos vw_agenda_tempo_real_automatica:');
      console.log(Object.keys(sampleTempoReal[0]).sort().join(', '));
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

compararViews();
