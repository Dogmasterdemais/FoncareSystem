"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MainLayout from "../../components/MainLayout";
import { useUnidade } from "../../context/UnidadeContext";
import { 
  User, Search, Grid3X3, List, Download, Plus, 
  Eye, Edit, FileText, Phone, 
  CreditCard, Building, X, Save, Loader2, MapPin, UserCheck
} from "lucide-react";
import * as XLSX from "xlsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZES = [12, 24, 48];

interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  sexo: string | null;
  telefone: string | null;
  email: string | null;
  convenio_id: string | null;
  convenio_nome: string | null;
  unidade_id: string;
  unidade_nome: string;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  created_at: string;
  updated_at?: string;
}

interface Convenio {
  id: string;
  nome: string;
  ativo: boolean;
}

interface Unidade {
  id: string;
  nome: string;
  ativo: boolean;
}

// Componente separado para o modal de edição com abas
function EditModal({ 
  paciente, 
  onClose, 
  onSave,
  convenios,
  unidades,
  saving
}: {
  paciente: Paciente;
  onClose: () => void;
  onSave: (data: Paciente) => void;
  convenios: Convenio[];
  unidades: Unidade[];
  saving: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'pessoais'|'endereco'|'convenio'>('pessoais');
  const [editData, setEditData] = useState<Paciente>({ ...paciente });

  function handleInputChange(field: string, value: any) {
    setEditData(prev => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave(editData);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {paciente.nome?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Editar: {paciente.nome}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {paciente.data_nascimento ? new Date().getFullYear() - new Date(paciente.data_nascimento).getFullYear() + ' anos' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="px-6 pt-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('pessoais')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pessoais'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <User size={16} />
              Dados Pessoais
            </button>
            
            <button
              onClick={() => setActiveTab('endereco')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'endereco'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <MapPin size={16} />
              Endereço
            </button>
            
            <button
              onClick={() => setActiveTab('convenio')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'convenio'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <UserCheck size={16} />
              Convênio & Unidade
            </button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Aba Dados Pessoais */}
          {activeTab === 'pessoais' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.nome || ''}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: João Silva Santos"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">CPF</label>
                  <input
                    type="text"
                    value={editData.cpf || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                      handleInputChange('cpf', value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    value={editData.data_nascimento || ''}
                    onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Sexo</label>
                  <select
                    value={editData.sexo || ''}
                    onChange={(e) => handleInputChange('sexo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={editData.telefone || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        value = value.replace(/(\d{2})(\d)/, '($1) $2');
                        value = value.replace(/(\d{4})(\d)/, '$1-$2');
                      } else {
                        value = value.replace(/(\d{2})(\d)/, '($1) $2');
                        value = value.replace(/(\d{5})(\d)/, '$1-$2');
                      }
                      handleInputChange('telefone', value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>
          )}

          {/* Aba Endereço */}
          {activeTab === 'endereco' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Logradouro</label>
                  <input
                    type="text"
                    value={editData.logradouro || ''}
                    onChange={(e) => handleInputChange('logradouro', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Rua das Flores"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Número</label>
                  <input
                    type="text"
                    value={editData.numero || ''}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bairro</label>
                <input
                  type="text"
                  value={editData.bairro || ''}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Centro"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={editData.cidade || ''}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">UF</label>
                  <select
                    value={editData.uf || ''}
                    onChange={(e) => handleInputChange('uf', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">UF</option>
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    {/* Outros estados... */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">CEP</label>
                  <input
                    type="text"
                    value={editData.cep || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      value = value.replace(/(\d{5})(\d)/, '$1-$2');
                      handleInputChange('cep', value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Convênio & Unidade */}
          {activeTab === 'convenio' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Unidade <span className="text-red-500">*</span>
                </label>
                <select
                  value={editData.unidade_id || ''}
                  onChange={(e) => {
                    const unidadeId = e.target.value;
                    const unidade = unidades.find(u => u.id === unidadeId);
                    handleInputChange('unidade_id', unidadeId);
                    handleInputChange('unidade_nome', unidade?.nome || '');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  required
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
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Convênio</label>
                <select
                  value={editData.convenio_id || ''}
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

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Resumo das Informações</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {editData.nome || 'Não informado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CPF:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {editData.cpf || 'Não informado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Telefone:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {editData.telefone || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  const [saving, setSaving] = useState(false);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [unidadesDisponiveis, setUnidadesDisponiveis] = useState<Unidade[]>([]);
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
        .select('id, nome, ativo')
        .eq('ativo', true)
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
        .select('id, nome, ativo')
        .eq('ativo', true)
        .order('nome');
      
      if (error) {
        console.error("Erro ao buscar unidades:", error);
      } else {
        setUnidadesDisponiveis(data || []);
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

  function openEditModal(paciente: Paciente) {
    setSelectedPaciente(paciente);
    setModalMode('edit');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedPaciente(null);
    setModalMode('view');
  }

  async function handleSavePaciente(editedData: Paciente) {
    setSaving(true);
    try {
      const updateData = {
        nome: editedData.nome.trim(),
        cpf: editedData.cpf || null,
        data_nascimento: editedData.data_nascimento || null,
        sexo: editedData.sexo || null,
        telefone: editedData.telefone || null,
        email: editedData.email || null,
        convenio_id: editedData.convenio_id || null,
        unidade_id: editedData.unidade_id,
        logradouro: editedData.logradouro || null,
        numero: editedData.numero || null,
        bairro: editedData.bairro || null,
        cidade: editedData.cidade || null,
        uf: editedData.uf || null,
        cep: editedData.cep || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('pacientes')
        .update(updateData)
        .eq('id', editedData.id);
      
      if (error) throw error;
      
      alert('Paciente atualizado com sucesso!');
      closeModal();
      await fetchPacientes();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar paciente: " + (error as any)?.message || "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  }

  function calculateAge(birthDate: string | null) {
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
                Gerenciar Pacientes (Com Abas Funcionais)
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? 's' : ''} encontrado{filteredPacientes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Cards de Pacientes */}
        {!loading && (
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
                </div>

                {/* Ações */}
                <div className="px-6 pb-6 flex gap-2">
                  <button
                    onClick={() => openEditModal(paciente)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Edição com Abas */}
        {showModal && selectedPaciente && modalMode === 'edit' && (
          <EditModal
            paciente={selectedPaciente}
            onClose={closeModal}
            onSave={handleSavePaciente}
            convenios={convenios}
            unidades={unidadesDisponiveis}
            saving={saving}
          />
        )}

        {/* Estado vazio */}
        {!loading && filteredPacientes.length === 0 && (
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
      </div>
    </MainLayout>
  );
}
