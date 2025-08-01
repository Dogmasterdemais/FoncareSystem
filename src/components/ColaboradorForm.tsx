'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Users, FileText } from 'lucide-react';
import { rhService, Colaborador, Dependente, Unidade } from '../lib/rhService';
import DocumentosManager from './DocumentosManager';

interface ColaboradorFormProps {
  colaboradorId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const ColaboradorForm: React.FC<ColaboradorFormProps> = ({ colaboradorId, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'pessoal' | 'documentos' | 'profissional' | 'dependentes'>('pessoal');
  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  
  const [formData, setFormData] = useState<Partial<Colaborador>>({
    nome_completo: '',
    data_nascimento: '',
    cpf: '',
    rg: '',
    nome_mae: '',
    telefone_celular: '',
    unidade_id: '',
    cargo: '',
    data_admissao: '',
    status: 'ativo',
    regime_contratacao: 'clt'
  });

  useEffect(() => {
    carregarUnidades();
    if (colaboradorId) {
      carregarColaborador();
      carregarDependentes();
    }
  }, [colaboradorId]);

  const carregarUnidades = async () => {
    try {
      const unidadesData = await rhService.unidadeService.listar();
      setUnidades(unidadesData);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
    }
  };

  const carregarColaborador = async () => {
    if (!colaboradorId) return;
    
    try {
      setLoading(true);
      const colaborador = await rhService.colaboradorService.buscarPorId(colaboradorId);
      
      if (colaborador) {
        // Filtrar apenas os campos válidos para evitar campos antigos
        const colaboradorFiltrado: Partial<Colaborador> = {
          nome_completo: colaborador.nome_completo,
          data_nascimento: colaborador.data_nascimento,
          cpf: colaborador.cpf,
          rg: colaborador.rg,
          nome_mae: colaborador.nome_mae,
          genero: colaborador.genero,
          estado_civil: colaborador.estado_civil,
          nacionalidade: colaborador.nacionalidade,
          naturalidade_cidade: colaborador.naturalidade_cidade,
          naturalidade_estado: colaborador.naturalidade_estado,
          nome_pai: colaborador.nome_pai,
          rg_orgao_emissor: colaborador.rg_orgao_emissor,
          rg_uf: colaborador.rg_uf,
          titulo_eleitor: colaborador.titulo_eleitor,
          titulo_zona: colaborador.titulo_zona,
          titulo_secao: colaborador.titulo_secao,
          cnh: colaborador.cnh,
          cnh_categoria: colaborador.cnh_categoria,
          cnh_vencimento: colaborador.cnh_vencimento,
          email_pessoal: colaborador.email_pessoal,
          telefone_celular: colaborador.telefone_celular,
          telefone_fixo: colaborador.telefone_fixo,
          endereco_logradouro: colaborador.endereco_logradouro,
          endereco_numero: colaborador.endereco_numero,
          endereco_complemento: colaborador.endereco_complemento,
          endereco_bairro: colaborador.endereco_bairro,
          endereco_cidade: colaborador.endereco_cidade,
          endereco_estado: colaborador.endereco_estado,
          endereco_cep: colaborador.endereco_cep,
          banco_codigo: colaborador.banco_codigo,
          banco_nome: colaborador.banco_nome,
          banco_agencia: colaborador.banco_agencia,
          banco_conta: colaborador.banco_conta,
          banco_tipo_conta: colaborador.banco_tipo_conta,
          banco_cpf_titular: colaborador.banco_cpf_titular,
          cargo: colaborador.cargo,
          departamento: colaborador.departamento,
          unidade_id: colaborador.unidade_id,
          regime_contratacao: colaborador.regime_contratacao,
          data_admissao: colaborador.data_admissao,
          data_demissao: colaborador.data_demissao,
          salario_valor: colaborador.salario_valor,
          vale_transporte: colaborador.vale_transporte,
          vale_alimentacao: colaborador.vale_alimentacao,
          vale_alimentacao_valor: colaborador.vale_alimentacao_valor,
          plano_saude: colaborador.plano_saude,
          plano_dental: colaborador.plano_dental,
          status: colaborador.status
        };
        
        console.log('Colaborador carregado e filtrado:', colaboradorFiltrado);
        setFormData(colaboradorFiltrado);
      }
    } catch (error) {
      console.error('Erro ao carregar colaborador:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarDependentes = async () => {
    if (!colaboradorId) return;
    
    try {
      const dependentesData = await rhService.dependenteService.listarPorColaborador(colaboradorId);
      setDependentes(dependentesData);
    } catch (error) {
      console.error('Erro ao carregar dependentes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      console.log('Dados sendo enviados:', formData);
      console.log('Campos do formData:', Object.keys(formData));
      
      if (colaboradorId) {
        await rhService.colaboradorService.atualizar(colaboradorId, formData);
      } else {
        await rhService.colaboradorService.criar(formData as Omit<Colaborador, 'id'>);
      }
      
      onSave();
    } catch (error: any) {
      const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error) || 'Erro desconhecido';
      console.error('Erro ao salvar colaborador:', errorMessage);
      console.error('Erro completo:', error);
      alert(`Erro ao salvar colaborador: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {colaboradorId ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navegação das Abas */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('pessoal')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'pessoal'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Dados Pessoais
              </button>
              
              <button
                onClick={() => setActiveTab('documentos')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'documentos'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Documentos
              </button>
              
              <button
                onClick={() => setActiveTab('profissional')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'profissional'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Briefcase className="w-4 h-4 inline mr-2" />
                Dados Profissionais
              </button>
              
              {colaboradorId && (
                <button
                  onClick={() => setActiveTab('dependentes')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'dependentes'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Dependentes ({dependentes.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="p-6">
            
            {/* Tab Dados Pessoais */}
            {activeTab === 'pessoal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.nome_completo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.cpf || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      RG *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.rg || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.data_nascimento || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome da Mãe *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.nome_mae || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome_mae: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.email_pessoal || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email_pessoal: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gênero
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.genero || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, genero: e.target.value as "masculino" | "feminino" | "outro" }))}
                    >
                      <option value="">Selecione...</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado Civil
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.estado_civil || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, estado_civil: e.target.value as "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel" }))}
                    >
                      <option value="">Selecione...</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viuvo">Viúvo(a)</option>
                      <option value="uniao_estavel">União Estável</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nacionalidade
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.nacionalidade || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nacionalidade: e.target.value }))}
                      placeholder="Ex: Brasileira"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Naturalidade - Cidade
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.naturalidade_cidade || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, naturalidade_cidade: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Naturalidade - Estado
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.naturalidade_estado || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, naturalidade_estado: e.target.value }))}
                      placeholder="Ex: SP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Pai
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.nome_pai || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome_pai: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      RG - Órgão Emissor
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.rg_orgao_emissor || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, rg_orgao_emissor: e.target.value }))}
                      placeholder="Ex: SSP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      RG - UF
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.rg_uf || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, rg_uf: e.target.value }))}
                      placeholder="Ex: SP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título de Eleitor
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.titulo_eleitor || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo_eleitor: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título - Zona
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.titulo_zona || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo_zona: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título - Seção
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.titulo_secao || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo_secao: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CNH
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.cnh || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cnh: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CNH - Categoria
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.cnh_categoria || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cnh_categoria: e.target.value }))}
                    >
                      <option value="">Selecione...</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="AB">AB</option>
                      <option value="AC">AC</option>
                      <option value="AD">AD</option>
                      <option value="AE">AE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CNH - Vencimento
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.cnh_vencimento || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cnh_vencimento: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Celular *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.telefone_celular || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone_celular: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone Fixo
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.telefone_fixo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone_fixo: e.target.value }))}
                      placeholder="(11) 3333-3333"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logradouro
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.endereco_logradouro || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco_logradouro: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.endereco_numero || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco_numero: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CEP
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.endereco_cep || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco_cep: e.target.value }))}
                        placeholder="00000-000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Complemento
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.endereco_complemento || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco_complemento: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bairro
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.endereco_bairro || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco_bairro: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.endereco_cidade || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco_cidade: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.endereco_estado || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco_estado: e.target.value }))}
                        maxLength={2}
                        placeholder="SP"
                      />
                    </div>
                  </div>

                  {/* Seção Dados Bancários */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                      Dados Bancários
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Código do Banco
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={formData.banco_codigo || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, banco_codigo: e.target.value }))}
                          placeholder="Ex: 001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nome do Banco
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={formData.banco_nome || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, banco_nome: e.target.value }))}
                          placeholder="Ex: Banco do Brasil"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Agência
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={formData.banco_agencia || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, banco_agencia: e.target.value }))}
                          placeholder="Ex: 1234-5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Conta
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={formData.banco_conta || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, banco_conta: e.target.value }))}
                          placeholder="Ex: 12345-6"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tipo de Conta
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={formData.banco_tipo_conta || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, banco_tipo_conta: e.target.value as "corrente" | "poupanca" }))}
                        >
                          <option value="">Selecione...</option>
                          <option value="corrente">Conta Corrente</option>
                          <option value="poupanca">Conta Poupança</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CPF do Titular
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={formData.banco_cpf_titular || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, banco_cpf_titular: e.target.value }))}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Documentos */}
            {activeTab === 'documentos' && (
              <div className="space-y-6">
                {/* Tipo de Colaborador */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Regime de Contratação *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.regime_contratacao || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, regime_contratacao: e.target.value as any }))}
                    required
                  >
                    <option value="">Selecione o regime</option>
                    <option value="clt">CLT</option>
                    <option value="pj">PJ (Pessoa Jurídica)</option>
                    <option value="autonomo">Autônomo</option>
                    <option value="estagiario">Estagiário</option>
                    <option value="terceirizado">Terceirizado</option>
                    <option value="cooperado">Cooperado</option>
                  </select>
                </div>

                {/* Documentos Básicos CLT */}
                {formData.regime_contratacao === 'clt' && (
                  <div className="border border-blue-200 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                      Dados CLT Básicos
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Os dados específicos de CLT (CTPS, PIS/NIS/NIT, etc.) serão gerenciados na aba de documentos após salvar o colaborador.
                    </div>
                  </div>
                )}

                {/* Documentos Básicos PJ */}
                {formData.regime_contratacao === 'pj' && (
                  <div className="border border-green-200 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
                    <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                      Dados PJ Básicos
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Os dados específicos de PJ (CNPJ, Razão Social, etc.) serão gerenciados na aba de documentos após salvar o colaborador.
                    </div>
                  </div>
                )}

                {/* Integração do Gerenciador de Documentos */}
                {colaboradorId && formData.regime_contratacao && formData.nome_completo && (
                  <DocumentosManager
                    colaboradorId={colaboradorId}
                    nomeColaborador={formData.nome_completo}
                    tipoColaborador={formData.regime_contratacao as 'clt' | 'pj'}
                    unidadeNome={unidades.find(u => u.id === formData.unidade_id)?.nome || 'Unidade'}
                    onDocumentosChange={() => {
                      console.log('Documentos atualizados');
                    }}
                  />
                )}

                {/* Aviso para novos colaboradores */}
                {!colaboradorId && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-800 dark:text-yellow-200">
                        O gerenciamento de documentos estará disponível após salvar o colaborador.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Dados Profissionais */}
            {activeTab === 'profissional' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unidade *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.unidade_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, unidade_id: e.target.value }))}
                      required
                    >
                      <option value="">Selecione a unidade</option>
                      {unidades.map(unidade => (
                        <option key={unidade.id} value={unidade.id}>
                          {unidade.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cargo *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.cargo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Admissão *
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.data_admissao || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_admissao: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.status || 'ativo'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="licenca">Em Licença</option>
                      <option value="ferias">Em Férias</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Regime de Contratação
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.regime_contratacao || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, regime_contratacao: e.target.value as any }))}
                    >
                      <option value="">Selecione...</option>
                      <option value="clt">CLT</option>
                      <option value="pj">Pessoa Jurídica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.departamento || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salário
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.salario_valor || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, salario_valor: parseFloat(e.target.value) || undefined }))}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jornada - Horário Início
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.jornada_horario_inicio || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, jornada_horario_inicio: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jornada - Horário Fim
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.jornada_horario_fim || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, jornada_horario_fim: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Carga Horária Semanal
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.jornada_carga_semanal || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, jornada_carga_semanal: parseInt(e.target.value) || undefined }))}
                      placeholder="40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comissão - Tipo
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.comissao_tipo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, comissao_tipo: e.target.value }))}
                      placeholder="Ex: Por venda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comissão - Percentual (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.comissao_percentual || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, comissao_percentual: parseFloat(e.target.value) || undefined }))}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {/* Seção Benefícios */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                    Benefícios
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="vale_transporte"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.vale_transporte || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, vale_transporte: e.target.checked }))}
                      />
                      <label htmlFor="vale_transporte" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vale Transporte
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="vale_alimentacao"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.vale_alimentacao || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, vale_alimentacao: e.target.checked }))}
                      />
                      <label htmlFor="vale_alimentacao" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vale Alimentação
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Valor Vale Alimentação
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.vale_alimentacao_valor || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, vale_alimentacao_valor: parseFloat(e.target.value) || undefined }))}
                        placeholder="0,00"
                        disabled={!formData.vale_alimentacao}
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="plano_saude"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.plano_saude || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, plano_saude: e.target.checked }))}
                      />
                      <label htmlFor="plano_saude" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Plano de Saúde
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="plano_dental"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.plano_dental || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, plano_dental: e.target.checked }))}
                      />
                      <label htmlFor="plano_dental" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Plano Dental
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Dependentes */}
            {activeTab === 'dependentes' && colaboradorId && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Dependentes ({dependentes.length})
                  </h3>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    onClick={() => {
                      console.log('Adicionar dependente');
                    }}
                  >
                    Adicionar Dependente
                  </button>
                </div>

                <div className="space-y-4">
                  {dependentes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum dependente cadastrado
                    </div>
                  ) : (
                    dependentes.map((dependente) => (
                      <div key={dependente.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {dependente.nome_completo}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {dependente.grau_parentesco} • {dependente.data_nascimento}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                console.log('Editar dependente', dependente.id);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                console.log('Excluir dependente', dependente.id);
                              }}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : colaboradorId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ColaboradorForm;