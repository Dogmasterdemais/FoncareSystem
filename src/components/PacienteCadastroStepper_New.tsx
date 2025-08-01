'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { differenceInYears, parseISO } from 'date-fns';
import { 
  User, FileText, MapPin, CreditCard, Briefcase, 
  UserCheck, Eye, ChevronLeft, ChevronRight, 
  Check, Loader2, Building 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUnidade } from '@/contexts/UnidadeContext';
import { 
  buscarEnderecoPorCEP, 
  converterEnderecoViaCEP, 
  validarCEP, 
  formatarCEP 
} from '@/utils/enderecoUtils';

// Tipos
interface FormData {
  nome: string;
  sexo: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  cpf: string;
  rg: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  convenio_id: string;
  numero_carteirinha: string;
  validade_carteira: string;
  profissao: string;
  estado_civil: string;
  observacoes: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  responsavel_parentesco: string;
  responsavel_cpf: string;
}

interface Step {
  id: string;
  title: string;
  icon: any;
  color: string;
}

// Configuração das etapas
const STEPS: Step[] = [
  { id: 'dados-basicos', title: 'Dados Básicos', icon: User, color: 'blue' },
  { id: 'documentos', title: 'Documentos', icon: FileText, color: 'indigo' },
  { id: 'endereco', title: 'Endereço', icon: MapPin, color: 'purple' },
  { id: 'convenio', title: 'Convênio', icon: CreditCard, color: 'pink' },
  { id: 'dados-adicionais', title: 'Dados Adicionais', icon: Briefcase, color: 'green' },
  { id: 'responsavel', title: 'Responsável', icon: UserCheck, color: 'orange' },
  { id: 'revisao', title: 'Revisão', icon: Eye, color: 'gray' },
];

const initialFormData: FormData = {
  nome: '',
  sexo: '',
  data_nascimento: '',
  telefone: '',
  email: '',
  cpf: '',
  rg: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  convenio_id: '',
  numero_carteirinha: '',
  validade_carteira: '',
  profissao: '',
  estado_civil: '',
  observacoes: '',
  responsavel_nome: '',
  responsavel_telefone: '',
  responsavel_parentesco: '',
  responsavel_cpf: '',
};

