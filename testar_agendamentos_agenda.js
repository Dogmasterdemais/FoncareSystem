require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testarAgendamentos() {
  console.log('🔍 TESTANDO BUSCA DE AGENDAMENTOS');
  console.log('==================================');
  
  try {
    // Buscar agendamentos de hoje
    const hoje = new Date().toISOString().split('T')[0];
    console.log('📅 Buscando agendamentos de:', hoje);
    
    // Teste 1: Buscar diretamente da tabela agendamentos
    console.log('\n🔍 Teste 1: Tabela agendamentos direta');
    const { data: agendamentosDirecto, error: errorDirecto } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('data_agendamento', hoje)
      .order('horario_inicio');
    
    if (errorDirecto) {
      console.error('❌ Erro na tabela direta:', errorDirecto);
    } else {
      console.log('✅ Agendamentos encontrados (direto):', agendamentosDirecto?.length || 0);
      if (agendamentosDirecto && agendamentosDirecto.length > 0) {
        agendamentosDirecto.forEach(ag => {
          console.log(`  - ${ag.data_agendamento} ${ag.horario_inicio} | Paciente: ${ag.paciente_id} | Sala: ${ag.sala_id} | Esp: ${ag.especialidade_id}`);
        });
      }
    }
    
    // Teste 2: Buscar da view vw_agendamentos_completo
    console.log('\n🔍 Teste 2: View vw_agendamentos_completo');
    const { data: agendamentosView, error: errorView } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .eq('data_agendamento', hoje)
      .order('horario_inicio');
    
    if (errorView) {
      console.error('❌ Erro na view:', errorView);
      console.log('🔧 Tentando buscar sem filtro de data...');
      
      const { data: agendamentosViewSemFiltro, error: errorViewSemFiltro } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .limit(5);
      
      if (errorViewSemFiltro) {
        console.error('❌ Erro na view sem filtro:', errorViewSemFiltro);
      } else {
        console.log('✅ View funciona, encontrados:', agendamentosViewSemFiltro?.length || 0);
        if (agendamentosViewSemFiltro && agendamentosViewSemFiltro.length > 0) {
          console.log('📋 Exemplo de agendamento da view:');
          const exemplo = agendamentosViewSemFiltro[0];
          console.log(`  - Data: ${exemplo.data_agendamento}`);
          console.log(`  - Paciente: ${exemplo.paciente_nome}`);
          console.log(`  - Sala: ${exemplo.sala_nome}`);
          console.log(`  - Especialidade: ${exemplo.especialidade_nome}`);
        }
      }
    } else {
      console.log('✅ Agendamentos encontrados (view):', agendamentosView?.length || 0);
      if (agendamentosView && agendamentosView.length > 0) {
        agendamentosView.forEach(ag => {
          console.log(`  - ${ag.data_agendamento} ${ag.horario_inicio} | ${ag.paciente_nome} | ${ag.sala_nome} | ${ag.especialidade_nome}`);
        });
      }
    }
    
    // Teste 3: Verificar especialidades
    console.log('\n🔍 Teste 3: Verificando especialidades');
    const { data: especialidades, error: errorEsp } = await supabase
      .from('especialidades')
      .select('id, nome')
      .order('nome');
    
    if (errorEsp) {
      console.error('❌ Erro ao buscar especialidades:', errorEsp);
    } else {
      console.log('✅ Especialidades encontradas:', especialidades?.length || 0);
      if (especialidades && especialidades.length > 0) {
        especialidades.forEach(esp => {
          console.log(`  - ${esp.id}: ${esp.nome}`);
        });
      }
    }
    
    // Teste 4: Buscar agendamentos da semana atual
    console.log('\n🔍 Teste 4: Agendamentos da semana atual');
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    
    const { data: agendamentosSemana, error: errorSemana } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .gte('data_agendamento', inicioSemana.toISOString().split('T')[0])
      .lte('data_agendamento', fimSemana.toISOString().split('T')[0])
      .order('data_agendamento')
      .order('horario_inicio');
    
    if (errorSemana) {
      console.error('❌ Erro na busca da semana:', errorSemana);
    } else {
      console.log('✅ Agendamentos da semana:', agendamentosSemana?.length || 0);
      if (agendamentosSemana && agendamentosSemana.length > 0) {
        agendamentosSemana.forEach(ag => {
          console.log(`  - ${ag.data_agendamento} ${ag.horario_inicio} | ${ag.paciente_nome} | ${ag.especialidade_nome}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarAgendamentos();
