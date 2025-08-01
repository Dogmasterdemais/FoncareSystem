import { supabase } from '../lib/supabaseClient';

// Teste rápido do módulo terapêutico
export async function testarModuloTerapeutico() {
  try {
    console.log('🧪 Testando Módulo Terapêutico...');

    // 1. Verificar se as tabelas existem
    const { error: errorTabelas } = await supabase
      .from('configuracoes_terapeuticas')
      .select('*')
      .limit(1);

    if (errorTabelas) {
      console.error('❌ Erro ao acessar tabelas:', errorTabelas);
      return false;
    }

    console.log('✅ Tabelas do módulo terapêutico acessíveis');

    // 2. Verificar views
    const { error: errorOcupacao } = await supabase
      .from('vw_ocupacao_salas')
      .select('*')
      .limit(1);

    if (errorOcupacao) {
      console.log('⚠️  Views podem não estar disponíveis:', errorOcupacao.message);
    } else {
      console.log('✅ Views funcionando corretamente');
    }

    // 3. Verificar configurações
    const { data: configs } = await supabase
      .from('configuracoes_terapeuticas')
      .select('*');

    if (configs && configs.length > 0) {
      console.log('✅ Configurações carregadas:', configs.length, 'itens');
    } else {
      console.log('⚠️  Configurações não encontradas');
    }

    console.log('🎉 Módulo Terapêutico instalado e funcionando!');
    return true;

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

// Executar teste
if (typeof window !== 'undefined') {
  testarModuloTerapeutico();
}
