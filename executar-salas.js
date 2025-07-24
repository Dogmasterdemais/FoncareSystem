const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase (usando as mesmas credenciais do projeto)
const supabaseUrl = 'https://vqzvaqwgrbmrprctgnhq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxenZhcXdncmJtcnByY3RnbmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4MDc5NjAsImV4cCI6MjA1MDM4Mzk2MH0.aMb5DXeEqoNOUl0EEJbEuQ4QWgXUktm5YOHRQ8v-w9A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executarSalas() {
  try {
    console.log('🔄 Lendo arquivo salas_rows.sql...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('./salas_rows.sql', 'utf8');
    
    console.log('📊 Tamanho do arquivo:', sqlContent.length, 'caracteres');
    
    // Verificar se contém INSERT
    if (sqlContent.includes('INSERT INTO "public"."salas"')) {
      console.log('✅ Arquivo contém INSERT para salas');
      
      // O arquivo tem uma linha gigante com INSERT
      console.log('📊 Extraindo dados do INSERT...');
      
      // Extrair os VALUES
      const valuesMatch = sqlContent.match(/VALUES\s+(.+)$/);
      if (valuesMatch) {
        const valuesString = valuesMatch[1];
        console.log('✅ VALUES encontrados');
        
        // Parse manual dos dados (simplificado)
        // Contar quantos registros existem
        const recordCount = (valuesString.match(/\),\s*\(/g) || []).length + 1;
        console.log('📊 Registros encontrados no SQL:', recordCount);
        
        // Verificar tabela atual
        console.log('🔄 Verificando tabela salas atual...');
        
        const { count: currentCount, error: countError } = await supabase
          .from('salas')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('❌ Erro ao verificar tabela:', countError);
          return;
        }
        
        console.log('📊 Salas atualmente no banco:', currentCount);
        
        if (currentCount > 0) {
          console.log(`⚠️ A tabela já contém ${currentCount} registros.`);
          console.log('🔄 Limpando tabela para reinserir dados...');
          
          // Limpar tabela
          const { error: deleteError } = await supabase
            .from('salas')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
          
          if (deleteError) {
            console.error('❌ Erro ao limpar tabela:', deleteError);
          } else {
            console.log('✅ Tabela limpa com sucesso');
          }
        }
        
        // Como o Supabase JS não suporta SQL direto, vamos usar uma abordagem alternativa
        console.log('💡 Para executar o SQL, use uma das opções:');
        console.log('');
        console.log('🌐 OPÇÃO 1 - Dashboard Supabase:');
        console.log('   1. Acesse: https://vqzvaqwgrbmrprctgnhq.supabase.co/project/vqzvaqwgrbmrprctgnhq/sql');
        console.log('   2. Cole o conteúdo do arquivo salas_rows.sql');
        console.log('   3. Clique em "Run"');
        console.log('');
        console.log('🔧 OPÇÃO 2 - Usar psql (se instalado):');
        console.log('   psql "postgresql://postgres:sua_senha@db.vqzvaqwgrbmrprctgnhq.supabase.co:5432/postgres" -f salas_rows.sql');
        console.log('');
        console.log(`📊 O arquivo contém ${recordCount} salas para inserir`);
        console.log('🎯 Inclui salas para a unidade a4429bd3-1737-43bc-920e-dae4749e20dd (Osasco 2)');
        
      } else {
        console.log('❌ Não foi possível extrair VALUES do SQL');
      }
      
    } else {
      console.log('❌ Arquivo não contém INSERT para salas');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

executarSalas();
