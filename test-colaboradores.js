const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarColaboradores() {
  console.log('🧪 Iniciando teste da tabela colaboradores...\n');

  try {
    // Teste 1: Verificar se a tabela existe
    console.log('1️⃣ Teste básico de acesso à tabela...');
    const { count: teste1, error: erro1 } = await supabase
      .from('colaboradores')
      .select('*', { count: 'exact', head: true });

    if (erro1) {
      console.error('❌ Erro no teste básico:', erro1);
      return;
    }
    console.log('✅ Tabela acessível, contagem:', teste1);

    // Teste 2: Verificar campos disponíveis
    console.log('\n2️⃣ Verificando campos disponíveis...');
    const { data: teste2, error: erro2 } = await supabase
      .from('colaboradores')
      .select('*')
      .limit(1);

    if (erro2) {
      console.error('❌ Erro ao buscar campos:', erro2);
      return;
    }

    if (teste2 && teste2.length > 0) {
      console.log('✅ Campos disponíveis:', Object.keys(teste2[0]));
      console.log('📋 Exemplo de registro:', teste2[0]);
    } else {
      console.log('⚠️ Nenhum registro encontrado na tabela');
    }

    // Teste 3: Buscar colaboradores com nome_completo
    console.log('\n3️⃣ Buscando colaboradores com nome_completo...');
    const { data: teste3, error: erro3 } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, cargo, status')
      .limit(10);

    if (erro3) {
      console.error('❌ Erro ao buscar nome_completo:', erro3);
      return;
    }

    console.log('✅ Colaboradores encontrados:', teste3?.length || 0);
    if (teste3 && teste3.length > 0) {
      console.log('📋 Exemplos:');
      teste3.slice(0, 5).forEach((col, idx) => {
        console.log(`  ${idx + 1}. ${col.nome_completo} - ${col.cargo || 'Sem cargo'} - Status: ${col.status}`);
      });
    }

    // Teste 4: Filtrar apenas ativos (usando status)
    console.log('\n4️⃣ Buscando apenas colaboradores ativos...');
    const { data: teste4, error: erro4 } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, cargo')
      .eq('status', 'ativo')
      .limit(10);

    if (erro4) {
      console.error('❌ Erro ao filtrar ativos:', erro4);
      return;
    }

    console.log('✅ Colaboradores ativos encontrados:', teste4?.length || 0);
    if (teste4 && teste4.length > 0) {
      console.log('📋 Exemplos de ativos:');
      teste4.slice(0, 5).forEach((col, idx) => {
        console.log(`  ${idx + 1}. ${col.nome_completo} - ${col.cargo || 'Sem cargo'}`);
      });
    }

    // Teste 5: Verificar se há RLS ativo
    console.log('\n5️⃣ Verificando informações da tabela...');
    const { data: infoTabela, error: erroInfo } = await supabase
      .rpc('get_table_info', { table_name: 'colaboradores' })
      .single();

    if (erroInfo) {
      console.log('⚠️ Não foi possível obter informações RLS (função não existe)');
    } else {
      console.log('✅ Informações da tabela:', infoTabela);
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testarColaboradores();
