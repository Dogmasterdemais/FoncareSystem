import MainLayout from '../../components/MainLayout';
export default function ContabilPage() {
  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-none">
        <h1 className="text-2xl font-bold mb-4 text-cyan-600">Contábil</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-cyan-600 mb-2">R$ 12.800</span>
          <span className="text-zinc-700 dark:text-zinc-200">Faturamento do mês</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-amber-500 mb-2">R$ 2.300</span>
          <span className="text-zinc-700 dark:text-zinc-200">Despesas</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-green-500 mb-2">R$ 10.500</span>
          <span className="text-zinc-700 dark:text-zinc-200">Lucro</span>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-cyan-600 mb-4">Resumo Contábil</h2>
        <p className="text-zinc-700 dark:text-zinc-200">Acompanhe o balanço contábil da clínica, incluindo receitas, despesas e lucro líquido. Os dados são atualizados conforme movimentação financeira.</p>
      </div>
      </div>
    </MainLayout>
  );
}
