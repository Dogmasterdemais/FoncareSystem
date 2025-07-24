"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { differenceInYears, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, User, FileText, MapPin, CreditCard, Briefcase, UserCheck, Building, Upload, Eye, Search, ChevronDown } from 'lucide-react';
import { buscarEnderecoPorCEP, converterEnderecoViaCEP, formatarCEP, validarCEP } from '../lib/viacep';

const stepConfig = [
  { title: 'Dados Básicos', icon: User, color: 'blue' },
  { title: 'Documentos', icon: FileText, color: 'indigo' },
  { title: 'Endereço', icon: MapPin, color: 'purple' },
  { title: 'Convênio', icon: CreditCard, color: 'pink' },
  { title: 'Dados Adicionais', icon: Briefcase, color: 'green' },
  { title: 'Responsável', icon: UserCheck, color: 'orange' },
  { title: 'Unidade', icon: Building, color: 'teal' },
  { title: 'Documentos', icon: Upload, color: 'cyan' },
  { title: 'Revisão', icon: Eye, color: 'gray' },
];

const initialState = {
  sexo: '',
  data_nascimento: '',
  email: '',
  telefone: '',
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
  ativo: true,
  responsavel_nome: '',
  responsavel_telefone: '',
  responsavel_parentesco: '',
  responsavel_cpf: '',
  unidade_id: '',
  documentos: [],
};

