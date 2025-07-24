import MainLayout from '../../../components/MainLayout';
import DatabaseTestComponent from '../../../components/DatabaseTestComponent';
import { Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DatabaseConfigPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/config" 
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Voltar para Configurações</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Database size={32} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Base de Dados</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitore a conexão, estatísticas e funcionalidades do banco de dados
              </p>
            </div>
          </div>
        </div>

        {/* Database Test Component */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <DatabaseTestComponent />
        </div>

        {/* Additional Database Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database size={20} className="text-blue-600" />
              Configurações de Conexão
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL do Banco
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                  Configurado via variáveis de ambiente
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status da Conexão
                </label>
                <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-600 dark:text-green-400">
                  ✅ Conectado com Supabase
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database size={20} className="text-purple-600" />
              Configurações Avançadas
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pool de Conexões
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                  Gerenciado pelo Supabase
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Backup Automático
                </label>
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-600 dark:text-blue-400">
                  ✅ Habilitado no Supabase
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Database size={20} className="text-green-600" />
            Ações do Banco de Dados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <div className="text-blue-600 dark:text-blue-400 font-medium">Sincronizar Schema</div>
              <div className="text-sm text-blue-500 dark:text-blue-500">Atualizar estrutura das tabelas</div>
            </button>
            
            <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <div className="text-green-600 dark:text-green-400 font-medium">Executar Migração</div>
              <div className="text-sm text-green-500 dark:text-green-500">Aplicar mudanças pendentes</div>
            </button>
            
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <div className="text-purple-600 dark:text-purple-400 font-medium">Verificar Integridade</div>
              <div className="text-sm text-purple-500 dark:text-purple-500">Validar dados e relacionamentos</div>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
