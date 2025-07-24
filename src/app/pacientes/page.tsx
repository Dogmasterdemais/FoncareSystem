"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MainLayout from "../../components/MainLayout";
import { PacienteModal } from "../../components/PacienteModal";
import { useUnidade } from "../../context/UnidadeContext";
import * as XLSX from "xlsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZES = [20, 50, 100];
const TABLE_FIELDS = [
  { key: "nome", label: "Nome" },
  { key: "cpf", label: "CPF" },
  { key: "data_nascimento", label: "Data de Nascimento" },
  { key: "convenio_nome", label: "Convênio" },
  { key: "unidade_nome", label: "Unidade" },
];

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid'|'list'>('list');
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [selectedFields, setSelectedFields] = useState(TABLE_FIELDS.map(f => f.key));
  const [showFields, setShowFields] = useState(false);
  const { unidadeSelecionada, unidades } = useUnidade();

  function handleSavePaciente(pacienteEditado: any, file?: File) {
    // Atualiza o paciente na lista local
    setPacientes(prev => prev.map(p => 
      p.id === pacienteEditado.id ? { ...p, ...pacienteEditado } : p
    ));
    
    // Recarrega os dados do banco para garantir sincronização
    fetchPacientes();
  }

  async function fetchPacientes() {
    setLoading(true);
    let query = supabase.from("vw_pacientes_com_unidade").select("*");
    if (unidadeSelecionada) {
      query = query.eq("unidade_id", unidadeSelecionada);
    }
    const { data, error } = await query;
    if (!error && data) setPacientes(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPacientes();
  }, [unidadeSelecionada]);

  // Filtro de pesquisa
  const filtered = pacientes.filter((p) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      p.nome?.toLowerCase().includes(s) ||
      p.cpf?.toLowerCase().includes(s) ||
      p.telefone?.toLowerCase().includes(s)
    );
  });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleExport() {
    const exportData = pacientes.map(p => ({
      "ID": p.id,
      "Nome": p.nome,
      "CPF": p.cpf,
      "RG": p.rg,
      "Data de Nascimento": p.data_nascimento,
      "Sexo": p.sexo,
      "Profissão": p.profissao,
      "Estado Civil": p.estado_civil,
      "Telefone": p.telefone,
      "Email": p.email,
      "CEP": p.cep,
      "Logradouro": p.logradouro,
      "Número": p.numero,
      "Complemento": p.complemento,
      "Bairro": p.bairro,
      "Cidade": p.cidade,
      "UF": p.uf,
      "Convênio": p.convenio_nome,
      "Carteirinha": p.numero_carteirinha,
      "Validade Carteira": p.validade_carteira,
      "Unidade": p.unidade_nome,
      "Responsável Nome": p.responsavel_nome,
      "Responsável Parentesco": p.responsavel_parentesco,
      "Responsável Telefone": p.responsavel_telefone,
      "Responsável CPF": p.responsavel_cpf,
      "Observações": p.observacoes,
      "Ativo": p.ativo ? "Sim" : "Não",
      "Criado em": p.created_at,
      "Atualizado em": p.updated_at
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pacientes");
    XLSX.writeFile(wb, "pacientes.xlsx");
  }

  return (
    <MainLayout>
      <div className="w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header moderno */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-blue-100 dark:border-blue-800/50 sticky top-0 z-20 shadow-lg">
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  👥
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Pacientes</h1>
                  <p className="text-slate-600 dark:text-slate-400">Gerencie os pacientes da sua clínica</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-2xl font-semibold text-sm">
                  {filtered.length} paciente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {/* Barra de busca e controles */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Pesquisar por nome, CPF ou telefone..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-lg transition-all shadow-sm hover:shadow-md"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-green-500/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-600"
                >
                  {viewMode === 'list' ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Cards
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Lista
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="px-4 md:px-6 py-2 w-full max-w-full">{viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-fade-in">
            {paginated.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-12 text-center border border-blue-100 dark:border-blue-800/50 shadow-xl">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Nenhum paciente encontrado</h3>
                  <p className="text-slate-600 dark:text-slate-400">Tente ajustar os filtros de busca</p>
                </div>
              </div>
            ) : (
              paginated.map((p) => (
                <div key={p.id} className="group">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                          {p.nome?.charAt(0) || "P"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                          {p.nome}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ID: {p.id}</p>
                        {p.ativo === false && (
                          <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold mt-1">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <span className="font-medium">CPF:</span> {p.cpf || "-"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="font-medium">Telefone:</span> {p.telefone || "-"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">Convênio:</span> {p.convenio_nome || "-"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">Unidade:</span> {p.unidade_nome || "-"}
                      </div>
                    </div>
                    <PacienteModal paciente={p} onSave={handleSavePaciente} />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-b border-blue-100 dark:border-blue-800/50">
                  <tr>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Paciente</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider hidden sm:table-cell">CPF</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider hidden md:table-cell">Data Nasc.</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider hidden lg:table-cell">Convênio</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider hidden xl:table-cell">Unidade</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider hidden lg:table-cell">Telefone</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 dark:divide-blue-800/50">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Nenhum paciente encontrado</h3>
                            <p className="text-slate-600 dark:text-slate-400">Tente ajustar os filtros de busca</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                              {p.nome?.charAt(0) || "P"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{p.nome}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                                {p.cpf && `CPF: ${p.cpf}`}
                                {p.telefone && ` • Tel: ${p.telefone}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium hidden sm:table-cell">{p.cpf || "-"}</td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 hidden md:table-cell">{p.data_nascimento || "-"}</td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 hidden lg:table-cell">{p.convenio_nome || "-"}</td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 hidden xl:table-cell">{p.unidade_nome || "-"}</td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 hidden lg:table-cell">{p.telefone || "-"}</td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <PacienteModal paciente={p} onSave={handleSavePaciente} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginação moderna */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-12 h-12 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Próxima
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}
