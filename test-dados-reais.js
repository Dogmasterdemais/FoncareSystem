const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pkigqjrjdpvlgwylbsxg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraWdxanJqZHB2bGd3eWxic3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwOTkxNDIsImV4cCI6MjA1MzY3NTE0Mn0.JxwGhNsEMWH3CTa86uV2Iu89iN1s31o1vYqLlJP8GKs'
);

async function testarConexaoEDados() {
  console.log('🔍 Testando conexão e dados do Supabase...\n');
  
  try {
    // 1. Testar pacientes
    console.log('1. 👥 Testando busca de pacientes...');
    const { data: pacientes, error: errorPacientes } = await supabase
      .from('pacientes')
      .select('id, nome, telefone, convenio_nome, unidade_id')
      .limit(10);
    
    if (errorPacientes) {
      console.error('❌ Erro ao buscar pacientes:', errorPacientes);
    } else {
      console.log(`✅ Encontrados ${pacientes?.length || 0} pacientes:`);
      pacientes?.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nome} - Tel: ${p.telefone || 'N/A'} - Convênio: ${p.convenio_nome || 'N/A'}`);
      });
    }
    
    // 2. Testar agendamentos
    console.log('\n2. 📅 Testando busca de agendamentos...');
    const { data: agendamentos, error: errorAgendamentos } = await supabase
      .from('agendamentos')
      .select('id, data_agendamento, status, especialidade_id, unidade_id')
      .limit(10);
    
    if (errorAgendamentos) {
      console.error('❌ Erro ao buscar agendamentos:', errorAgendamentos);
    } else {
      console.log(`✅ Encontrados ${agendamentos?.length || 0} agendamentos:`);
      agendamentos?.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.data_agendamento} - Status: ${a.status}`);
      });
    }
    
    // 3. Testar colaboradores
    console.log('\n3. 👨‍⚕️ Testando busca de colaboradores...');
    const { data: colaboradores, error: errorColaboradores } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, cargo, status, unidade_id')
      .limit(10);
    
    if (errorColaboradores) {
      console.error('❌ Erro ao buscar colaboradores:', errorColaboradores);
    } else {
      console.log(`✅ Encontrados ${colaboradores?.length || 0} colaboradores:`);
      colaboradores?.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.nome_completo} - Cargo: ${c.cargo || 'N/A'} - Status: ${c.status}`);
      });
    }
    
    // 4. Testar financeiro
    console.log('\n4. 💰 Testando busca de registros financeiros...');
    const { data: financeiro, error: errorFinanceiro } = await supabase
      .from('financeiro')
      .select('id, valor, tipo, data, unidade_id')
      .limit(10);
    
    if (errorFinanceiro) {
      console.error('❌ Erro ao buscar registros financeiros:', errorFinanceiro);
    } else {
      console.log(`✅ Encontrados ${financeiro?.length || 0} registros financeiros:`);
      financeiro?.forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.data} - Tipo: ${f.tipo} - Valor: R$ ${f.valor}`);
      });
    }
    
    // 5. Testar unidades
    console.log('\n5. 🏢 Testando busca de unidades...');
    const { data: unidades, error: errorUnidades } = await supabase
      .from('unidades')
      .select('id, nome, ativo')
      .eq('ativo', true);
    
    if (errorUnidades) {
      console.error('❌ Erro ao buscar unidades:', errorUnidades);
    } else {
      console.log(`✅ Encontradas ${unidades?.length || 0} unidades ativas:`);
      unidades?.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.nome} (ID: ${u.id})`);
      });
    }
    
    // 6. Testar especialidades
    console.log('\n6. 🏥 Testando busca de especialidades...');
    const { data: especialidades, error: errorEspecialidades } = await supabase
      .from('especialidades')
      .select('id, nome, ativo')
      .eq('ativo', true);
    
    if (errorEspecialidades) {
      console.error('❌ Erro ao buscar especialidades:', errorEspecialidades);
    } else {
      console.log(`✅ Encontradas ${especialidades?.length || 0} especialidades ativas:`);
      especialidades?.forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.nome} (ID: ${e.id})`);
      });
    }
    
    console.log('\n🎉 Teste de conexão e dados concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral durante os testes:', error);
  }
}

// Executar o teste
testarConexaoEDados();
