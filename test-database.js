const { createClient } = require('@supabase/supabase-js');

// Usar as mesmas configurações do projeto Next.js
const supabaseUrl = 'https://xttqylyvgbwlgzrpbjud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dHF5bHl2Z2J3bGd6cnBianVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczOTIyMzYsImV4cCI6MjA1Mjk2ODIzNn0.I0Dx6KFPEH_mfvkJqlGxJTj1xJKY5fPkYRLX2nLh3Po';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testando conexão com banco de dados...');
  
  try {
    // Testar se a tabela salas existe
    console.log('\n📋 Verificando tabela salas...');
    const { data: salas, error: salasError } = await supabase
      .from('salas')
      .select('*')
      .limit(5);
    
    if (salasError) {
      console.log('❌ Erro ao acessar tabela salas:', salasError.message);
      
      if (salasError.message.includes('relation "public.salas" does not exist')) {
        console.log('📝 A tabela salas não existe. Vamos verificar outras tabelas...');
      }
    } else {
      console.log('✅ Tabela salas encontrada!', salas?.length || 0, 'registros');
      salas?.forEach(sala => {
        console.log(`- ${sala.nome} | Unidade: ${sala.unidade_id} | Ativo: ${sala.ativo}`);
      });
    }
    
    // Verificar unidades
    console.log('\n🏢 Verificando tabela unidades...');
    const { data: unidades, error: unidadesError } = await supabase
      .from('unidades')
      .select('*')
      .limit(5);
    
    if (unidadesError) {
      console.log('❌ Erro ao acessar tabela unidades:', unidadesError.message);
    } else {
      console.log('✅ Tabela unidades encontrada!', unidades?.length || 0, 'registros');
      unidades?.forEach(unidade => {
        console.log(`- ${unidade.nome} | ID: ${unidade.id}`);
      });
    }
    
    // Verificar pacientes
    console.log('\n👥 Verificando tabela pacientes...');
    const { data: pacientes, error: pacientesError } = await supabase
      .from('pacientes')
      .select('*')
      .limit(3);
    
    if (pacientesError) {
      console.log('❌ Erro ao acessar tabela pacientes:', pacientesError.message);
    } else {
      console.log('✅ Tabela pacientes encontrada!', pacientes?.length || 0, 'registros');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDatabase().catch(console.error);
