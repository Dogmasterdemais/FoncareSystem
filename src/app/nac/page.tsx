import Link from 'next/link';
import MainLayout from '../../components/MainLayout';

export default function NACPage() {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4 text-cyan-600">NAC</h1>
      <nav className="space-y-4">
        <Link href="/nac/pacientes" className="block px-4 py-2 rounded bg-cyan-50 text-cyan-700 font-medium hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-600">Cadastro de Pacientes</Link>
        <Link href="/nac/agendamentos" className="block px-4 py-2 rounded bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500">Agenda</Link>
      </nav>
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-cyan-600 mb-4">Resumo NAC</h2>
        <p className="text-zinc-700 dark:text-zinc-200">Gerencie o Núcleo de Apoio ao Cliente, incluindo cadastro de pacientes e controle de agenda.</p>
      </div>
    </MainLayout>
  );
}
