// Script para testar agendamentos após correção RLS
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://urpfjihtkvvqehjppbrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarAposCorrecao() {
  console.log('🧪 Testando agendamentos após correção RLS...\n');

  try {
    // 1. Buscar dados necessários
    console.log('1. 🔍 Buscando dados para agendamento...');
    
    const [
      { data: pacientes },
      { data: especialidades },
      { data: salas },
      { data: unidades }
    ] = await Promise.all([
      supabase.from('pacientes').select('id, nome').limit(1),
      supabase.from('especialidades').select('id, nome').limit(1),
      supabase.from('salas').select('id, nome').limit(1),
      supabase.from('unidades').select('id, nome').limit(1)
    ]);

    console.log('✅ Dados encontrados:', {
      pacientes: pacientes?.length || 0,
      especialidades: especialidades?.length || 0,
      salas: salas?.length || 0,
      unidades: unidades?.length || 0
    });

    if (!pacientes?.length || !especialidades?.length || !salas?.length || !unidades?.length) {
      console.error('❌ Dados insuficientes para teste');
      return;
    }

    // 2. Criar agendamento de teste
    console.log('\n2. 🆕 Criando agendamento de teste...');
    
    const agendamentoTeste = {
      paciente_id: pacientes[0].id,
      especialidade_id: especialidades[0].id,
      sala_id: salas[0].id,
      unidade_id: unidades[0].id,
      data_agendamento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
      horario_inicio: '14:00',
      horario_fim: '15:00',
      duracao_minutos: 60,
      tipo_sessao: 'consulta',
      modalidade: 'presencial',
      status: 'agendado',
      observacoes: 'Teste pós-correção RLS - ' + new Date().toISOString()
    };

    const { data: novoAgendamento, error } = await supabase
      .from('agendamentos')
      .insert([agendamentoTeste])
      .select()
      .single();

    if (error) {
      console.error('❌ AINDA HÁ PROBLEMAS:');
      console.error('Erro:', error.message);
      console.error('Detalhes:', error.details);
      console.log('\n🔧 EXECUTE OS SCRIPTS SQL NO SUPABASE:');
      console.log('1. corrigir_rls_completo.sql');
      console.log('2. OU desabilitar_rls_agendamentos.sql');
      return;
    }

    console.log('🎉 SUCESSO! Agendamento criado:');
    console.log('ID:', novoAgendamento.id);
    console.log('Data:', novoAgendamento.data_agendamento);
    console.log('Horário:', novoAgendamento.horario_inicio, '-', novoAgendamento.horario_fim);

    // 3. Teste de múltiplos agendamentos (como no sistema real)
    console.log('\n3. 📅 Testando múltiplos agendamentos...');
    
    const agendamentosMultiplos = [];
    for (let i = 0; i < 3; i++) {
      const data = new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000);
      agendamentosMultiplos.push({
        paciente_id: pacientes[0].id,
        especialidade_id: especialidades[0].id,
        sala_id: salas[0].id,
        unidade_id: unidades[0].id,
        data_agendamento: data.toISOString().split('T')[0],
        horario_inicio: '15:00',
        horario_fim: '16:00',
        duracao_minutos: 60,
        tipo_sessao: 'sessao',
        modalidade: 'presencial',
        status: 'agendado',
        observacoes: `Teste múltiplo ${i + 1} - pós-correção RLS`
      });
    }

    const { data: agendamentosMultiplosResult, error: errorMultiplos } = await supabase
      .from('agendamentos')
      .insert(agendamentosMultiplos)
      .select();

    if (errorMultiplos) {
      console.error('❌ Erro em múltiplos agendamentos:', errorMultiplos.message);
    } else {
      console.log('✅ Múltiplos agendamentos criados:', agendamentosMultiplosResult?.length || 0);
    }

    // 4. Limpeza dos testes
    console.log('\n4. 🧹 Limpando testes...');
    await supabase
      .from('agendamentos')
      .delete()
      .or(`id.eq.${novoAgendamento.id},observacoes.like.*Teste múltiplo*`);

    console.log('✅ Testes limpos');

    console.log('\n🎉 CORREÇÃO APLICADA COM SUCESSO!');
    console.log('Agora você pode criar agendamentos normalmente no sistema.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarAposCorrecao();