export default function PacienteCadastroStepper() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [enderecoEncontrado, setEnderecoEncontrado] = useState(false);
  const [convenios, setConvenios] = useState<any[]>([]);
  const [carregandoConvenios, setCarregandoConvenios] = useState(false);

  // Calcula idade
  const idade = form.data_nascimento ? differenceInYears(new Date(), parseISO(form.data_nascimento)) : null;
  const isMenor = idade !== null && idade < 18;

  // Carregar convênios ao montar o componente
  useEffect(() => {
    carregarConvenios();
  }, []);

  async function carregarConvenios() {
    setCarregandoConvenios(true);
    try {
      const { data, error } = await supabase
        .from('convenios')
        .select('id, nome, tipo, codigo')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao carregar convênios:', error);
      } else {
        setConvenios(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar convênios:', error);
    } finally {
      setCarregandoConvenios(false);
    }
  }

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    
    // Formatar CEP automaticamente
    if (name === 'cep') {
      const cepFormatado = formatarCEP(value);
      setForm((prev: any) => ({ ...prev, [name]: cepFormatado }));
      
      // Buscar endereço quando CEP estiver completo
      if (validarCEP(cepFormatado)) {
        buscarEndereco(cepFormatado);
      }
    } else {
      setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  }

  async function buscarEndereco(cep: string) {
    setBuscandoCEP(true);
    setEnderecoEncontrado(false);
    try {
      const endereco = await buscarEnderecoPorCEP(cep);
      if (endereco) {
        const dadosEndereco = converterEnderecoViaCEP(endereco);
        setForm((prev: any) => ({ 
          ...prev, 
          ...dadosEndereco
        }));
        setEnderecoEncontrado(true);
        
        // Remover a mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setEnderecoEncontrado(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    } finally {
      setBuscandoCEP(false);
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Preparar dados para inserção - compatível com schema do banco
      const { documentos, ...dados } = form;
      
      // Mapear campos para o schema correto
      const dadosParaInserir = {
        nome: dados.nome,
        email: dados.email || null,
        telefone: dados.telefone || null,
        data_nascimento: dados.data_nascimento || null,
        documento: dados.cpf || dados.rg || null, // usar CPF como documento principal
        // Campos adicionais que podem ser salvos como JSON ou em campos específicos
        sexo: dados.sexo || null,
        cpf: dados.cpf || null,
        rg: dados.rg || null,
        cep: dados.cep || null,
        logradouro: dados.logradouro || null,
        numero: dados.numero || null,
        complemento: dados.complemento || null,
        bairro: dados.bairro || null,
        cidade: dados.cidade || null,
        uf: dados.uf || null,
        convenio_id: dados.convenio_id || null,
        numero_carteirinha: dados.numero_carteirinha || null,
        validade_carteira: dados.validade_carteira || null,
        profissao: dados.profissao || null,
        estado_civil: dados.estado_civil || null,
        observacoes: dados.observacoes || null,
        ativo: dados.ativo !== undefined ? dados.ativo : true,
        responsavel_nome: dados.responsavel_nome || null,
        responsavel_telefone: dados.responsavel_telefone || null,
        responsavel_parentesco: dados.responsavel_parentesco || null,
        responsavel_cpf: dados.responsavel_cpf || null,
        unidade_id: dados.unidade_id || null
      };
      
      console.log('Dados para inserir:', dadosParaInserir);
      
      const { data, error } = await supabase
        .from('pacientes')
        .insert([dadosParaInserir])
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Paciente inserido com sucesso:', data);
      setSuccess(true);
      setStep(0);
      setForm(initialState);
      
      // Exibir mensagem de sucesso
      alert('Paciente cadastrado com sucesso!');
      
    } catch (err: any) {
      console.error('Erro ao inserir paciente:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-amber-50 dark:from-zinc-900 dark:via-slate-900 dark:to-cyan-950 min-h-screen">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          {stepConfig.map((stepInfo, index) => {
            const isActive = index === step;
            const isCompleted = index < step;
            const IconComponent = stepInfo.icon;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 
                  ${isActive ? 'bg-cyan-100 text-zinc-700 shadow scale-105' : isCompleted ? 'bg-cyan-200 text-zinc-600' : 'bg-slate-200 text-gray-400'}
                `}>
                  {isCompleted ? <Check size={20} /> : <IconComponent size={20} />}
                </div>
                <span className={`mt-2 text-xs font-medium ${isActive ? 'text-cyan-700' : 'text-gray-500'}`}>
                  {stepInfo.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-100 via-amber-100 to-slate-100 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / stepConfig.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl p-10 animate-fade-in">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-cyan-700 dark:text-cyan-200 mb-2">
            {stepConfig[step]?.title}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Passo {step + 1} de {stepConfig.length}
          </p>
        </div>
        {/* Step Content */}
        <div className="space-y-6">
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
              <div>
                <label className="block text-sm font-semibold text-cyan-700 dark:text-cyan-200 mb-2">Nome Completo *</label>
                <input 
                  name="nome" 
                  value={form.nome} 
                  onChange={handleChange} 
                  required 
                  placeholder="Digite o nome completo" 
                  className="w-full px-4 py-3 rounded-xl border border-cyan-100 dark:border-cyan-900 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-cyan-200 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cyan-700 dark:text-cyan-200 mb-2">Sexo *</label>
                <select 
                  name="sexo" 
                  value={form.sexo} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-cyan-100 dark:border-cyan-900 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-cyan-200 focus:border-transparent transition-all"
                >
                  <option value="">Selecione o sexo</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Data de Nascimento *</label>
                <input 
                  name="data_nascimento" 
                  type="date" 
                  value={form.data_nascimento} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
                {idade !== null && (
                  <p className="mt-1 text-sm text-gray-500">Idade: {idade} anos {isMenor && '(menor de idade)'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  placeholder="exemplo@email.com" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
                <input 
                  name="telefone" 
                  value={form.telefone} 
                  onChange={handleChange} 
                  placeholder="(11) 99999-9999" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">CPF *</label>
                <input 
                  name="cpf" 
                  value={form.cpf} 
                  onChange={handleChange} 
                  required 
                  placeholder="000.000.000-00" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">RG</label>
                <input 
                  name="rg" 
                  value={form.rg} 
                  onChange={handleChange} 
                  placeholder="00.000.000-0" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  CEP *
                  {buscandoCEP && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                      🔍 Buscando endereço...
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input 
                    name="cep" 
                    value={form.cep} 
                    onChange={handleChange} 
                    placeholder="00000-000" 
                    maxLength={9}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                  />
                  {buscandoCEP && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Search className="h-5 w-5 text-blue-500 animate-pulse" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Digite o CEP para buscar automaticamente o endereço
                </p>
                {enderecoEncontrado && (
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Endereço encontrado e preenchido automaticamente!
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Logradouro
                  <span className="ml-2 text-xs text-gray-500">
                    (preenchido automaticamente)
                  </span>
                </label>
                <input 
                  name="logradouro" 
                  value={form.logradouro} 
                  onChange={handleChange} 
                  placeholder="Rua, Avenida, etc." 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Número</label>
                <input 
                  name="numero" 
                  value={form.numero} 
                  onChange={handleChange} 
                  placeholder="123" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Complemento</label>
                <input 
                  name="complemento" 
                  value={form.complemento} 
                  onChange={handleChange} 
                  placeholder="Apto, Casa, etc." 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Bairro
                  <span className="ml-2 text-xs text-gray-500">
                    (preenchido automaticamente)
                  </span>
                </label>
                <input 
                  name="bairro" 
                  value={form.bairro} 
                  onChange={handleChange} 
                  placeholder="Nome do bairro" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cidade
                  <span className="ml-2 text-xs text-gray-500">
                    (preenchido automaticamente)
                  </span>
                </label>
                <input 
                  name="cidade" 
                  value={form.cidade} 
                  onChange={handleChange} 
                  placeholder="Nome da cidade" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  UF
                  <span className="ml-2 text-xs text-gray-500">
                    (preenchido automaticamente)
                  </span>
                </label>
                <input 
                  name="uf" 
                  value={form.uf} 
                  onChange={handleChange} 
                  placeholder="SP" 
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Convênio *
                  {carregandoConvenios && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                      Carregando...
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select 
                    name="convenio_id" 
                    value={form.convenio_id} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    disabled={carregandoConvenios}
                  >
                    <option value="">Selecione um convênio</option>
                    {convenios.map((convenio) => (
                      <option key={convenio.id} value={convenio.id}>
                        {convenio.nome} {convenio.tipo && `(${convenio.tipo})`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecione o convênio do paciente
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Número da Carteirinha</label>
                <input 
                  name="numero_carteirinha" 
                  value={form.numero_carteirinha} 
                  onChange={handleChange} 
                  placeholder="Digite o número da carteirinha" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Validade da Carteira</label>
                <input 
                  name="validade_carteira" 
                  type="date" 
                  value={form.validade_carteira} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Profissão</label>
                <input 
                  name="profissao" 
                  value={form.profissao} 
                  onChange={handleChange} 
                  placeholder="Digite a profissão" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado Civil</label>
                <input 
                  name="estado_civil" 
                  value={form.estado_civil} 
                  onChange={handleChange} 
                  placeholder="Solteiro, Casado, etc." 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Observações</label>
                <textarea 
                  name="observacoes" 
                  value={form.observacoes} 
                  onChange={handleChange} 
                  placeholder="Observações adicionais sobre o paciente" 
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  <input 
                    name="ativo" 
                    type="checkbox" 
                    checked={form.ativo} 
                    onChange={handleChange} 
                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Paciente Ativo</span>
                </label>
              </div>
            </div>
          )}

          {step === 5 && isMenor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
              <div className="md:col-span-2 mb-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-amber-800 dark:text-amber-400 font-medium">
                    ⚠️ Paciente menor de idade - dados do responsável obrigatórios
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome do Responsável *</label>
                <input 
                  name="responsavel_nome" 
                  value={form.responsavel_nome} 
                  onChange={handleChange} 
                  required={isMenor} 
                  placeholder="Nome completo do responsável" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Telefone do Responsável *</label>
                <input 
                  name="responsavel_telefone" 
                  value={form.responsavel_telefone} 
                  onChange={handleChange} 
                  required={isMenor} 
                  placeholder="(11) 99999-9999" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Parentesco *</label>
                <input 
                  name="responsavel_parentesco" 
                  value={form.responsavel_parentesco} 
                  onChange={handleChange} 
                  required={isMenor} 
                  placeholder="Pai, Mãe, Tutor, etc." 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">CPF do Responsável *</label>
                <input 
                  name="responsavel_cpf" 
                  value={form.responsavel_cpf} 
                  onChange={handleChange} 
                  required={isMenor} 
                  placeholder="000.000.000-00" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="grid grid-cols-1 gap-6 animate-slide-in">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ID da Unidade</label>
                <input 
                  name="unidade_id" 
                  value={form.unidade_id} 
                  onChange={handleChange} 
                  placeholder="Digite o ID da unidade de atendimento" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="grid grid-cols-1 gap-6 animate-slide-in">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload de Documentos</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Selecione os documentos do paciente</p>
                <input 
                  type="file" 
                  multiple 
                  disabled 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50" 
                />
                <p className="text-xs text-gray-400 mt-2">(Funcionalidade será implementada em breve)</p>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6 animate-slide-in">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-4">📋 Revisão dos Dados</h3>
                <p className="text-blue-700 dark:text-blue-300">Revise todas as informações antes de confirmar o cadastro.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(form, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            type="button" 
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
              ${step === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <ChevronLeft size={20} /> Voltar
          </button>

          <div className="flex items-center gap-4">
            {step < 8 && (
              <button 
                type="button" 
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Avançar <ChevronRight size={20} />
              </button>
            )}
            
            {step === 8 && (
              <button 
                type="submit" 
                disabled={loading}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  } text-white
                `}
              >
                {loading ? 'Salvando...' : 'Confirmar e Cadastrar'} <Check size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 animate-fade-in">
            Erro: {error}
          </div>
        )}
        
        {success && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 animate-fade-in">
            Paciente cadastrado com sucesso!
          </div>
        )}
      </form>
    </div>
  );
}
