import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  data_nascimento?: string;
  sexo?: string;
  telefone?: string;
  email?: string;
  convenio_id?: string;
  convenio_nome?: string;
  numero_carteirinha?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  responsavel_parentesco?: string;
  profissao?: string;
  estado_civil?: string;
  observacoes?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
  responsavel_cpf?: string;
  unidade_id?: string;
  unidade_nome?: string;
  validade_carteira?: string;
}


interface PacienteModalProps {
  paciente: Paciente;
  onSave: (paciente: Paciente, file?: File) => void;
}


export const PacienteModal: React.FC<PacienteModalProps> = ({ paciente, onSave }) => {
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState<Paciente>(paciente);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const [tab, setTab] = useState('dados');
  const [convenios, setConvenios] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    async function fetchConvenios() {
      const { data, error } = await supabase.from("convenios").select("id, nome");
      if (!error && data) setConvenios(data);
    }
    fetchConvenios();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  async function handleSave() {
    // Atualiza paciente no banco
    // Remove campos que não existem na tabela pacientes
    const { convenio_nome, unidade_nome, ...toSave } = form;
    // Remove campos que não existem na tabela pacientes
    const updateFields = {
      nome: toSave.nome,
      cpf: toSave.cpf,
      rg: toSave.rg,
      data_nascimento: toSave.data_nascimento,
      sexo: toSave.sexo,
      telefone: toSave.telefone,
      email: toSave.email,
      convenio_id: toSave.convenio_id || null,
      numero_carteirinha: toSave.numero_carteirinha,
      validade_carteira: toSave.validade_carteira,
      cep: toSave.cep,
      logradouro: toSave.logradouro,
      numero: toSave.numero,
      complemento: toSave.complemento,
      bairro: toSave.bairro,
      cidade: toSave.cidade,
      uf: toSave.uf,
      responsavel_nome: toSave.responsavel_nome,
      responsavel_telefone: toSave.responsavel_telefone,
      responsavel_parentesco: toSave.responsavel_parentesco,
      profissao: toSave.profissao,
      estado_civil: toSave.estado_civil,
      observacoes: toSave.observacoes,
      ativo: toSave.ativo,
      responsavel_cpf: toSave.responsavel_cpf,
      unidade_id: toSave.unidade_id || null
    };
    console.log('Atualizando paciente:', paciente.id, updateFields);
    const { data, error } = await supabase
      .from("pacientes")
      .update(updateFields)
      .eq("id", paciente.id)
      .select();
    if (!error && data && data.length > 0) {
      setSuccessMsg("Suas alterações foram salvas.");
      setEditMode(false);
      setTimeout(() => setSuccessMsg(null), 3000);
      setForm(data[0]);
      onSave(data[0], file);
    } else {
      alert("Erro ao salvar: " + (error?.message || "Erro desconhecido"));
      console.error('Erro ao salvar paciente:', error, updateFields);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 relative group w-full border border-white/20"
          title="Visualizar/Editar Paciente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-sm font-medium">Visualizar</span>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
        </button>
      </DialogTrigger>
      <DialogContent
        aria-describedby="paciente-modal-desc"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg"
        style={{ padding: 0 }}
      >
        <VisuallyHidden>
          <DialogTitle>
            {paciente?.id ? `Editar dados do paciente ${paciente.nome}` : 'Cadastrar novo paciente'}
          </DialogTitle>
        </VisuallyHidden>
        <div id="paciente-modal-desc" className="sr-only">
          Modal de edição e visualização dos dados do paciente.
        </div>
        <div className="w-full max-w-7xl min-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-800/50 flex flex-col overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
          {successMsg && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 font-semibold animate-fade-in border border-green-400/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {successMsg}
              </div>
            </div>
          )}
          {/* Cabeçalho moderno */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-blue-100 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <span className="relative z-10">{paciente.nome?.charAt(0) || "P"}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg"></div>
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-2xl text-slate-800 dark:text-slate-100 mb-1 tracking-tight">{paciente.nome}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    ID: {paciente.id}
                  </span>
                  {paciente.ativo === false && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
                      Inativo
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setEditMode(!editMode)} 
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-amber-400/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {editMode ? "Visualizar" : "Editar"}
              </button>
              <DialogClose asChild>
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-600 hover:bg-slate-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-500/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Fechar
                </button>
              </DialogClose>
            </div>
          </div>
          {/* Tabs modernas */}
          <div className="flex flex-wrap gap-2 px-8 pt-6 pb-2 border-b border-blue-100 dark:border-blue-800/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-800/50 sticky top-[104px] z-10 backdrop-blur-sm">
            {[
              { id: 'dados', label: 'Dados Pessoais', icon: '👤' },
              { id: 'contato', label: 'Contato', icon: '📞' },
              { id: 'endereco', label: 'Endereço', icon: '🏠' },
              { id: 'convenio', label: 'Convênio', icon: '🏥' },
              { id: 'unidade', label: 'Unidade', icon: '🏢' },
              { id: 'responsavel', label: 'Responsável', icon: '👨‍👩‍👧‍👦' },
              { id: 'observacoes', label: 'Observações', icon: '📝' },
              { id: 'documentos', label: 'Documentos', icon: '📄' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`group relative flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-200 text-sm border ${
                  tab === t.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-blue-500/30 scale-105' 
                    : 'bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500'
                }`}
              >
                <span className="text-base">{t.icon}</span>
                <span className="font-medium">{t.label}</span>
                {tab === t.id && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10"></div>
                )}
              </button>
            ))}
          </div>
          {/* Conteúdo das tabs */}
          <div className="flex-1 overflow-y-auto px-8 py-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
            {editMode ? (
              <form className="space-y-8 animate-fade-in" autoComplete="off">
                {tab === 'dados' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        👤
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dados Pessoais</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações básicas do paciente</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <Input name="nome" value={form.nome} onChange={handleChange} label="Nome Completo" autoFocus />
                      </div>
                      <Input name="cpf" value={form.cpf} onChange={handleChange} label="CPF" />
                      <Input name="rg" value={form.rg || ""} onChange={handleChange} label="RG" />
                      <Input name="data_nascimento" value={form.data_nascimento || ""} onChange={handleChange} label="Data de Nascimento" type="date" />
                      <Input name="sexo" value={form.sexo || ""} onChange={handleChange} label="Sexo" />
                      <Input name="profissao" value={form.profissao || ""} onChange={handleChange} label="Profissão" />
                      <Input name="estado_civil" value={form.estado_civil || ""} onChange={handleChange} label="Estado Civil" />
                    </div>
                  </div>
                )}
                {tab === 'contato' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        📞
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Contato</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações para contato</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input name="telefone" value={form.telefone || ""} onChange={handleChange} label="Telefone" />
                      <Input name="email" value={form.email || ""} onChange={handleChange} label="Email" type="email" />
                    </div>
                  </div>
                )}
                {tab === 'endereco' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        🏠
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Endereço</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Endereço residencial</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <Input name="cep" value={form.cep || ""} onChange={handleChange} label="CEP" />
                      <div className="md:col-span-2">
                        <Input name="logradouro" value={form.logradouro || ""} onChange={handleChange} label="Logradouro" />
                      </div>
                      <Input name="numero" value={form.numero || ""} onChange={handleChange} label="Número" />
                      <Input name="complemento" value={form.complemento || ""} onChange={handleChange} label="Complemento" />
                      <Input name="bairro" value={form.bairro || ""} onChange={handleChange} label="Bairro" />
                      <Input name="cidade" value={form.cidade || ""} onChange={handleChange} label="Cidade" />
                      <Input name="uf" value={form.uf || ""} onChange={handleChange} label="UF" />
                    </div>
                  </div>
                )}
                {tab === 'convenio' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        🏥
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Convênio</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações do plano de saúde</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300" htmlFor="convenio_id">
                          Convênio
                        </label>
                        <select
                          id="convenio_id"
                          name="convenio_id"
                          value={form.convenio_id || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500"
                        >
                          <option value="">Selecione o convênio</option>
                          {convenios.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                          ))}
                        </select>
                      </div>
                      <Input name="numero_carteirinha" value={form.numero_carteirinha || ""} onChange={handleChange} label="Número da Carteirinha" />
                      <Input name="validade_carteira" value={form.validade_carteira || ""} onChange={handleChange} label="Validade da Carteira" type="date" />
                    </div>
                  </div>
                )}
                {tab === 'unidade' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        🏢
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Unidade</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Unidade de atendimento</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input name="unidade_nome" value={form.unidade_nome || ""} onChange={handleChange} label="Nome da Unidade" />
                    </div>
                  </div>
                )}
                {tab === 'responsavel' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        👨‍👩‍👧‍👦
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Responsável</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações do responsável</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input name="responsavel_nome" value={form.responsavel_nome || ""} onChange={handleChange} label="Nome do Responsável" />
                      <Input name="responsavel_parentesco" value={form.responsavel_parentesco || ""} onChange={handleChange} label="Parentesco" />
                      <Input name="responsavel_telefone" value={form.responsavel_telefone || ""} onChange={handleChange} label="Telefone do Responsável" />
                      <Input name="responsavel_cpf" value={form.responsavel_cpf || ""} onChange={handleChange} label="CPF do Responsável" />
                    </div>
                  </div>
                )}
                {tab === 'observacoes' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        📝
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Observações</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Notas e observações importantes</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        Observações
                      </label>
                      <textarea
                        name="observacoes"
                        value={form.observacoes || ""}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500 resize-none"
                        placeholder="Digite suas observações aqui..."
                      />
                    </div>
                  </div>
                )}
                {tab === 'documentos' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        📄
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Documentos</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Upload de documentação</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          accept="image/*,.pdf,.doc,.docx"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center gap-3"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">Clique para enviar documentos</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Suporte: PNG, JPG, PDF, DOC</p>
                          </div>
                        </label>
                      </div>
                      {preview && (
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Preview do Documento</h4>
                          <img src={preview} alt="Preview" className="max-h-48 w-full object-contain rounded-xl shadow-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-t border-blue-100 dark:border-blue-800/50 px-8 py-6 flex justify-end gap-4 rounded-b-3xl">
                  <button 
                    type="button" 
                    onClick={() => setEditMode(false)} 
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-all duration-200 border border-slate-200 dark:border-slate-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSave} 
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-green-500/30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {tab === 'dados' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        👤
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dados Pessoais</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações básicas do paciente</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">CPF</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.cpf || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">RG</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.rg || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data de Nascimento</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.data_nascimento || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sexo</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.sexo || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profissão</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.profissao || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado Civil</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.estado_civil || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {tab === 'contato' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        📞
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Contato</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações para contato</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telefone</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.telefone || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.email || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {tab === 'endereco' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        🏠
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Endereço</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Endereço residencial</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">CEP</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.cep || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4 md:col-span-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logradouro</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.logradouro || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Número</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.numero || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Complemento</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.complemento || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bairro</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.bairro || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cidade</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.cidade || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">UF</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.uf || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {tab === 'convenio' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        🏥
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Convênio</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações do plano de saúde</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Convênio</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.convenio_nome || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Carteirinha</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.numero_carteirinha || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Validade</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.validade_carteira || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {tab === 'unidade' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        🏢
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Unidade</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Unidade de atendimento</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unidade</span>
                      <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.unidade_nome || "-"}</p>
                    </div>
                  </div>
                )}
                {tab === 'responsavel' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        👨‍👩‍👧‍👦
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Responsável</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Informações do responsável</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nome</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.responsavel_nome || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Parentesco</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.responsavel_parentesco || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telefone</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.responsavel_telefone || "-"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">CPF</span>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold mt-1">{paciente.responsavel_cpf || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {tab === 'observacoes' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        📝
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Observações</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Notas e observações importantes</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6">
                      <p className="text-slate-800 dark:text-slate-100 leading-relaxed">{paciente.observacoes || "Nenhuma observação registrada."}</p>
                    </div>
                  </div>
                )}
                {tab === 'documentos' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        📄
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Documentos</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Documentos anexados</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">Nenhum documento anexado</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
