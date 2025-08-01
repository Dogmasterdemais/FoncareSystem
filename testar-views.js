const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://gkmzldtbiwzhhcnqwqer.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbXpsZHRiaXd6aGhjbnF3cWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ2NzEzMywiZXhwIjoyMDUwMDQzMTMzfQ.F9cKbDKnPr2LPYp-NRQ1v_-SvG-TsNNKnbS1lrT-ZiA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testarViews() {
    try {
        console.log('🧪 Testando views existentes...');
        
        // Teste 1: View de agendamentos completa
        console.log('\n1. Testando vw_agendamentos_completo...');
        const { data: agendamentos, error: agendamentosError } = await supabase
            .from('vw_agendamentos_completo')
            .select('*')
            .limit(2);
        
        if (agendamentosError) {
            console.error('❌ Erro na vw_agendamentos_completo:', agendamentosError.message);
        } else {
            console.log('✅ View vw_agendamentos_completo funcionando!');
            if (agendamentos && agendamentos.length > 0) {
                console.log('Campos disponíveis:', Object.keys(agendamentos[0]));
                console.log('Exemplo:', JSON.stringify(agendamentos[0], null, 2));
            }
        }
        
        // Teste 2: Testar query de salas com profissionais diretamente
        console.log('\n2. Testando query de salas com profissionais...');
        const { data: salas, error: salasError } = await supabase
            .from('salas')
            .select(`
                id,
                nome,
                numero,
                tipo,
                cor,
                capacidade_maxima,
                unidades:unidade_id (
                    nome
                ),
                profissionais_salas!inner (
                    turno,
                    ativo,
                    colaboradores:profissional_id (
                        nome_completo,
                        cargo,
                        status
                    )
                )
            `)
            .eq('ativo', true)
            .eq('profissionais_salas.ativo', true)
            .limit(5);
        
        if (salasError) {
            console.error('❌ Erro na query de salas:', salasError.message);
        } else {
            console.log('✅ Query de salas com profissionais funcionando!');
            console.log('Dados das salas:');
            console.log(JSON.stringify(salas, null, 2));
        }
        
        // Teste 3: Query simplificada das salas
        console.log('\n3. Testando query simplificada das salas...');
        const { data: salasSimples, error: salasError2 } = await supabase
            .from('salas')
            .select('id, nome, numero, tipo, cor, capacidade_maxima')
            .eq('ativo', true)
            .limit(5);
        
        if (salasError2) {
            console.error('❌ Erro na query simplificada:', salasError2.message);
        } else {
            console.log('✅ Salas encontradas:', salasSimples.length);
            salasSimples.forEach(sala => {
                console.log(`  - ${sala.nome} (${sala.tipo}) - Capacidade: ${sala.capacidade_maxima}`);
            });
        }
        
        // Teste 4: Profissionais alocados por sala
        console.log('\n4. Verificando profissionais alocados...');
        const { data: profSalas, error: profError } = await supabase
            .from('profissionais_salas')
            .select(`
                sala_id,
                turno,
                ativo,
                colaboradores:profissional_id (
                    nome_completo,
                    cargo
                ),
                salas:sala_id (
                    nome
                )
            `)
            .eq('ativo', true)
            .limit(10);
        
        if (profError) {
            console.error('❌ Erro nos profissionais:', profError.message);
        } else {
            console.log('✅ Profissionais alocados encontrados:', profSalas.length);
            profSalas.forEach(prof => {
                console.log(`  - ${prof.colaboradores?.nome_completo || 'N/A'} (${prof.colaboradores?.cargo || 'N/A'}) na sala ${prof.salas?.nome || 'N/A'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

testarViews();
