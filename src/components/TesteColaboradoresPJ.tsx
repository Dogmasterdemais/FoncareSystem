'use client';

import { supabase } from '../lib/supabaseClient';

export default function TesteColaboradoresPJ() {
  const testarColaboradores = async () => {
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
        .select('regime_contratacao, tipo_salario, salario_valor');

      if (errorRegimes) {
        console.error('❌ Erro ao buscar regimes:', errorRegimes);
        return;
      }

      // Agregar por regime
      const regimeStats = regimes?.reduce((acc, colaborador) => {
        const regime = colaborador.regime_contratacao;
        if (!acc[regime]) {
          acc[regime] = { count: 0, tipo_salario: {}, valores: [] };
        }
        acc[regime].count++;
        acc[regime].valores.push(colaborador.salario_valor);
        
        const tipo = colaborador.tipo_salario;
        if (!acc[regime].tipo_salario[tipo]) {
          acc[regime].tipo_salario[tipo] = 0;
        }
        acc[regime].tipo_salario[tipo]++;
        
        return acc;
      }, {});

      console.log('📋 Estatísticas por regime:');
      Object.entries(regimeStats || {}).forEach(([regime, stats]) => {
        console.log(`  ${regime.toUpperCase()}:`);
        console.log(`    - Total: ${stats.count}`);
        console.log(`    - Tipos: ${JSON.stringify(stats.tipo_salario)}`);
        if (stats.valores.length > 0) {
          const min = Math.min(...stats.valores);
          const max = Math.max(...stats.valores);
          const avg = stats.valores.reduce((a, b) => a + b, 0) / stats.valores.length;
          console.log(`    - Valores: R$ ${min} - R$ ${max} (média: R$ ${avg.toFixed(2)})`);
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

      console.log('👥 Primeiros 10 colaboradores PJ:');
      pjColaboradores?.forEach(colaborador => {
        console.log(`  ${colaborador.nome_completo} - ${colaborador.cargo} - R$ ${colaborador.salario_valor}/${colaborador.tipo_salario}`);
      });

    } catch (error) {
      console.error('❌ Erro geral:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Teste Colaboradores PJ</h1>
      
      <div className="space-y-4">
        <button
          onClick={testarColaboradores}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Verificar Colaboradores Inseridos
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          📝 Abra o console do navegador (F12) para ver os resultados detalhados
        </p>
      </div>
    </div>
  );
}
