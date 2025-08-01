// TESTE: Verificar profissionais alocados diretamente
import { supabase } from './src/lib/supabaseClient.js';

console.log('🔍 Testando conexão e profissionais alocados...');

async function testarProfissionais() {
  try {
    // 1. Teste básico de conexão
    const { data: salas, error: salasError } = await supabase
      .from('salas')
      .select('id, numero, nome')
      .eq('ativo', true)
      .limit(5);
      
    if (salasError) {
      console.error('❌ Erro ao buscar salas:', salasError);
      return;
    }
    
    console.log(`✅ Conexão OK. ${salas.length} salas encontradas:`, salas);
    
    // 2. Verificar profissionais alocados
    const hoje = new Date().toISOString().split('T')[0];
    console.log(`📅 Buscando profissionais para: ${hoje}`);
    
    const { data: profSalas, error: profError } = await supabase
      .from('profissionais_salas')
      .select(`
        sala_id,
        profissional_id,
        turno,
        ativo,
        data_inicio,
        data_fim
      `)
      .eq('ativo', true)
      .lte('data_inicio', hoje)
      .or(`data_fim.is.null,data_fim.gte.${hoje}`);
      
    if (profError) {
      console.error('❌ Erro ao buscar profissionais_salas:', profError);
      return;
    }
    
    console.log(`👨‍⚕️ ${profSalas.length} profissionais alocados:`, profSalas);
    
    // 3. Buscar nomes dos profissionais
    if (profSalas.length > 0) {
      const profIds = [...new Set(profSalas.map(ps => ps.profissional_id))];
      
      const { data: profissionais, error: profNomesError } = await supabase
        .from('profissionais')
        .select('id, nome, especialidades')
        .in('id', profIds);
        
      if (profNomesError) {
        console.error('❌ Erro ao buscar nomes profissionais:', profNomesError);
        return;
      }
      
      console.log(`📋 Profissionais encontrados:`, profissionais);
      
      // 4. Combinar dados
      const combinados = profSalas.map(ps => {
        const prof = profissionais.find(p => p.id === ps.profissional_id);
        return {
          ...ps,
          profissional_nome: prof?.nome || 'Nome não encontrado',
          especialidades: prof?.especialidades || []
        };
      });
      
      console.log(`🎯 Dados combinados:`, combinados);
      
      // 5. Agrupar por sala
      const porSala = combinados.reduce((acc, item) => {
        if (!acc[item.sala_id]) acc[item.sala_id] = [];
        acc[item.sala_id].push(item);
        return acc;
      }, {});
      
      console.log(`🏢 Agrupado por sala:`, porSala);
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testarProfissionais();
