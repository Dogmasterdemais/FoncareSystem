"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { verificarCampoDocumento } from '../lib/migracao-documento';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Users,
  Activity,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Eye,
  Plus,
  Trash2,
  CreditCard
} from 'lucide-react';

export default function DatabaseTestComponent() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    hoje: 0,
    semana: 0,
    mes: 0
  });
  const [convenios, setConvenios] = useState<any[]>([]);
  const [conveniosCarregados, setConveniosCarregados] = useState(false);

  useEffect(() => {
    testConnection();
    fetchPacientes();
    fetchConvenios();
  }, []);

  const testConnection = async () => {
    try {
      // Primeiro, verificar se o campo documento existe
      const campoExiste = await verificarCampoDocumento();
      if (!campoExiste) {
        console.log('Campo documento não existe, mas continuando...');
      }
      
      const { data, error } = await supabase.from('pacientes').select('count', { count: 'exact' });
      if (error) throw error;
      setConnectionStatus('connected');
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message);
    }
  };

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os pacientes
      const { data: allPacientes, error: allError } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (allError) throw allError;

      // Buscar estatísticas
      const { count: totalCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true });

      const hoje = new Date();
      const semanaPassada = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      const mesPassado = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { count: hojeCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hoje.toISOString().split('T')[0]);

      const { count: semanaCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', semanaPassada.toISOString());

      const { count: mesCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', mesPassado.toISOString());

      setPacientes(allPacientes || []);
      setStats({
        total: totalCount || 0,
        hoje: hojeCount || 0,
        semana: semanaCount || 0,
        mes: mesCount || 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConvenios = async () => {
    try {
      const { data, error } = await supabase
        .from('convenios')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar convênios:', error);
      } else {
        setConvenios(data || []);
        setConveniosCarregados(true);
      }
    } catch (err: any) {
      console.error('Erro ao buscar convênios:', err);
    }
  };

  const testInsert = async () => {
    try {
      const testPaciente = {
        nome: 'Teste Sistema',
        email: 'teste@sistema.com',
        telefone: '(11) 99999-9999',
        data_nascimento: '1990-01-01',
        documento: '123.456.789-00',
        sexo: 'M',
        cpf: '123.456.789-00',
        ativo: true
      };

      const { data, error } = await supabase
        .from('pacientes')
        .insert([testPaciente])
        .select();

      if (error) throw error;
      
      alert('Teste de inserção realizado com sucesso!');
      fetchPacientes(); // Atualizar lista
    } catch (err: any) {
      alert(`Erro no teste: ${err.message}`);
    }
  };

  const deletePaciente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchPacientes(); // Atualizar lista
    } catch (err: any) {
      alert(`Erro ao deletar: ${err.message}`);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Status do Banco de Dados</h3>
        </div>
        <button
          onClick={fetchPacientes}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Status da Conexão */}
      <div className="mb-6 p-4 rounded-xl border-2 border-dashed">
        <div className="flex items-center gap-3">
          {connectionStatus === 'testing' && (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-blue-600">Testando conexão...</span>
            </>
          )}
          {connectionStatus === 'connected' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-600">Conectado ao Supabase</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-600">Erro de conexão: {error}</span>
            </>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Total</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Hoje</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{stats.hoje}</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Semana</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">{stats.semana}</div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Mês</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">{stats.mes}</div>
        </div>
      </div>

      {/* Convênios Carregados */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Convênios Disponíveis
        </h4>
        
        {conveniosCarregados ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {convenios.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Nenhum convênio encontrado</p>
              </div>
            ) : (
              convenios.map((convenio) => (
                <div
                  key={convenio.id}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    {convenio.nome}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    {convenio.tipo}
                  </div>
                  {convenio.codigo && (
                    <div className="text-xs text-blue-500 dark:text-blue-400">
                      Código: {convenio.codigo}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {convenio.ativo ? '✅ Ativo' : '❌ Inativo'}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2">Carregando convênios...</span>
          </div>
        )}
      </div>

      {/* Teste de Inserção */}
      <div className="mb-6">
        <button
          onClick={testInsert}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Testar Inserção
        </button>
      </div>

      {/* Lista de Pacientes */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Últimos Pacientes Cadastrados
        </h4>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : pacientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum paciente cadastrado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pacientes.map((paciente) => (
              <div
                key={paciente.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {paciente.nome?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {paciente.nome || 'Nome não informado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {paciente.email || 'Email não informado'} • {paciente.telefone || 'Telefone não informado'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Cadastrado em: {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => console.log('Visualizar:', paciente)}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja deletar este paciente?')) {
                        deletePaciente(paciente.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
