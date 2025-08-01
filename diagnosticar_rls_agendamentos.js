// Script para testar inserção de agendamento e diagnosticar erro RLS
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://urpfjihtkvvqehjppbrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarRLS() {
  console.log('🔍 Iniciando diagnóstico de RLS na tabela agendamentos...\n');

  try {
    // 1. Verificar se conseguimos ler dados existentes
    console.log('1. 📖 Testando leitura de agendamentos...');
    const { data: agendamentos, error: errorRead } = await supabase
      .from('agendamentos')
      .select('id, status, created_at')
      .limit(5);

    if (errorRead) {
      console.error('❌ Erro ao ler agendamentos:', errorRead);
    } else {
      console.log('✅ Leitura funcionando. Total encontrado:', agendamentos?.length || 0);
    }

    // 2. Testar busca de dados para o agendamento
    console.log('\n2. 🔍 Buscando dados necessários para agendamento...');
    
    // Buscar pacientes
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, nome')
      .limit(1);
    
    // Buscar especialidades
    const { data: especialidades } = await supabase
      .from('especialidades')
      .select('id, nome')
      .limit(1);
    
    // Buscar salas
    const { data: salas } = await supabase
      .from('salas')
      .select('id, nome')
      .limit(1);
    
    // Buscar unidades
    const { data: unidades } = await supabase
      .from('unidades')
      .select('id, nome')
      .limit(1);

    console.log('Dados encontrados:');
    console.log('- Pacientes:', pacientes?.length || 0);
    console.log('- Especialidades:', especialidades?.length || 0);
    console.log('- Salas:', salas?.length || 0);
    console.log('- Unidades:', unidades?.length || 0);

    if (!pacientes?.length || !especialidades?.length || !salas?.length || !unidades?.length) {
      console.error('❌ Dados insuficientes para criar agendamento');
      return;
    }

    // 3. Tentar inserir um agendamento de teste
    console.log('\n3. 🆕 Tentando inserir agendamento de teste...');
    
    const agendamentoTeste = {
      paciente_id: pacientes[0].id,
      especialidade_id: especialidades[0].id,
      sala_id: salas[0].id,
      unidade_id: unidades[0].id,
      data_agendamento: new Date().toISOString().split('T')[0],
      horario_inicio: '08:00',
      horario_fim: '09:00',
      duracao_minutos: 60,
      tipo_sessao: 'consulta',
      modalidade: 'presencial',
      status: 'agendado',
      observacoes: 'Teste de inserção - diagnostico RLS'
    };

    console.log('📋 Dados do agendamento teste:', JSON.stringify(agendamentoTeste, null, 2));

    const { data: novoAgendamento, error: errorInsert } = await supabase
      .from('agendamentos')
      .insert([agendamentoTeste])
      .select()
      .single();

    if (errorInsert) {
      console.error('❌ ERRO AO INSERIR AGENDAMENTO:');
      console.error('- Message:', errorInsert.message);
      console.error('- Details:', errorInsert.details);
      console.error('- Hint:', errorInsert.hint);
      console.error('- Code:', errorInsert.code);
      
      if (errorInsert.message.includes('row-level security policy')) {
        console.log('\n🔒 DIAGNÓSTICO: Problema com Row Level Security (RLS)');
        console.log('Possíveis soluções:');
        console.log('1. Executar o script verificar_rls_agendamentos.sql no Supabase');
        console.log('2. Verificar se existem políticas RLS restritivas');
        console.log('3. Criar política permissiva temporária para testes');
      }
    } else {
      console.log('✅ Agendamento inserido com sucesso!');
      console.log('📋 Dados:', novoAgendamento);
      
      // Limpar o teste
      await supabase
        .from('agendamentos')
        .delete()
        .eq('id', novoAgendamento.id);
      console.log('🧹 Agendamento de teste removido');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar diagnóstico
diagnosticarRLS();
