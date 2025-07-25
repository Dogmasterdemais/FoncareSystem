// Teste simples de conexão com Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://urpfjihtkvvqehjppbrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGZqaWh0a3Z2cWVoanBwYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTk5OTcsImV4cCI6MjA2NzQ5NTk5N30.sbsymu87QDFEUJ9BNYGLwJfct7X5Een7RtomakBLij4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConexao() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Buscar agendamentos
    console.log('\n1. Testando busca de agendamentos...');
    const { data: agendamentos, error: errorAgendamentos } = await supabase
      .from('agendamentos')
      .select('id, status, data_agendamento')
      .limit(5);
    
    if (errorAgendamentos) {
      console.error('❌ Erro ao buscar agendamentos:', errorAgendamentos);
    } else {
      console.log('✅ Agendamentos encontrados:', agendamentos?.length || 0);
      console.log('📋 Dados:', agendamentos);
    }

    // Teste 2: Verificar se as colunas novas existem
    console.log('\n2. Testando colunas do módulo terapêutico...');
    const { data: teste, error: errorTeste } = await supabase
      .from('agendamentos')
      .select('id, duracao_real_minutos, evolucao_realizada, supervisionado, liberado_pagamento')
      .limit(1);
    
    if (errorTeste) {
      console.error('❌ Erro ao verificar colunas:', errorTeste);
    } else {
      console.log('✅ Colunas do módulo terapêutico existem!');
    }

    // Teste 3: Buscar salas
    console.log('\n3. Testando busca de salas...');
    const { data: salas, error: errorSalas } = await supabase
      .from('salas')
      .select('id, nome, cor')
      .limit(3);
    
    if (errorSalas) {
      console.error('❌ Erro ao buscar salas:', errorSalas);
    } else {
      console.log('✅ Salas encontradas:', salas?.length || 0);
      console.log('🏢 Salas:', salas);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testarConexao();
