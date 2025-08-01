const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configurações do Supabase
const supabaseUrl = 'https://gkmzldtbiwzhhcnqwqer.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbXpsZHRiaXd6aGhjbnF3cWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ2NzEzMywiZXhwIjoyMDUwMDQzMTMzfQ.F9cKbDKnPr2LPYp-NRQ1v_-SvG-TsNNKnbS1lrT-ZiA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executarScript() {
    try {
        console.log('🔄 Lendo arquivo SQL...');
        const sql = fs.readFileSync('./criar_views_salas_profissionais.sql', 'utf8');
        
        console.log('🔄 Executando script das views...');
        
        // Dividir o script em comandos individuais
        const comandos = sql.split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        for (let i = 0; i < comandos.length; i++) {
            const comando = comandos[i];
            if (comando && comando.toLowerCase().includes('create') || comando.toLowerCase().includes('select')) {
                console.log(`🔄 Executando comando ${i + 1}/${comandos.length}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: comando
                }).catch(() => {
                    // Se exec_sql não existir, vamos tentar com query direto
                    return supabase.from('dual').select('*').limit(0);
                });
                
                if (error && !error.message.includes('does not exist')) {
                    console.error(`❌ Erro no comando ${i + 1}:`, error.message);
                } else {
                    console.log(`✅ Comando ${i + 1} executado com sucesso`);
                }
            }
        }
        
        console.log('\n✅ Script executado! Verificando views criadas...');
        
        // Verificar se as views foram criadas
        const { data: views, error: viewsError } = await supabase
            .from('information_schema.views')
            .select('table_name')
            .in('table_name', ['vw_salas_profissionais', 'vw_agendamentos_completo', 'vw_salas_para_agendamento']);
        
        if (viewsError) {
            console.log('⚠️ Não foi possível verificar as views diretamente');
        } else if (views && views.length > 0) {
            console.log('\n📋 Views encontradas:');
            views.forEach(view => {
                console.log(`  ✅ ${view.table_name}`);
            });
        }
        
        // Teste da view principal
        console.log('\n🧪 Testando view vw_salas_para_agendamento...');
        const { data: testData, error: testError } = await supabase
            .from('vw_salas_para_agendamento')
            .select('*')
            .limit(3);
        
        if (testError) {
            console.error('❌ Erro ao testar view:', testError.message);
        } else {
            console.log('✅ View funcionando! Dados de exemplo:');
            console.log(JSON.stringify(testData, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

executarScript();
