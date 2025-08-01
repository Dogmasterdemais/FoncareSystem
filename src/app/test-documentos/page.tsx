'use client';

import { supabase } from '../../lib/supabaseClient';

export default function TestDocumentosPage() {
  const testarTabelas = async () => {
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

      // Testar tabela colaboradores_perfis_acesso
      console.log('\n🔐 Testando colaboradores_perfis_acesso...');
      const { data: perfis, error: perfisError } = await supabase
        .from('colaboradores_perfis_acesso')
        .select('*')
        .limit(1);
      
      if (perfisError) {
        console.error('❌ Erro na tabela colaboradores_perfis_acesso:', perfisError);
      } else {
        console.log('✅ colaboradores_perfis_acesso existe:', perfis?.length || 0, 'registros');
      }

    } catch (error) {
      console.error('❌ Erro geral:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Tabelas de Documentos</h1>
      <button 
        onClick={testarTabelas}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Testar Tabelas
      </button>
      <p className="mt-4 text-gray-600">
        Abra o console do navegador (F12) para ver os resultados dos testes.
      </p>
    </div>
  );
}
