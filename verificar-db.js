const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kxstymmihfthtkojhcam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c3R5bW1paGZ0aHRrb2poY2FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjI4MTgyMiwiZXhwIjoyMDUxODU3ODIyfQ.bPMXTn8yR2S-8V1fDQ_EhOpDbDJOI8IKQCvkFevKfrw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarBanco() {
  try {
    console.log('=== VERIFICANDO BANCO DE DADOS ===\n');
    
    // Verificar unidades
    console.log('1. UNIDADES:');
    const { data: unidades, error: unidadesError } = await supabase
      .from('unidades')
      .select('*');
    
    if (unidadesError) {
      console.log('Erro ao buscar unidades:', unidadesError);
    } else {
      console.log(`Encontradas ${unidades?.length || 0} unidades:`);
      unidades?.forEach(u => console.log(`  - ${u.nome} (ID: ${u.id})`));
    }

    // Verificar especialidades
    console.log('\n2. ESPECIALIDADES:');
    const { data: especialidades } = await supabase
      .from('especialidades')
      .select('*');
    console.log(`Encontradas ${especialidades?.length || 0} especialidades:`);
    especialidades?.forEach(e => console.log(`  - ${e.nome} (ID: ${e.id})`));

    // Verificar profissionais
    console.log('\n3. PROFISSIONAIS:');
    const { data: profissionais } = await supabase
      .from('profissionais')
      .select('*');
    console.log(`Encontrados ${profissionais?.length || 0} profissionais:`);
    profissionais?.forEach(p => console.log(`  - ${p.nome} (Unidade: ${p.unidade_id || 'NULL'})`));

    // Verificar pacientes
    console.log('\n4. PACIENTES:');
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('*');
    console.log(`Encontrados ${pacientes?.length || 0} pacientes:`);
    pacientes?.forEach(p => console.log(`  - ${p.nome} (Unidade: ${p.unidade_id || 'NULL'})`));

    // Verificar salas
    console.log('\n5. SALAS:');
    const { data: salas } = await supabase
      .from('salas')
      .select('*');
    console.log(`Encontradas ${salas?.length || 0} salas:`);
    salas?.forEach(s => console.log(`  - ${s.nome} (Unidade: ${s.unidade_id || 'NULL'})`));

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

verificarBanco();
