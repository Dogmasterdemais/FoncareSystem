// Exemplo de uso do FinanceiroService - teste prático

import { createClient } from '@supabase/supabase-js';
import { FinanceiroService } from '../src/services/financeiroService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const financeiroService = new FinanceiroService(supabase);

// Exemplo 1: Carregar dados do dashboard
async function exemploCarregarDashboard() {
  console.log('=== Carregando Dashboard ===');
  
  try {
    const dashboard = await financeiroService.getDashboardData();
    console.log('Dashboard:', {
      receitaMes: `R$ ${dashboard.receita_mes?.toLocaleString('pt-BR') || '0,00'}`,
      despesaMes: `R$ ${dashboard.despesa_mes?.toLocaleString('pt-BR') || '0,00'}`,
      totalPagar: `R$ ${dashboard.total_pagar?.toLocaleString('pt-BR') || '0,00'}`,
      totalReceber: `R$ ${dashboard.total_receber?.toLocaleString('pt-BR') || '0,00'}`,
      atendimentosMes: dashboard.atendimentos_mes,
      ticketMedio: `R$ ${dashboard.ticket_medio?.toLocaleString('pt-BR') || '0,00'}`,
      contasVencendo: dashboard.contas_vencendo
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

// Exemplo 2: Criar uma conta a pagar
async function exemploContaPagar() {
  console.log('=== Criando Conta a Pagar ===');
  
  try {
    const novaConta = await financeiroService.createContaPagar({
      descricao: 'Fornecimento de Energia Elétrica - Janeiro 2025',
      fornecedor: 'ENEL Distribuição SP',
      valor: 1850.75,
      data_vencimento: '2025-02-10',
      categoria: 'Fixa',
      observacoes: 'Conta referente ao mês de janeiro',
      documento: 'ENEL-2025-001'
    });
    
    console.log('Conta criada:', novaConta);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
  }
}

// Exemplo 3: Listar contas a pagar com filtros
async function exemploListarContasPagar() {
  console.log('=== Listando Contas a Pagar ===');
  
  try {
    // Todas as contas
    const todasContas = await financeiroService.getContasPagar();
    console.log(`Total de contas: ${todasContas.length}`);
    
    // Contas pendentes
    const contasPendentes = await financeiroService.getContasPagar({
      status: 'Pendente'
    });
    console.log(`Contas pendentes: ${contasPendentes.length}`);
    
    // Contas por categoria
    const contasFixas = await financeiroService.getContasPagar({
      categoria: 'Fixa'
    });
    console.log(`Contas fixas: ${contasFixas.length}`);
    
    // Contas vencendo nos próximos 7 dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 7);
    
    const contasVencendo = await financeiroService.getContasPagar({
      data_vencimento_ate: dataLimite.toISOString().split('T')[0]
    });
    console.log(`Contas vencendo em 7 dias: ${contasVencendo.length}`);
    
  } catch (error) {
    console.error('Erro ao listar contas:', error);
  }
}

// Exemplo 4: Criar conta a receber de atendimento particular
async function exemploContaReceber() {
  console.log('=== Criando Conta a Receber ===');
  
  try {
    const novaConta = await financeiroService.createContaReceber({
      descricao: 'Consulta Psicológica - Maria Silva',
      valor_bruto: 180.00,
      valor_liquido: 180.00,
      data_vencimento: '2025-02-15',
      origem: 'Particular',
      observacoes: 'Sessão individual de 50 minutos'
    });
    
    console.log('Conta a receber criada:', novaConta);
  } catch (error) {
    console.error('Erro ao criar conta a receber:', error);
  }
}

// Exemplo 5: Registrar atendimento com guia
async function exemploAtendimentoGuia() {
  console.log('=== Registrando Atendimento com Guia ===');
  
  try {
    const atendimento = await financeiroService.createAtendimentoGuia({
      numero_guia: 'GT2025002',
      paciente_nome: 'João Santos Oliveira',
      paciente_documento: '123.456.789-00',
      convenio: 'Unimed Nacional',
      procedimento: 'Terapia Individual - Psicologia Clínica',
      codigo_procedimento: '70101019',
      valor_guia: 125.00,
      data_atendimento: '2025-01-15',
      profissional_nome: 'Dr. Ana Maria Costa',
      status: 'Realizado',
      observacoes: 'Primeira sessão do tratamento'
    });
    
    console.log('Atendimento registrado:', atendimento);
  } catch (error) {
    console.error('Erro ao registrar atendimento:', error);
  }
}

// Exemplo 6: Gerar relatório de superávit
async function exemploRelatorioSuperavit() {
  console.log('=== Relatório de Superávit ===');
  
  try {
    // Relatório do mês atual
    const dataInicio = new Date();
    dataInicio.setDate(1); // Primeiro dia do mês
    
    const dataFim = new Date();
    
    const relatorio = await financeiroService.getRelatorioSuperavit(
      dataInicio.toISOString().split('T')[0],
      dataFim.toISOString().split('T')[0]
    );
    
    console.log('Relatório de Superávit:');
    relatorio.forEach(unidade => {
      console.log(`
Unidade: ${unidade.unidade_nome}
Receita: R$ ${unidade.receita_total?.toLocaleString('pt-BR') || '0,00'}
Despesa: R$ ${unidade.despesa_total?.toLocaleString('pt-BR') || '0,00'}
Resultado: R$ ${unidade.resultado?.toLocaleString('pt-BR') || '0,00'}
Margem: ${unidade.margem_percentual || 0}%
Atendimentos: ${unidade.total_atendimentos || 0}
---`);
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
  }
}

// Exemplo 7: Upload de nota fiscal
async function exemploUploadNota(contaPagarId: string, arquivo: File) {
  console.log('=== Upload de Nota Fiscal ===');
  
  try {
    const resultado = await financeiroService.uploadNotaFiscal(contaPagarId, arquivo, {
      observacoes: 'Nota fiscal referente ao fornecimento de energia'
    });
    
    console.log('Upload realizado:', resultado);
  } catch (error) {
    console.error('Erro no upload:', error);
  }
}

// Exemplo 8: Executar todos os exemplos
async function executarExemplos() {
  console.log('🚀 Iniciando exemplos de uso do FinanceiroService');
  
  await exemploCarregarDashboard();
  await exemploContaPagar();
  await exemploListarContasPagar();
  await exemploContaReceber();
  await exemploAtendimentoGuia();
  await exemploRelatorioSuperavit();
  
  console.log('✅ Exemplos concluídos!');
}

// Para usar em um componente React:
/*
export function ExemploComponente() {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState(null);
  
  const carregarDados = async () => {
    setLoading(true);
    try {
      const dashboard = await financeiroService.getDashboardData();
      setDados(dashboard);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    carregarDados();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <h2>Dashboard Financeiro</h2>
      {dados && (
        <div>
          <p>Receita do Mês: R$ {dados.receita_mes?.toLocaleString('pt-BR')}</p>
          <p>Total a Pagar: R$ {dados.total_pagar?.toLocaleString('pt-BR')}</p>
          <p>Total a Receber: R$ {dados.total_receber?.toLocaleString('pt-BR')}</p>
          <p>Atendimentos: {dados.atendimentos_mes}</p>
        </div>
      )}
    </div>
  );
}
*/

// Exportar exemplos para uso
export {
  exemploCarregarDashboard,
  exemploContaPagar,
  exemploListarContasPagar,
  exemploContaReceber,
  exemploAtendimentoGuia,
  exemploRelatorioSuperavit,
  exemploUploadNota,
  executarExemplos
};
