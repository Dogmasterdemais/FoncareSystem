// Script para testar se as tabelas de documentos existem
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarTabelas() {
  console.log('🔍 Testando se as tabelas existem...');
  
  try {
    // Testar tabela colaboradores_documentos
    console.log('\n📄 Testando colaboradores_documentos...');
    const { data: docs, error: docsError } = await supabase
      .from('colaboradores_documentos')
      .select('*')
      .limit(1);
    
    if (docsError) {
      console.error('❌ Erro na tabela colaboradores_documentos:', docsError);
    } else {
      console.log('✅ colaboradores_documentos existe:', docs?.length || 0, 'registros');
    }

    // Testar tabela colaboradores_documentos_clt
    console.log('\n📋 Testando colaboradores_documentos_clt...');
    const { data: clt, error: cltError } = await supabase
      .from('colaboradores_documentos_clt')
      .select('*')
      .limit(1);
    
    if (cltError) {
      console.error('❌ Erro na tabela colaboradores_documentos_clt:', cltError);
    } else {
      console.log('✅ colaboradores_documentos_clt existe:', clt?.length || 0, 'registros');
    }

    // Testar tabela colaboradores_documentos_pj
    console.log('\n🏢 Testando colaboradores_documentos_pj...');
    const { data: pj, error: pjError } = await supabase
      .from('colaboradores_documentos_pj')
      .select('*')
      .limit(1);
    
    if (pjError) {
      console.error('❌ Erro na tabela colaboradores_documentos_pj:', pjError);
    } else {
      console.log('✅ colaboradores_documentos_pj existe:', pj?.length || 0, 'registros');
    }

    // Testar tabela colaboradores_advertencias
    console.log('\n⚠️ Testando colaboradores_advertencias...');
    const { data: adv, error: advError } = await supabase
      .from('colaboradores_advertencias')
      .select('*')
      .limit(1);
    
    if (advError) {
      console.error('❌ Erro na tabela colaboradores_advertencias:', advError);
    } else {
      console.log('✅ colaboradores_advertencias existe:', adv?.length || 0, 'registros');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarTabelas();
