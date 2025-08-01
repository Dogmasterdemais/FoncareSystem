const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnosticarAgendamentos() {
  console.log('🔍 DIAGNÓSTICO DOS AGENDAMENTOS');
  console.log('===============================================');
  
  try {
    // 1. Verificar se há agendamentos na tabela direta
    console.log('📋 1. Verificando agendamentos na tabela direta...');
    const { data: agendamentosTabela, error: errorTabela } = await supabase
      .from('agendamentos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('📊 Agendamentos na tabela:', agendamentosTabela?.length || 0);
    if (errorTabela) {
      console.error('❌ Erro na tabela:', errorTabela);
    } else if (agendamentosTabela && agendamentosTabela.length > 0) {
      console.log('✅ Últimos 5 agendamentos:');
      agendamentosTabela.forEach((ag, i) => {
        console.log(`  ${i+1}. ${ag.data_agendamento} ${ag.horario_inicio} - Status: ${ag.status} - Modalidade: ${ag.modalidade}`);
      });
    }

    // 2. Verificar se a view existe
    console.log('\n📋 2. Verificando view vw_agendamentos_completo...');
    const { data: agendamentosView, error: errorView } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .limit(5);
    
    console.log('📊 Agendamentos na view:', agendamentosView?.length || 0);
    if (errorView) {
      console.error('❌ Erro na view:', {
        message: errorView.message,
        details: errorView.details,
        hint: errorView.hint,
        code: errorView.code
      });
    } else if (agendamentosView && agendamentosView.length > 0) {
      console.log('✅ View funcionando, primeiros 5 registros:');
      agendamentosView.forEach((ag, i) => {
        console.log(`  ${i+1}. ${ag.data_agendamento} ${ag.horario_inicio} - ${ag.paciente_nome}`);
      });
    }

    // 3. Verificar agendamentos da semana atual
    console.log('\n📋 3. Verificando agendamentos da semana atual...');
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6); // Sábado
    
    console.log('📅 Período da semana:', {
      inicio: inicioSemana.toISOString().split('T')[0],
      fim: fimSemana.toISOString().split('T')[0]
    });

    const { data: agendamentosSemana, error: errorSemana } = await supabase
      .from('agendamentos')
      .select('*')
      .gte('data_agendamento', inicioSemana.toISOString().split('T')[0])
      .lte('data_agendamento', fimSemana.toISOString().split('T')[0])
      .order('data_agendamento')
      .order('horario_inicio');
    
    console.log('📊 Agendamentos desta semana:', agendamentosSemana?.length || 0);
    if (errorSemana) {
      console.error('❌ Erro ao buscar semana:', errorSemana);
    } else if (agendamentosSemana && agendamentosSemana.length > 0) {
      console.log('✅ Agendamentos encontrados:');
      agendamentosSemana.forEach((ag) => {
        console.log(`  📅 ${ag.data_agendamento} ${ag.horario_inicio} - Status: ${ag.status}`);
      });
    }

    // 4. Verificar se a view retorna dados para a semana
    console.log('\n📋 4. Testando view para a semana atual...');
    const { data: viewSemana, error: errorViewSemana } = await supabase
      .from('vw_agendamentos_completo')
      .select('*')
      .gte('data_agendamento', inicioSemana.toISOString().split('T')[0])
      .lte('data_agendamento', fimSemana.toISOString().split('T')[0])
      .order('data_agendamento')
      .order('horario_inicio');
    
    console.log('📊 View agendamentos desta semana:', viewSemana?.length || 0);
    if (errorViewSemana) {
      console.error('❌ Erro na view para semana:', errorViewSemana);
    } else if (viewSemana && viewSemana.length > 0) {
      console.log('✅ View retorna dados para a semana:');
      viewSemana.forEach((ag) => {
        console.log(`  📅 ${ag.data_agendamento} ${ag.horario_inicio} - ${ag.paciente_nome || 'SEM NOME'}`);
      });
    }

    // 5. Verificar campos que podem estar causando problemas
    console.log('\n📋 5. Verificando estrutura dos agendamentos...');
    if (agendamentosTabela && agendamentosTabela.length > 0) {
      const primeiroAg = agendamentosTabela[0];
      console.log('🔍 Campos do primeiro agendamento:');
      console.log({
        id: primeiroAg.id,
        paciente_id: primeiroAg.paciente_id,
        sala_id: primeiroAg.sala_id,
        especialidade_id: primeiroAg.especialidade_id,
        unidade_id: primeiroAg.unidade_id,
        data_agendamento: primeiroAg.data_agendamento,
        horario_inicio: primeiroAg.horario_inicio,
        status: primeiroAg.status,
        modalidade: primeiroAg.modalidade
      });
    }

  } catch (error) {
    console.error('❌ Erro geral no diagnóstico:', error);
  }
}

diagnosticarAgendamentos();
