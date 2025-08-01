"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MainLayout from "../../components/MainLayout";
import { useUnidade } from "../../context/UnidadeContext";
import { Search, Grid3X3, List, Plus, Eye, User, Phone, CreditCard, Building } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  telefone: string;
  email: string;
  convenio_nome: string;
  unidade_nome: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  created_at: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'cards'|'list'>('cards');
  const { unidadeSelecionada } = useUnidade();

  useEffect(() => {
    fetchPacientes();
  }, [unidadeSelecionada]);

  async function fetchPacientes() {
    setLoading(true);
    try {
      let query = supabase.from("vw_pacientes_com_unidade").select("*");
      if (unidadeSelecionada) {
        query = query.eq("unidade_id", unidadeSelecionada);
      }
      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao buscar pacientes:", error);
      } else {
        setPacientes(data || []);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome?.toLowerCase().includes(search.toLowerCase()) ||
    paciente.cpf?.includes(search) ||
    paciente.telefone?.includes(search)
  );

  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  }

  function calculateAge(birthDate: string) {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  }

  return (
    <MainLayout>
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Gerenciar Pacientes
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? 's' : ''} encontrado{filteredPacientes.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.href = '/pacientes/cadastro'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Novo Paciente
              </button>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Controles */}
            <div className="flex gap-3">
              {/* Modo de visualização */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Grid3X3 size={18} />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <List size={18} />
                  Lista
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Conteúdo */}
        {!loading && (
          <>
            {viewMode === 'cards' ? (
              /* Visualização em Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredPacientes.map((paciente) => (
                  <div key={paciente.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                    
                    {/* Avatar e Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                          {getInitials(paciente.nome)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate text-lg">{paciente.nome}</h3>
                          <p className="text-white/80 text-sm">{calculateAge(paciente.data_nascimento)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <User size={16} className="text-gray-400" />
                        <span>{paciente.cpf || 'CPF não informado'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Phone size={16} className="text-gray-400" />
                        <span>{paciente.telefone || 'Telefone não informado'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="truncate">{paciente.convenio_nome || 'Particular'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Building size={16} className="text-gray-400" />
                        <span className="truncate">{paciente.unidade_nome || 'Sem unidade'}</span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="px-6 pb-6 flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <Eye size={16} />
                        Ver Mais
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Visualização em Lista */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paciente</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CPF</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Convênio</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unidade</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPacientes.map((paciente) => (
                        <tr key={paciente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                                {getInitials(paciente.nome)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{paciente.nome}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{calculateAge(paciente.data_nascimento)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{paciente.cpf || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{paciente.telefone || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{paciente.convenio_nome || 'Particular'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{paciente.unidade_nome || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Estado vazio */}
            {filteredPacientes.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhum paciente encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {search ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando o primeiro paciente'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
