"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MainLayout from "../../components/MainLayout";
import { useUnidade } from "../../context/UnidadeContext";
import { Search, Grid3X3, List, Plus, Eye, User, Phone, CreditCard, Building, Edit, FileText, X, Save, Loader2, Download, CheckCircle } from "lucide-react";
import DocumentosPacienteManager from "../../components/DocumentosPacienteManager";
import * as XLSX from "xlsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZES = [12, 24, 48];

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  telefone: string;
  email: string;
  convenio_id?: string;
  convenio_nome: string;
  unidade_id?: string;
  unidade_nome: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  carteirinha?: string;
  observacoes?: string;
  created_at: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'cards'|'list'>('cards');
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view'|'edit'|'documents'>('view');
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pessoais'|'endereco'|'convenio'>('pessoais');
  const [convenios, setConvenios] = useState<{id: string, nome: string}[]>([]);
  const [unidades, setUnidades] = useState<{id: string, nome: string}[]>([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const { unidadeSelecionada } = useUnidade();

  useEffect(() => {
    fetchPacientes();
    fetchConvenios();
    fetchUnidades();
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

  async function fetchConvenios() {
    try {
      const { data, error } = await supabase
        .from('convenios')
        .select('id, nome')
        .order('nome');
      
      if (error) {
        console.error("Erro ao buscar convênios:", error);
      } else {
        setConvenios(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar convênios:", error);
    }
  }

  async function fetchUnidades() {
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('id, nome')
        .order('nome');
      
      if (error) {
        console.error("Erro ao buscar unidades:", error);
      } else {
        setUnidades(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
    }
  }

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome?.toLowerCase().includes(search.toLowerCase()) ||
    paciente.cpf?.includes(search) ||
    paciente.telefone?.includes(search)
  );

  const totalPages = Math.ceil(filteredPacientes.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedPacientes = filteredPacientes.slice(startIndex, startIndex + pageSize);

  function openModal(paciente: Paciente, mode: 'view'|'edit'|'documents' = 'view') {
    setSelectedPaciente(paciente);
    
    // Ao editar, garantir que temos os IDs corretos de convênio e unidade
    if (mode === 'edit') {
      const convenio = convenios.find(c => c.nome === paciente.convenio_nome);
      const unidade = unidades.find(u => u.nome === paciente.unidade_nome);
      
      setEditingPaciente({ 
        ...paciente,
        convenio_id: paciente.convenio_id || convenio?.id || '',
        unidade_id: paciente.unidade_id || unidade?.id || ''
      });
    } else {
      setEditingPaciente({ ...paciente });
    }
    
    setModalMode(mode);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedPaciente(null);
    setEditingPaciente(null);
    setModalMode('view');
    setActiveTab('pessoais');
  }

  async function handleSavePaciente() {
    if (!editingPaciente) return;
    
    setSaving(true);
    try {
      // Preparar dados para atualização, incluindo IDs de convênio e unidade
      const updateData = {
        nome: editingPaciente.nome,
        cpf: editingPaciente.cpf,
        data_nascimento: editingPaciente.data_nascimento,
        sexo: editingPaciente.sexo,
        telefone: editingPaciente.telefone,
        email: editingPaciente.email,
        logradouro: editingPaciente.logradouro,
        numero: editingPaciente.numero,
        bairro: editingPaciente.bairro,
        cidade: editingPaciente.cidade,
        uf: editingPaciente.uf,
        cep: editingPaciente.cep,
        carteirinha: editingPaciente.carteirinha,
        observacoes: editingPaciente.observacoes,
        convenio_id: editingPaciente.convenio_id || null,
        unidade_id: editingPaciente.unidade_id || null
      };

      const { error } = await supabase
        .from('pacientes')
        .update(updateData)
        .eq('id', editingPaciente.id);
      
      if (error) throw error;
      
      // Atualizar lista local de pacientes
      setPacientes(prev => prev.map(p => 
        p.id === editingPaciente.id ? { ...p, ...editingPaciente } : p
      ));
      
      setModalMode('view');
      setSelectedPaciente(editingPaciente);
      
      // Recarregar dados para garantir sincronização
      fetchPacientes();
      
      // Mostrar notificação de sucesso
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 4000);
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar paciente: " + (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleInputChange(field: string, value: any) {
    if (editingPaciente) {
      setEditingPaciente(prev => prev ? { ...prev, [field]: value } : null);
    }
  }

  function exportToExcel() {
    const dataToExport = filteredPacientes.map(p => ({
      Nome: p.nome,
      CPF: p.cpf,
      'Data Nascimento': p.data_nascimento,
      Sexo: p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Feminino' : '',
      Telefone: p.telefone,
      Email: p.email,
      Convênio: p.convenio_nome,
      Unidade: p.unidade_nome,
      Endereço: `${p.logradouro}, ${p.numero} - ${p.bairro}`,
      Cidade: `${p.cidade} - ${p.uf}`,
      CEP: p.cep
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pacientes");
    XLSX.writeFile(wb, `pacientes_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  function formatDate(dateString: string) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

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
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
      
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
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Exportar Excel
              </button>
              
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
              {/* Tamanho da página */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {PAGE_SIZES.map(size => (
                  <option key={size} value={size}>{size} por página</option>
                ))}
              </select>

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
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Conteúdo */}
        {!loading && (
          <>
            {viewMode === 'cards' ? (
              /* Visualização em Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedPacientes.map((paciente) => (
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
                      <button
                        onClick={() => openModal(paciente, 'view')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Eye size={16} />
                        Ver Mais
                      </button>
                      
                      <button
                        onClick={() => openModal(paciente, 'edit')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => openModal(paciente, 'documents')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <FileText size={16} />
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
                      {paginatedPacientes.map((paciente) => (
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => openModal(paciente, 'view')}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Visualizar"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => openModal(paciente, 'edit')}
                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openModal(paciente, 'documents')}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Documentos"
                              >
                                <FileText size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)} 
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Anterior
                </button>
                
                <span className="text-gray-600 dark:text-gray-400">
                  Página {page} de {totalPages}
                </span>
                
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(page + 1)} 
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Próxima
                </button>
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

        {/* Modal */}
        {showModal && selectedPaciente && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(selectedPaciente.nome)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {selectedPaciente.nome}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {calculateAge(selectedPaciente.data_nascimento)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {modalMode === 'view' && (
                    <>
                      <button
                        onClick={() => setModalMode('edit')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => setModalMode('documents')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <FileText size={16} />
                        Documentos
                      </button>
                    </>
                  )}

                  {modalMode === 'edit' && (
                    <>
                      <button
                        onClick={handleSavePaciente}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Salvar
                      </button>
                      <button
                        onClick={() => setModalMode('view')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                {modalMode === 'documents' ? (
                  <div className="p-6">
                    <DocumentosPacienteManager 
                      pacienteId={selectedPaciente.id}
                      pacienteNome={selectedPaciente.nome}
                    />
                  </div>
                ) : (
                  <div className="p-6">
                    {modalMode === 'view' ? (
                      /* Visualização */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg mb-4">Dados Pessoais</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nome Completo</label>
                            <p className="text-gray-800 dark:text-gray-200">{selectedPaciente.nome}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">CPF</label>
                              <p className="text-gray-800 dark:text-gray-200">{selectedPaciente.cpf || 'Não informado'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data de Nascimento</label>
                              <p className="text-gray-800 dark:text-gray-200">{formatDate(selectedPaciente.data_nascimento)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Sexo</label>
                              <p className="text-gray-800 dark:text-gray-200">
                                {selectedPaciente.sexo === 'M' ? 'Masculino' : selectedPaciente.sexo === 'F' ? 'Feminino' : 'Não informado'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Telefone</label>
                              <p className="text-gray-800 dark:text-gray-200">{selectedPaciente.telefone || 'Não informado'}</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                            <p className="text-gray-800 dark:text-gray-200">{selectedPaciente.email || 'Não informado'}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg mb-4">Endereço e Convênio</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Endereço</label>
                            <p className="text-gray-800 dark:text-gray-200">
                              {selectedPaciente.logradouro ? 
                                `${selectedPaciente.logradouro}, ${selectedPaciente.numero} - ${selectedPaciente.bairro}` :
                                'Endereço não informado'
                              }
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Cidade</label>
                              <p className="text-gray-800 dark:text-gray-200">{selectedPaciente.cidade || 'Não informado'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">CEP</label>
                              <p className="text-gray-800 dark:text-gray-200">{selectedPaciente.cep || 'Não informado'}</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Convênio</label>
                            <p className="text-gray-800 dark:text-gray-200">{selectedPaciente.convenio_nome || 'Particular'}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Unidade</label>
                            <p className="text-gray-800 dark:text-gray-200">{selectedPaciente.unidade_nome || 'Não definida'}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Cadastrado em</label>
                            <p className="text-gray-800 dark:text-gray-200">{formatDate(selectedPaciente.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Edição */
                      <div className="space-y-6">
                        {/* Abas de Navegação */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <nav className="flex space-x-8">
                            <button
                              onClick={() => setActiveTab('pessoais')}
                              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'pessoais'
                                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                              }`}
                            >
                              Dados Pessoais
                            </button>
                            <button
                              onClick={() => setActiveTab('endereco')}
                              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'endereco'
                                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                              }`}
                            >
                              Endereço
                            </button>
                            <button
                              onClick={() => setActiveTab('convenio')}
                              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'convenio'
                                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                              }`}
                            >
                              Convênio & Unidade
                            </button>
                          </nav>
                        </div>

                        {/* Conteúdo das Abas */}
                        <div className="py-4">
                          {activeTab === 'pessoais' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Nome Completo *</label>
                                <input
                                  type="text"
                                  value={editingPaciente?.nome || ''}
                                  onChange={(e) => handleInputChange('nome', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                  placeholder="Nome completo do paciente"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">CPF</label>
                                <input
                                  type="text"
                                  value={editingPaciente?.cpf || ''}
                                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                  placeholder="000.000.000-00"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Data de Nascimento</label>
                                <input
                                  type="date"
                                  value={editingPaciente?.data_nascimento || ''}
                                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Sexo</label>
                                <select
                                  value={editingPaciente?.sexo || ''}
                                  onChange={(e) => handleInputChange('sexo', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Selecione o sexo</option>
                                  <option value="M">Masculino</option>
                                  <option value="F">Feminino</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Telefone</label>
                                <input
                                  type="text"
                                  value={editingPaciente?.telefone || ''}
                                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                  placeholder="(11) 99999-9999"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</label>
                                <input
                                  type="email"
                                  value={editingPaciente?.email || ''}
                                  onChange={(e) => handleInputChange('email', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                  placeholder="email@exemplo.com"
                                />
                              </div>
                            </div>
                          )}

                          {activeTab === 'endereco' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2">
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Logradouro</label>
                                    <input
                                      type="text"
                                      value={editingPaciente?.logradouro || ''}
                                      onChange={(e) => handleInputChange('logradouro', e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                      placeholder="Rua, Avenida, etc."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Número</label>
                                    <input
                                      type="text"
                                      value={editingPaciente?.numero || ''}
                                      onChange={(e) => handleInputChange('numero', e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                      placeholder="Nº"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bairro</label>
                                <input
                                  type="text"
                                  value={editingPaciente?.bairro || ''}
                                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                  placeholder="Bairro"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">CEP</label>
                                <input
                                  type="text"
                                  value={editingPaciente?.cep || ''}
                                  onChange={(e) => handleInputChange('cep', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                  placeholder="00000-000"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Cidade</label>
                                <input
                                  type="text"
                                  value={editingPaciente?.cidade || ''}
                                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                  placeholder="Cidade"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Estado (UF)</label>
                                <select
                                  value={editingPaciente?.uf || ''}
                                  onChange={(e) => handleInputChange('uf', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Selecione o estado</option>
                                  <option value="AC">Acre</option>
                                  <option value="AL">Alagoas</option>
                                  <option value="AP">Amapá</option>
                                  <option value="AM">Amazonas</option>
                                  <option value="BA">Bahia</option>
                                  <option value="CE">Ceará</option>
                                  <option value="DF">Distrito Federal</option>
                                  <option value="ES">Espírito Santo</option>
                                  <option value="GO">Goiás</option>
                                  <option value="MA">Maranhão</option>
                                  <option value="MT">Mato Grosso</option>
                                  <option value="MS">Mato Grosso do Sul</option>
                                  <option value="MG">Minas Gerais</option>
                                  <option value="PA">Pará</option>
                                  <option value="PB">Paraíba</option>
                                  <option value="PR">Paraná</option>
                                  <option value="PE">Pernambuco</option>
                                  <option value="PI">Piauí</option>
                                  <option value="RJ">Rio de Janeiro</option>
                                  <option value="RN">Rio Grande do Norte</option>
                                  <option value="RS">Rio Grande do Sul</option>
                                  <option value="RO">Rondônia</option>
                                  <option value="RR">Roraima</option>
                                  <option value="SC">Santa Catarina</option>
                                  <option value="SP">São Paulo</option>
                                  <option value="SE">Sergipe</option>
                                  <option value="TO">Tocantins</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {activeTab === 'convenio' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Convênio</label>
                                <select
                                  value={editingPaciente?.convenio_id || ''}
                                  onChange={(e) => {
                                    const convenioId = e.target.value;
                                    const convenio = convenios.find(c => c.id === convenioId);
                                    handleInputChange('convenio_id', convenioId);
                                    handleInputChange('convenio_nome', convenio?.nome || '');
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Particular</option>
                                  {convenios.map(convenio => (
                                    <option key={convenio.id} value={convenio.id}>
                                      {convenio.nome}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Número da Carteirinha</label>
                                <input
                                  type="text"
                                  value={editingPaciente?.carteirinha || ''}
                                  onChange={(e) => handleInputChange('carteirinha', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                  placeholder="Número da carteirinha do convênio"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Unidade Preferencial</label>
                                <select
                                  value={editingPaciente?.unidade_id || ''}
                                  onChange={(e) => {
                                    const unidadeId = e.target.value;
                                    const unidade = unidades.find(u => u.id === unidadeId);
                                    handleInputChange('unidade_id', unidadeId);
                                    handleInputChange('unidade_nome', unidade?.nome || '');
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Selecione uma unidade</option>
                                  {unidades.map(unidade => (
                                    <option key={unidade.id} value={unidade.id}>
                                      {unidade.nome}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Observações</label>
                                <textarea
                                  value={editingPaciente?.observacoes || ''}
                                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                                  rows={3}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none"
                                  placeholder="Observações gerais sobre o paciente..."
                                />
                              </div>

                              <div className="md:col-span-2">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Informações do Convênio</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-blue-600 dark:text-blue-400 font-medium">Convênio Selecionado:</span>
                                      <p className="text-blue-700 dark:text-blue-300">
                                        {editingPaciente?.convenio_id 
                                          ? convenios.find(c => c.id === editingPaciente.convenio_id)?.nome || 'Carregando...'
                                          : 'Particular'
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-blue-600 dark:text-blue-400 font-medium">Unidade Selecionada:</span>
                                      <p className="text-blue-700 dark:text-blue-300">
                                        {editingPaciente?.unidade_id 
                                          ? unidades.find(u => u.id === editingPaciente.unidade_id)?.nome || 'Carregando...'
                                          : 'Nenhuma'
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-blue-600 dark:text-blue-400 font-medium">Carteirinha:</span>
                                      <p className="text-blue-700 dark:text-blue-300">
                                        {editingPaciente?.carteirinha || 'Não informada'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Navegação entre abas */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              if (activeTab === 'endereco') setActiveTab('pessoais');
                              else if (activeTab === 'convenio') setActiveTab('endereco');
                            }}
                            disabled={activeTab === 'pessoais'}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            ← Anterior
                          </button>

                          <div className="flex gap-2">
                            <div className={`w-2 h-2 rounded-full transition-colors ${activeTab === 'pessoais' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            <div className={`w-2 h-2 rounded-full transition-colors ${activeTab === 'endereco' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            <div className={`w-2 h-2 rounded-full transition-colors ${activeTab === 'convenio' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          </div>

                          <button
                            onClick={() => {
                              if (activeTab === 'pessoais') setActiveTab('endereco');
                              else if (activeTab === 'endereco') setActiveTab('convenio');
                            }}
                            disabled={activeTab === 'convenio'}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Próximo →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notificação de Sucesso */}
        {showSuccessNotification && (
          <div className="fixed top-4 right-4 z-[60] transform transition-all duration-500 ease-out animate-in slide-in-from-right-full">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] border border-green-400/20 backdrop-blur-sm relative overflow-hidden">
              {/* Barra de progresso */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-300/30">
                <div 
                  className="h-full bg-white/70 transition-all ease-linear"
                  style={{
                    width: '100%',
                    animation: 'shrink 4s linear forwards'
                  }}
                />
              </div>
              
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-100 animate-bounce" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-1">
                  ✨ Sucesso!
                </h4>
                <p className="text-green-100 text-sm">Alterações realizadas com sucesso</p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="flex-shrink-0 text-green-200 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                title="Fechar notificação"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