export default function PacienteCadastroStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [convenios, setConvenios] = useState<any[]>([]);
  
  const { unidadeSelecionada, unidades } = useUnidade();

  // Cálculo da idade
  const idade = useMemo(() => {
    if (!formData.data_nascimento) return null;
    return differenceInYears(new Date(), parseISO(formData.data_nascimento));
  }, [formData.data_nascimento]);

  const isMenor = idade !== null && idade < 18;

  // Carregar convênios
  useEffect(() => {
    carregarConvenios();
  }, []);

  async function carregarConvenios() {
    try {
      const { data, error } = await supabase
        .from('convenios')
        .select('id, nome, tipo, codigo')
        .eq('ativo', true)
        .order('nome');

      if (!error && data) {
        setConvenios(data);
      }
    } catch (error) {
      console.error('Erro ao carregar convênios:', error);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro quando usuário começar a digitar
    if (error) setError(null);

    // Buscar CEP automaticamente
    if (name === 'cep' && value.length === 9) {
      buscarCEP(value);
    }
  }

  async function buscarCEP(cep: string) {
    if (!validarCEP(cep)) return;

    setBuscandoCEP(true);
    try {
      const endereco = await buscarEnderecoPorCEP(cep);
      if (endereco) {
        const enderecoConvertido = converterEnderecoViaCEP(endereco);
        setFormData(prev => ({
          ...prev,
          ...enderecoConvertido
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setBuscandoCEP(false);
    }
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const dadosParaSalvar = {
        ...formData,
        unidade_id: unidadeSelecionada,
        ativo: true,
        // Campos opcionais como null se vazios
        email: formData.email || null,
        rg: formData.rg || null,
        complemento: formData.complemento || null,
        convenio_id: formData.convenio_id || null,
        numero_carteirinha: formData.numero_carteirinha || null,
        validade_carteira: formData.validade_carteira || null,
        profissao: formData.profissao || null,
        estado_civil: formData.estado_civil || null,
        observacoes: formData.observacoes || null,
        responsavel_nome: formData.responsavel_nome || null,
        responsavel_telefone: formData.responsavel_telefone || null,
        responsavel_parentesco: formData.responsavel_parentesco || null,
        responsavel_cpf: formData.responsavel_cpf || null
      };

      const { data, error } = await supabase
        .from('pacientes')
        .insert([dadosParaSalvar])
        .select();

      if (error) throw error;

      setSuccess(true);
      setFormData(initialFormData);
      setCurrentStep(0);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      setError(error.message || 'Erro ao salvar paciente');
    } finally {
      setSaving(false);
    }
  }

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Paciente cadastrado com sucesso!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            O cadastro foi realizado e o paciente foi vinculado à unidade selecionada.
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Cadastrar novo paciente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Aviso de unidade */}
      {!unidadeSelecionada && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-amber-800 dark:text-amber-400 font-semibold">
                ⚠️ Nenhuma unidade selecionada
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                Por favor, selecione uma unidade antes de cadastrar um paciente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const IconComponent = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 
                  ${isActive ? 'bg-blue-500 text-white shadow-lg scale-110' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}
                `}>
                  {isCompleted ? <Check size={16} /> : <IconComponent size={16} />}
                </div>
                <span className={`mt-2 text-xs font-medium text-center ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Etapa {currentStep + 1} de {STEPS.length}
          </p>
        </div>

        {/* Conteúdo das etapas */}
        <div className="mb-8">
          {currentStep === 0 && (
            <DadosBasicos 
              formData={formData} 
              onChange={handleInputChange} 
              idade={idade}
              isMenor={isMenor}
            />
          )}
          {currentStep === 1 && (
            <Documentos 
              formData={formData} 
              onChange={handleInputChange} 
            />
          )}
          {currentStep === 2 && (
            <Endereco 
              formData={formData} 
              onChange={handleInputChange}
              buscandoCEP={buscandoCEP}
            />
          )}
          {currentStep === 3 && (
            <Convenio 
              formData={formData} 
              onChange={handleInputChange}
              convenios={convenios}
            />
          )}
          {currentStep === 4 && (
            <DadosAdicionais 
              formData={formData} 
              onChange={handleInputChange}
            />
          )}
          {currentStep === 5 && (
            <Responsavel 
              formData={formData} 
              onChange={handleInputChange}
              isMenor={isMenor}
            />
          )}
          {currentStep === 6 && (
            <Revisao 
              formData={formData}
              idade={idade}
              isMenor={isMenor}
              convenios={convenios}
            />
          )}
        </div>

        {/* Botões de navegação */}
        <div className="flex justify-between items-center">
          <button 
            type="button" 
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
              ${currentStep === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <ChevronLeft size={20} /> Anterior
          </button>

          <div className="flex items-center gap-4">
            {currentStep < STEPS.length - 1 ? (
              <button 
                type="button" 
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Próximo <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={saving || !unidadeSelecionada}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl
                  ${saving || !unidadeSelecionada
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  } text-white
                `}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Finalizar Cadastro
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mensagens de erro */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            Erro: {error}
          </div>
        )}
      </form>
    </div>
  );
}

// Componentes das etapas
function DadosBasicos({ formData, onChange, idade, isMenor }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Nome Completo *
        </label>
        <input
          name="nome"
          value={formData.nome}
          onChange={onChange}
          required
          placeholder="Digite o nome completo"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Sexo *
        </label>
        <select
          name="sexo"
          value={formData.sexo}
          onChange={onChange}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Selecione</option>
          <option value="F">Feminino</option>
          <option value="M">Masculino</option>
          <option value="O">Outro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Data de Nascimento *
        </label>
        <input
          name="data_nascimento"
          type="date"
          value={formData.data_nascimento}
          onChange={onChange}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {idade !== null && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Idade: {idade} anos {isMenor && '(menor de idade)'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Telefone *
        </label>
        <input
          name="telefone"
          value={formData.telefone}
          onChange={onChange}
          required
          placeholder="(11) 99999-9999"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="exemplo@email.com"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}

function Documentos({ formData, onChange }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          CPF *
        </label>
        <input
          name="cpf"
          value={formData.cpf}
          onChange={onChange}
          required
          placeholder="000.000.000-00"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          RG
        </label>
        <input
          name="rg"
          value={formData.rg}
          onChange={onChange}
          placeholder="00.000.000-0"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}

function Endereco({ formData, onChange, buscandoCEP }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          CEP *
        </label>
        <div className="relative">
          <input
            name="cep"
            value={formData.cep}
            onChange={onChange}
            required
            placeholder="00000-000"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {buscandoCEP && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Logradouro *
        </label>
        <input
          name="logradouro"
          value={formData.logradouro}
          onChange={onChange}
          required
          placeholder="Rua, Avenida..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Número *
        </label>
        <input
          name="numero"
          value={formData.numero}
          onChange={onChange}
          required
          placeholder="123"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Complemento
        </label>
        <input
          name="complemento"
          value={formData.complemento}
          onChange={onChange}
          placeholder="Apt, Casa..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Bairro *
        </label>
        <input
          name="bairro"
          value={formData.bairro}
          onChange={onChange}
          required
          placeholder="Nome do bairro"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Cidade *
        </label>
        <input
          name="cidade"
          value={formData.cidade}
          onChange={onChange}
          required
          placeholder="Nome da cidade"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          UF *
        </label>
        <select
          name="uf"
          value={formData.uf}
          onChange={onChange}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Selecione</option>
          <option value="SP">São Paulo</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="MG">Minas Gerais</option>
          <option value="RS">Rio Grande do Sul</option>
          <option value="PR">Paraná</option>
          <option value="SC">Santa Catarina</option>
          <option value="GO">Goiás</option>
          <option value="MS">Mato Grosso do Sul</option>
          <option value="MT">Mato Grosso</option>
          <option value="DF">Distrito Federal</option>
          <option value="TO">Tocantins</option>
          <option value="PA">Pará</option>
          <option value="AP">Amapá</option>
          <option value="AM">Amazonas</option>
          <option value="RR">Roraima</option>
          <option value="AC">Acre</option>
          <option value="RO">Rondônia</option>
          <option value="BA">Bahia</option>
          <option value="SE">Sergipe</option>
          <option value="AL">Alagoas</option>
          <option value="PE">Pernambuco</option>
          <option value="PB">Paraíba</option>
          <option value="RN">Rio Grande do Norte</option>
          <option value="CE">Ceará</option>
          <option value="PI">Piauí</option>
          <option value="MA">Maranhão</option>
          <option value="ES">Espírito Santo</option>
        </select>
      </div>
    </div>
  );
}

function Convenio({ formData, onChange, convenios }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Convênio
        </label>
        <select
          name="convenio_id"
          value={formData.convenio_id}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Particular (sem convênio)</option>
          {convenios.map((convenio: any) => (
            <option key={convenio.id} value={convenio.id}>
              {convenio.nome}
            </option>
          ))}
        </select>
      </div>

      {formData.convenio_id && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Número da Carteirinha
            </label>
            <input
              name="numero_carteirinha"
              value={formData.numero_carteirinha}
              onChange={onChange}
              placeholder="Número da carteirinha"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Validade da Carteira
            </label>
            <input
              name="validade_carteira"
              type="date"
              value={formData.validade_carteira}
              onChange={onChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </>
      )}
    </div>
  );
}

function DadosAdicionais({ formData, onChange }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Profissão
        </label>
        <input
          name="profissao"
          value={formData.profissao}
          onChange={onChange}
          placeholder="Sua profissão"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Estado Civil
        </label>
        <select
          name="estado_civil"
          value={formData.estado_civil}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Selecione</option>
          <option value="solteiro">Solteiro(a)</option>
          <option value="casado">Casado(a)</option>
          <option value="divorciado">Divorciado(a)</option>
          <option value="viuvo">Viúvo(a)</option>
          <option value="uniao_estavel">União Estável</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Observações
        </label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={onChange}
          rows={4}
          placeholder="Informações adicionais..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      </div>
    </div>
  );
}

function Responsavel({ formData, onChange, isMenor }: any) {
  if (!isMenor) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Paciente Maior de Idade
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Não é necessário informar dados do responsável
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Atenção:</strong> Paciente menor de idade. É obrigatório informar os dados do responsável.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Nome do Responsável *
        </label>
        <input
          name="responsavel_nome"
          value={formData.responsavel_nome}
          onChange={onChange}
          required
          placeholder="Nome completo do responsável"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Telefone do Responsável *
        </label>
        <input
          name="responsavel_telefone"
          value={formData.responsavel_telefone}
          onChange={onChange}
          required
          placeholder="(11) 99999-9999"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Parentesco
        </label>
        <select
          name="responsavel_parentesco"
          value={formData.responsavel_parentesco}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Selecione</option>
          <option value="pai">Pai</option>
          <option value="mae">Mãe</option>
          <option value="avo">Avô/Avó</option>
          <option value="tutor">Tutor(a)</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          CPF do Responsável
        </label>
        <input
          name="responsavel_cpf"
          value={formData.responsavel_cpf}
          onChange={onChange}
          placeholder="000.000.000-00"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}

function Revisao({ formData, idade, isMenor, convenios }: any) {
  const convenioSelecionado = convenios.find((c: any) => c.id === formData.convenio_id);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Revisar Informações
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Confira todos os dados antes de finalizar o cadastro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dados Pessoais */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados Pessoais
          </h4>
          <div className="space-y-3 text-sm">
            <div><strong>Nome:</strong> {formData.nome}</div>
            <div><strong>Sexo:</strong> {formData.sexo === 'M' ? 'Masculino' : formData.sexo === 'F' ? 'Feminino' : 'Outro'}</div>
            <div><strong>Data de Nascimento:</strong> {formData.data_nascimento} ({idade} anos)</div>
            <div><strong>Telefone:</strong> {formData.telefone}</div>
            {formData.email && <div><strong>Email:</strong> {formData.email}</div>}
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos
          </h4>
          <div className="space-y-3 text-sm">
            <div><strong>CPF:</strong> {formData.cpf}</div>
            {formData.rg && <div><strong>RG:</strong> {formData.rg}</div>}
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </h4>
          <div className="space-y-3 text-sm">
            <div><strong>CEP:</strong> {formData.cep}</div>
            <div><strong>Endereço:</strong> {formData.logradouro}, {formData.numero}</div>
            {formData.complemento && <div><strong>Complemento:</strong> {formData.complemento}</div>}
            <div><strong>Bairro:</strong> {formData.bairro}</div>
            <div><strong>Cidade:</strong> {formData.cidade} - {formData.uf}</div>
          </div>
        </div>

        {/* Convênio */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Convênio
          </h4>
          <div className="space-y-3 text-sm">
            {convenioSelecionado ? (
              <>
                <div><strong>Convênio:</strong> {convenioSelecionado.nome}</div>
                {formData.numero_carteirinha && <div><strong>Carteirinha:</strong> {formData.numero_carteirinha}</div>}
                {formData.validade_carteira && <div><strong>Validade:</strong> {formData.validade_carteira}</div>}
              </>
            ) : (
              <div className="text-gray-500">Particular (sem convênio)</div>
            )}
          </div>
        </div>

        {/* Responsável (se menor) */}
        {isMenor && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 md:col-span-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Responsável
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Nome:</strong> {formData.responsavel_nome}</div>
              <div><strong>Telefone:</strong> {formData.responsavel_telefone}</div>
              {formData.responsavel_parentesco && <div><strong>Parentesco:</strong> {formData.responsavel_parentesco}</div>}
              {formData.responsavel_cpf && <div><strong>CPF:</strong> {formData.responsavel_cpf}</div>}
            </div>
          </div>
        )}

        {/* Dados Adicionais */}
        {(formData.profissao || formData.estado_civil || formData.observacoes) && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 md:col-span-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Informações Adicionais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {formData.profissao && <div><strong>Profissão:</strong> {formData.profissao}</div>}
              {formData.estado_civil && <div><strong>Estado Civil:</strong> {formData.estado_civil}</div>}
              {formData.observacoes && (
                <div className="md:col-span-2">
                  <strong>Observações:</strong> {formData.observacoes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
