// TESTE SIMPLES: Node.js com import/export
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

console.log('🔍 Teste simples - verificando profissionais...');

async function teste() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('📡 Conectando ao Supabase...');
    
    // Teste básico
    const { data, error } = await supabase
      .from('profissionais_salas')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Dados encontrados:', data);
    }
    
  } catch (err) {
    console.error('💥 Erro de conexão:', err);
  }
}

teste();
