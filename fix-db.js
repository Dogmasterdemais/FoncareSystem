const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kxstymmihfthtkojhcam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c3R5bW1paGZ0aHRrb2poY2FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjI4MTgyMiwiZXhwIjoyMDUxODU3ODIyfQ.bPMXTn8yR2S-8V1fDQ_EhOpDbDJOI8IKQCvkFevKfrw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executarSQL() {
  try {
    console.log('Verificando estrutura atual...');
    
    // Tentar buscar profissionais para verificar se a coluna unidade_id existe
    const { data: testProfissionais, error: testError } = await supabase
      .from('profissionais')
      .select('id, nome, unidade_id')
      .limit(1);

    if (testError && testError.message.includes('unidade_id')) {
      console.log('Coluna unidade_id não existe, será necessário criar manualmente no Supabase Dashboard');
      console.log('Execute este SQL no Supabase Dashboard:');
      console.log('ALTER TABLE profissionais ADD COLUMN unidade_id UUID REFERENCES unidades(id);');
      return;
    }

    console.log('Estrutura OK. Atualizando profissionais existentes...');
    
    // Buscar primeira unidade
    const { data: unidades } = await supabase
      .from('unidades')
      .select('id, nome')
      .limit(1);

    if (!unidades || unidades.length === 0) {
      console.log('Nenhuma unidade encontrada');
      return;
    }

    const primeiraUnidade = unidades[0];
    console.log('Usando unidade:', primeiraUnidade.nome);

    // Atualizar profissionais sem unidade_id
    const { data: updateResult, error: updateError } = await supabase
      .from('profissionais')
      .update({ unidade_id: primeiraUnidade.id })
      .is('unidade_id', null)
      .select();

    if (updateError) {
      console.error('Erro ao atualizar:', updateError);
    } else {
      console.log(`Atualizados ${updateResult?.length || 0} profissionais`);
    }

    // Verificar resultado
    const { data: profissionais } = await supabase
      .from('profissionais')
      .select(`
        nome,
        email,
        especialidades(nome),
        unidades(nome)
      `)
      .eq('ativo', true);

    console.log('\nProfissionais no sistema:');
    profissionais?.forEach(p => {
      console.log(`- ${p.nome} (${p.especialidades?.nome}) - ${p.unidades?.nome || 'SEM UNIDADE'}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  }
}

executarSQL();
