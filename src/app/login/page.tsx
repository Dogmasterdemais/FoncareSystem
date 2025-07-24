import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="bg-white dark:bg-gray-950 shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center animate-fade-in">
        <Image src="/logo-foncare.png" alt="Foncare Logo" width={120} height={120} className="mb-6 drop-shadow-xl" />
        <h1 className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 mb-2 tracking-tight">Bem-vindo ao Foncare</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">Sistema inovador para gestão de clínicas</p>
        <form className="w-full space-y-5">
          <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" placeholder="Senha" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:scale-105 transition-transform">Entrar</button>
        </form>
        <div className="mt-6 text-xs text-gray-400">© 2025 Foncare. Todos os direitos reservados.</div>
      </div>
    </div>
  );
}
