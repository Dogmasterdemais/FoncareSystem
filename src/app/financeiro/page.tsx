"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MainLayout from "../../components/MainLayout";
import { useUnidade } from "../../context/UnidadeContext";
import ContasPagarManager from "../../components/ContasPagarManager";
import ContasReceberManager from "../../components/ContasReceberManager";
import { AnaliseUnidades } from "../../components/financeiro/AnaliseUnidades";
import { AtendimentosGuiasTabuladas } from "../../components/financeiro/AtendimentosGuiasTabuladas";
import { GestaoNFe } from "../../components/financeiro/GestaoNFe";
import { FinanceiroService } from "../../services/financeiroService";
import RelatoriosFinanceiros from "../../components/RelatoriosFinanceiros";
import TesteNFe from "../teste-nfe/page";
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Calendar, 
  Users, 
  Building, 
  Calculator,
  PieChart,
  BarChart3,
  Receipt,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Edit,
  Download,
  Filter,
  Search,
  X,
  Save,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  TestTube
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FinanceCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

export default function FinanceiroPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pagar' | 'receber' | 'folha' | 'relatorios' | 'nfe' | 'teste_nfe' | 'analise_unidades' | 'atendimentos_guias'>('dashboard');
  const [dashboardData, setDashboardData] = useState<FinanceCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const { unidadeSelecionada } = useUnidade();

  useEffect(() => {
    loadDashboardData();
  }, [unidadeSelecionada]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Carregar dados reais do dashboard usando o serviço
      const financeiroService = new FinanceiroService();
      const dashboardData = await financeiroService.getDashboardData();
      
      const cards: FinanceCard[] = [
        {
          title: "Receita do Mês",
          value: `R$ ${dashboardData.receita_mes?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
          change: "+12,5%", // TODO: Calcular variação real
          changeType: "positive",
          icon: <TrendingUp className="w-6 h-6" />,
          description: "Recebido no mês atual"
        },
        {
          title: "Contas a Pagar",
          value: `R$ ${dashboardData.total_pagar?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
          change: "-5,2%", // TODO: Calcular variação real
          changeType: "positive",
          icon: <TrendingDown className="w-6 h-6" />,
          description: "Pendente de pagamento"
        },
        {
          title: "Contas a Receber",
          value: `R$ ${dashboardData.total_receber?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
          change: "+8,1%", // TODO: Calcular variação real
          changeType: "positive",
          icon: <DollarSign className="w-6 h-6" />,
          description: "Pendente de recebimento"
        },
        {
          title: "Atendimentos",
          value: dashboardData.atendimentos_mes?.toString() || '0',
          change: `Ticket: R$ ${dashboardData.ticket_medio?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
          changeType: "neutral",
          icon: <Users className="w-6 h-6" />,
          description: "Realizados no mês"
        }
      ];
      
      setDashboardData(cards);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      // Fallback para dados mock em caso de erro
      const mockData: FinanceCard[] = [
        {
          title: "Receita Total",
          value: "R$ 245.850,00",
          change: "+12,5%",
          changeType: "positive",
          icon: <TrendingUp className="w-6 h-6" />,
          description: "Comparado ao mês anterior"
        },
        {
          title: "Contas a Pagar",
          value: "R$ 89.320,00",
          change: "-5,2%",
          changeType: "positive",
          icon: <TrendingDown className="w-6 h-6" />,
          description: "Redução nas despesas"
        },
        {
          title: "Contas a Receber",
          value: "R$ 156.530,00",
          change: "+8,1%",
          changeType: "positive",
          icon: <DollarSign className="w-6 h-6" />,
          description: "Pendente de recebimento"
        },
        {
          title: "Glosas",
          value: "R$ 12.450,00",
          change: "5,1%",
          changeType: "negative",
          icon: <AlertTriangle className="w-6 h-6" />,
          description: "Percentual sobre faturamento"
        }
      ];
      
      setDashboardData(mockData);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'pagar', label: 'Contas a Pagar', icon: <CreditCard size={18} /> },
    { id: 'receber', label: 'Contas a Receber', icon: <Wallet size={18} /> },
    { id: 'folha', label: 'Folha de Pagamento', icon: <Users size={18} /> },
    { id: 'relatorios', label: 'Relatórios', icon: <FileText size={18} /> },
    { id: 'nfe', label: 'Notas Fiscais', icon: <Receipt size={18} /> },
    { id: 'teste_nfe', label: 'Teste NFe', icon: <TestTube size={18} /> },
    { id: 'analise_unidades', label: 'Análise Unidades', icon: <Building size={18} /> },
    { id: 'atendimentos_guias', label: 'Atendimentos Guias', icon: <Calculator size={18} /> }
  ];

  return (
    <MainLayout>
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Módulo Financeiro
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestão completa das finanças da clínica
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                <Download size={18} />
                Exportar Relatórios
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Plus size={18} />
                Nova Movimentação
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Layout Responsivo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            {/* Versão Mobile - Dropdown */}
            <div className="block lg:hidden p-4">
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Versão Desktop - Tabs Responsivas */}
            <nav className="hidden lg:block">
              <div className="grid grid-cols-4 xl:grid-cols-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col xl:flex-row items-center justify-center gap-1 xl:gap-3 px-2 xl:px-4 py-3 xl:py-4 font-medium text-xs xl:text-sm border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="flex-shrink-0">{tab.icon}</span>
                    <span className="text-center xl:text-left leading-tight">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData.map((card, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        {card.icon}
                      </div>
                      <span className={`text-sm font-medium ${
                        card.changeType === 'positive' ? 'text-green-600' : 
                        card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {card.change}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                      {card.value}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                      {card.title}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Gráficos e Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fluxo de Caixa */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Fluxo de Caixa - Últimos 6 Meses
                    </h3>
                    <PieChart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Gráfico de Fluxo de Caixa
                    <br />
                    <small>(Implementar com Chart.js ou similar)</small>
                  </div>
                </div>

                {/* Análise de Receitas */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Origem das Receitas
                    </h3>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Consultas</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">R$ 125.400,00</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Procedimentos</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">R$ 89.250,00</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '43%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Exames</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">R$ 31.200,00</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo de Glosas */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Análise de Glosas
                  </h3>
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                      R$ 243.500,00
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Valor Provisionado
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      R$ 231.050,00
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Valor Recebido
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      R$ 12.450,00
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Glosas (5,1%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pagar' && (
            <ContasPagarManager unidadeId={unidadeSelecionada} />
          )}

          {activeTab === 'receber' && (
            <ContasReceberManager unidadeId={unidadeSelecionada} />
          )}

          {activeTab === 'folha' && (
            <FolhaPagamentoTab />
          )}

          {activeTab === 'relatorios' && (
            <RelatoriosTab />
          )}

          {activeTab === 'nfe' && (
            <GestaoNFe />
          )}

          {activeTab === 'teste_nfe' && (
            <TesteNFe />
          )}

          {activeTab === 'analise_unidades' && (
            <AnaliseUnidades />
          )}

          {activeTab === 'atendimentos_guias' && (
            <AtendimentosGuiasTabuladas />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Componente Folha de Pagamento
function FolhaPagamentoTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Folha de Pagamento CLT
            </h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total de Funcionários CLT</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Salários Base</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">R$ 45.600,00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Encargos</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">R$ 15.960,00</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200">Total CLT</span>
                <span className="font-bold text-lg text-blue-600">R$ 61.560,00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Folha de Pagamento PJ
            </h3>
            <Building className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total de Profissionais PJ</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Honorários Base</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">R$ 89.200,00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Repasses (%)</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">R$ 71.360,00</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200">Total PJ</span>
                <span className="font-bold text-lg text-green-600">R$ 71.360,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Total */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Resumo Total da Folha
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">R$ 61.560,00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">CLT Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">R$ 71.360,00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">PJ Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">R$ 132.920,00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Geral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">54,1%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">% sobre Receita</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Relatórios
function RelatoriosTab() {
  return <RelatoriosFinanceiros />;
}
