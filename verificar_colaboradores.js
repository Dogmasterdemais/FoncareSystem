const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mgpcxopepfnoylubfqrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncGN4b3BlcGZub3lsdWJmcXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNTczNjEsImV4cCI6MjA0ODkzMzM2MX0.zrqOJi5p0m4fTKxT0e0Nj3LclWfPozEHGCYnJZrA9K8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarColaboradores() {
  try {
    console.log('🔍 Verificando colaboradores PJ inseridos...');
    
    // Contar total de colaboradores
    const { data: total, error: errorTotal } = await supabase
      .from('colaboradores')
      .select('id', { count: 'exact' });

    if (errorTotal) {
      console.error('❌ Erro ao contar total:', errorTotal);
      return;
    }

    console.log(`📊 Total de colaboradores: ${total?.length || 0}`);

    // Contar por regime
    const { data: regimes, error: errorRegimes } = await supabase
      .from('colaboradores')
      .select('regime_contratacao, tipo_salario, salario_valor, cargo');

    if (errorRegimes) {
      console.error('❌ Erro ao buscar regimes:', errorRegimes);
      return;
    }

    // Agregar por regime
    const regimeStats = regimes?.reduce((acc, colaborador) => {
      const regime = colaborador.regime_contratacao;
      if (!acc[regime]) {
        acc[regime] = { count: 0, tipo_salario: {}, valores: [], cargos: {} };
      }
      acc[regime].count++;
      acc[regime].valores.push(colaborador.salario_valor);
      
      const tipo = colaborador.tipo_salario;
      if (!acc[regime].tipo_salario[tipo]) {
        acc[regime].tipo_salario[tipo] = 0;
      }
      acc[regime].tipo_salario[tipo]++;

      const cargo = colaborador.cargo;
      if (!acc[regime].cargos[cargo]) {
        acc[regime].cargos[cargo] = 0;
      }
      acc[regime].cargos[cargo]++;
      
      return acc;
    }, {});

    console.log('\n📋 Estatísticas por regime:');
    Object.entries(regimeStats || {}).forEach(([regime, stats]) => {
      console.log(`\n  ${regime.toUpperCase()}:`);
      console.log(`    - Total: ${stats.count}`);
      console.log(`    - Tipos de salário:`, stats.tipo_salario);
      console.log(`    - Cargos:`, stats.cargos);
      if (stats.valores.length > 0) {
        const min = Math.min(...stats.valores);
        const max = Math.max(...stats.valores);
        const avg = stats.valores.reduce((a, b) => a + b, 0) / stats.valores.length;
        console.log(`    - Faixa salarial: R$ ${min} - R$ ${max} (média: R$ ${avg.toFixed(2)})`);
      }
    });

    // Verificar colaboradores PJ específicos
    const { data: pjColaboradores, error: errorPJ } = await supabase
      .from('colaboradores')
      .select('nome_completo, cargo, salario_valor, tipo_salario')
      .eq('regime_contratacao', 'pj')
      .limit(10);

    if (errorPJ) {
      console.error('❌ Erro ao buscar PJ:', errorPJ);
      return;
    }

    console.log('\n👥 Primeiros 10 colaboradores PJ:');
    pjColaboradores?.forEach(colaborador => {
      console.log(`  ${colaborador.nome_completo} - ${colaborador.cargo} - R$ ${colaborador.salario_valor}/${colaborador.tipo_salario}`);
    });

    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verificarColaboradores();
