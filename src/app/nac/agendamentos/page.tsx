"use client";
import { useEffect, useState, Fragment } from "react";
import MainLayout from "../../../components/MainLayout";
import { Calendar, Plus, Filter, List, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useUnidade } from '../../../context/UnidadeContext';

// Tipos para os dados
interface Paciente {
  id: string;
  nome: string;
  unidade_id: string;
  ativo: boolean;
  convenio_id?: string;
  convenio_nome?: string;
  convenios?: Array<{ nome: string }>;
}

interface UnidadeCompleta {
  id: string;
  nome: string;
}

// Cores das especialidades conforme especificação
const CORES_ESPECIALIDADES = {
  'Fonoaudiologia': '#0052CC',
  'Terapia Ocupacional': '#00E6F6',
  'Psicologia': '#38712F',
  'Psicopedagogia': '#D20000',
  'Neuropsicopedagogia': '#D20000',
  'Educador Físico': '#B45A00',
  'Psicomotricidade': '#F58B00',
  'Musicoterapia': '#F5C344',
  'Ludoterapia': '#F5C344',
  'Arterapia': '#F5C344',
  'Fisioterapia': '#C47B9C',
  'Anamnese': '#808080',
  'Neuropsicologia': '#000000'
};

interface Agendamento {
  id: string;
  paciente_nome: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  especialidade_nome: string;
  sala_nome: string;
  sala_cor: string;
  profissional_nome: string;
  status: string;
  convenio_nome: string;
  numero_agendamento: string;
  observacoes?: string;
  paciente_telefone?: string;
  telefone?: string;
  unidade_nome: string;
}

interface EstatisticasMes {
  agendados: number;
  compareceram: number;
  faltaram: number;
  reagendamentos: number;
}

export default function AgendamentosPage() {
  console.log('📋 AGENDAMENTOS: Componente iniciando...');
  
  const { unidadeSelecionada, unidades } = useUnidade();
  
  console.log('📋 AGENDAMENTOS: useUnidade resultado:', {
    unidadeSelecionada,
    unidades_length: unidades?.length
  });
  
  // Encontrar o objeto completo da unidade selecionada
  const unidadeCompleta = unidades.find(u => u.id === unidadeSelecionada);
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [estatisticas, setEstatisticas] = useState<EstatisticasMes>({
    agendados: 0,
    compareceram: 0,
    faltaram: 0,
    reagendamentos: 0
  });
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [showNewAgendamentoModal, setShowNewAgendamentoModal] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Estados para WhatsApp
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [agendamentoWhatsApp, setAgendamentoWhatsApp] = useState<Agendamento | null>(null);
  const [mensagemWhatsApp, setMensagemWhatsApp] = useState('');

  // Estados para o formulário de novo agendamento
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [salas, setSalas] = useState<any[]>([]);

  // Estados para filtros
  const [filtroMostrando, setFiltroMostrando] = useState(false);
  const [filtroProfissional, setFiltroProfissional] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Estados para busca avançada de pacientes
  const [searchPaciente, setSearchPaciente] = useState('');
  const [pacientesFiltrados, setPacientesFiltrados] = useState<Paciente[]>([]);
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);
  const [showSalaDropdown, setShowSalaDropdown] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  const [formData, setFormData] = useState({
    paciente_id: '',
    sala_id: '',
    data_agendamento: '',
    horario_inicio: '',
    horario_fim: '',
    tipo_sessao: 'individual',
    modalidade: '',
    duracao_minutos: 60,
    total_sessoes: 1,
    gerar_sequencia: false,
    observacoes: ''
  });

  // Função para filtrar agendamentos
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const filtroProfOk = !filtroProfissional || 
      agendamento.profissional_nome?.toLowerCase().includes(filtroProfissional.toLowerCase());
    const filtroEspecOk = !filtroEspecialidade || 
      agendamento.especialidade_nome?.toLowerCase().includes(filtroEspecialidade.toLowerCase());
    const filtroStatusOk = !filtroStatus || agendamento.status === filtroStatus;
    
    return filtroProfOk && filtroEspecOk && filtroStatusOk;
  });

  // Função para obter lista única de profissionais dos agendamentos
  const getProfissionaisUnicos = () => {
    const profissionais = new Set<string>();
    agendamentos.forEach(ag => {
      if (ag.profissional_nome) {
        profissionais.add(ag.profissional_nome);
      }
    });
    return Array.from(profissionais).sort();
  };

  useEffect(() => {
    console.log('🔄 useEffect executado:', {
      selectedDate: selectedDate?.toISOString(),
      unidadeSelecionada,
      unidadeCompleta: unidadeCompleta ? { id: unidadeCompleta.id, nome: unidadeCompleta.nome } : null,
      unidades_length: unidades?.length
    });
    
    testConnection();
    fetchAgendamentos();
    fetchEstatisticas();
    loadFormData();
  }, [selectedDate, unidadeCompleta]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowPacienteDropdown(false);
        setShowSalaDropdown(false);
      }
    };

    if (showPacienteDropdown || showSalaDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPacienteDropdown, showSalaDropdown]);

  // Funções para busca avançada de pacientes
  const filtrarPacientes = (termo: string) => {
    if (!termo.trim() || termo.length < 2) {
      setPacientesFiltrados([]);
      return;
    }

    const termoLower = termo.toLowerCase();
    const filtrados = pacientes.filter(paciente => 
      paciente.nome?.toLowerCase().includes(termoLower) ||
      paciente.id?.toLowerCase().includes(termoLower)
    ).slice(0, 8); // Limitar a 8 resultados para melhor UX

    setPacientesFiltrados(filtrados);
  };

  const selecionarPaciente = (paciente: Paciente) => {
    setPacienteSelecionado(paciente);
    setFormData({...formData, paciente_id: paciente.id});
    setSearchPaciente(paciente.nome || '');
    setShowPacienteDropdown(false);
  };

  const limparSelecaoPaciente = () => {
    setPacienteSelecionado(null);
    setFormData({...formData, paciente_id: ''});
    setSearchPaciente('');
    setPacientesFiltrados([]);
    setShowPacienteDropdown(false);
  };

  const resetarFormulario = () => {
    setFormData({
      paciente_id: '',
      sala_id: '',
      data_agendamento: '',
      horario_inicio: '',
      horario_fim: '',
      tipo_sessao: 'individual',
      modalidade: '',
      duracao_minutos: 60,
      total_sessoes: 1,
      gerar_sequencia: false,
      observacoes: ''
    });
    
    // Limpar estados da busca de pacientes
    setSearchPaciente('');
    setPacienteSelecionado(null);
    setPacientesFiltrados([]);
    setShowPacienteDropdown(false);
  };

  async function loadFormData() {
    if (!unidadeCompleta) {
      console.log('❌ loadFormData: Nenhuma unidade selecionada');
      return;
    }

    console.log('🔄 loadFormData: Carregando dados para unidade:', {
      id: unidadeCompleta.id,
      nome: unidadeCompleta.nome,
      objeto_completo: unidadeCompleta
    });

    try {
      // Carregar pacientes ativos da unidade selecionada
      console.log('📋 Buscando pacientes da unidade:', unidadeCompleta.nome, '(ID:', unidadeCompleta.id, ')');
      
      // Primeiro tentar a view se existir
      let pacientesData = null;
      let pacientesError = null;
      
      try {
        // Tentar primeiro a view vw_pacientes_com_unidade
        const { data: pacientesView, error: viewError } = await supabase
          .from('vw_pacientes_com_unidade')
          .select('*')
          .eq('ativo', true)
          .eq('unidade_id', unidadeCompleta.id)
          .order('nome');
        
        if (viewError) {
          console.log('⚠️ View não existe, tentando tabela direta...');
          throw viewError;
        }
        
        pacientesData = pacientesView;
        console.log('✅ Usando view vw_pacientes_com_unidade');
      } catch (error) {
        // Tentar com JOIN
        try {
          const { data: pacientesJoin, error: joinError } = await supabase
            .from('pacientes')
            .select(`
              *,
              convenios(nome)
            `)
            .eq('ativo', true)
            .eq('unidade_id', unidadeCompleta.id)
            .order('nome');
          
          if (joinError) {
            console.log('⚠️ Erro no JOIN com convenios, tentando query simples:', joinError);
            throw joinError;
          }
          
          pacientesData = pacientesJoin;
          console.log('✅ Usando JOIN com convenios');
        } catch (joinErr) {
          // Fallback: query simples
          const { data: pacientesSimples, error: pacientesErroSimples } = await supabase
            .from('pacientes')
            .select('*')
            .eq('ativo', true)
            .eq('unidade_id', unidadeCompleta.id)
            .order('nome');
          
          // Normalizar estrutura para compatibilidade de tipos
          pacientesData = pacientesSimples?.map(p => ({
            ...p,
            convenio_id: p.convenio_id || '',
            convenio_nome: p.convenio_nome || '',
            convenios: p.convenio_nome ? [{ nome: p.convenio_nome }] : []
          })) || null;
          
          pacientesError = pacientesErroSimples;
          console.log('✅ Usando query simples como fallback');
        }
      }

      console.log('📋 Pacientes encontrados:', pacientesData?.length || 0);
      if (pacientesError) {
        console.error('❌ Erro ao buscar pacientes:', {
          message: pacientesError.message,
          details: pacientesError.details,
          hint: pacientesError.hint,
          code: pacientesError.code
        });
      }

      // Debug adicional: buscar TODOS os pacientes para comparar
      let todosPacientes: Paciente[] | null = null;
      let todosPacientesError = null;
      
      const { data: todosPacientesData, error: todosPacientesErrorData } = await supabase
        .from('pacientes')
        .select(`
          id, 
          nome, 
          unidade_id, 
          ativo, 
          convenio_id,
          convenio_nome,
          convenios(nome)
        `)
        .eq('ativo', true);

      // Se der erro no JOIN, tentar query simples
      if (todosPacientesErrorData) {
        console.log('⚠️ Erro no JOIN para debug, tentando query simples:', todosPacientesErrorData);
        const { data: todosPacientesSimples, error: todosPacientesErroSimples } = await supabase
          .from('pacientes')
          .select('id, nome, unidade_id, ativo, convenio_id, convenio_nome')
          .eq('ativo', true);
        
        // Normalizar estrutura para compatibilidade de tipos
        todosPacientes = todosPacientesSimples?.map(p => ({
          ...p,
          convenio_id: p.convenio_id || '',
          convenio_nome: p.convenio_nome || '',
          convenios: p.convenio_nome ? [{ nome: p.convenio_nome }] : []
        })) || null;
        
        todosPacientesError = todosPacientesErroSimples;
      } else {
        todosPacientes = todosPacientesData as Paciente[] | null;
        todosPacientesError = todosPacientesErrorData;
      }

      console.log('📋 TODOS os pacientes ativos no sistema:', todosPacientes?.length || 0);
      if (todosPacientes && todosPacientes.length > 0) {
        console.log('📋 Distribuição por unidade:');
        const distribuicao: Record<string, number> = todosPacientes.reduce((acc, p) => {
          acc[p.unidade_id] = (acc[p.unidade_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.table(distribuicao);
        console.log('📋 Unidade buscada:', unidadeCompleta.id);
        console.log('📋 Pacientes na unidade buscada:', distribuicao[unidadeCompleta.id] || 0);
        
        // Log de exemplos de pacientes com convênios
        console.log('📋 Exemplos de pacientes (primeiros 3):');
        todosPacientes.slice(0, 3).forEach(p => {
          const convenioNome = p.convenios?.[0]?.nome || p.convenio_nome || 'Particular';
          console.log(`- ${p.nome} | Convênio: ${convenioNome} | Unidade: ${p.unidade_id}`);
        });
      }

      // Carregar salas ativas da unidade selecionada
      console.log('🏢 === DEBUG SALAS ===');
      console.log('🏢 Unidade selecionada:', unidadeCompleta);
      console.log('🏢 ID da unidade:', unidadeCompleta.id);
      console.log('🏢 Nome da unidade:', unidadeCompleta.nome);
      
      // 🔍 DIAGNÓSTICO COMPLETO DA QUERY DE SALAS
      console.log('🔍 === DIAGNÓSTICO COMPLETO ===');
      
      // Teste 1: Verificar se a tabela salas existe e tem dados
      console.log('🔍 Teste 1: Verificando se tabela salas existe...');
      const { data: testExistencia, error: errorExistencia } = await supabase
        .from('salas')
        .select('id, nome, unidade_id')
        .limit(3);
      
      if (errorExistencia) {
        console.error('❌ ERRO: Tabela salas não existe ou não acessível:', {
          message: errorExistencia.message,
          details: errorExistencia.details,
          hint: errorExistencia.hint,
          code: errorExistencia.code
        });
      } else {
        console.log('✅ Tabela salas existe! Total encontrado:', testExistencia?.length || 0);
        if (testExistencia && testExistencia.length > 0) {
          console.log('🔍 Primeiras 3 salas do sistema:');
          testExistencia.forEach(sala => {
            console.log(`   - ${sala.nome} | Unidade: ${sala.unidade_id}`);
          });
        }
      }
      
      // Teste 2: Contar TODAS as salas do sistema
      console.log('🔍 Teste 2: Contando todas as salas...');
      const { count: totalSalas, error: errorCount } = await supabase
        .from('salas')
        .select('*', { count: 'exact', head: true });
      
      console.log('🔍 Total de salas no sistema:', totalSalas);
      
      // Teste 3: Buscar salas com diferentes formatos de UUID
      const unidadeIdTeste = 'a4429bd3-1737-43bc-920e-dae4749e20dd';
      console.log('🔍 Teste 3: Testando query exata com UUID:', unidadeIdTeste);
      
      const { data: testeUuid, error: errorUuid, count: countUuid } = await supabase
        .from('salas')
        .select('*', { count: 'exact' })
        .eq('unidade_id', unidadeIdTeste);
      
      console.log('🔍 Resultado query UUID:', {
        encontradas: testeUuid?.length || 0,
        count: countUuid,
        erro: errorUuid?.message || 'nenhum'
      });
      
      // Teste 4: Buscar todas as unidades_id distintas nas salas
      console.log('🔍 Teste 4: Verificando todas as unidades_id nas salas...');
      const { data: unidadesNasSalas, error: errorUnidades } = await supabase
        .from('salas')
        .select('unidade_id')
        .limit(50);
      
      if (unidadesNasSalas) {
        const unidadesUnicas = [...new Set(unidadesNasSalas.map(s => s.unidade_id))];
        console.log('🔍 Unidades encontradas nas salas:', unidadesUnicas.length);
        console.log('🔍 Lista de unidades_id nas salas:');
        unidadesUnicas.forEach(unidadeId => {
          const isOsasco2 = unidadeId === unidadeIdTeste;
          console.log(`   ${isOsasco2 ? '🎯' : '  '} ${unidadeId} ${isOsasco2 ? '← NOSSA UNIDADE!' : ''}`);
        });
      }
      
      // Teste 5: Comparar com a unidade atual
      console.log('🔍 Teste 5: Comparando IDs...');
      console.log('🔍 Unidade buscada    :', unidadeCompleta.id);
      console.log('🔍 Unidade conhecida  :', unidadeIdTeste);
      console.log('🔍 IDs são iguais     :', unidadeCompleta.id === unidadeIdTeste);
      console.log('🔍 Tipo da unidade atual:', typeof unidadeCompleta.id);
      console.log('🔍 Comprimento ID atual  :', unidadeCompleta.id.length);
      
      // Buscar salas da unidade atual (simples, sem JOIN)
      console.log('🏢 Buscando salas da unidade atual:', unidadeCompleta.id);
      const { data: todasSalasUnidade, error: errorTodasSalasUnidade } = await supabase
        .from('salas')
        .select('id, nome, cor, tipo, ativo, unidade_id')
        .eq('unidade_id', unidadeCompleta.id)
        .order('nome');
      
      console.log('🏢 Total de salas na unidade:', todasSalasUnidade?.length || 0);
      if (errorTodasSalasUnidade) {
        console.error('❌ ERRO na query de salas:', {
          message: errorTodasSalasUnidade.message,
          details: errorTodasSalasUnidade.details,
          hint: errorTodasSalasUnidade.hint,
          code: errorTodasSalasUnidade.code
        });
      }
      
      if (todasSalasUnidade && todasSalasUnidade.length > 0) {
        console.log('🏢 Lista de salas encontradas:');
        todasSalasUnidade.forEach(sala => {
          console.log(`- ${sala.nome} | ID: ${sala.id} | Ativo: ${sala.ativo} (${typeof sala.ativo}) | Tipo: ${sala.tipo}`);
        });
        
        // Filtrar salas ativas (considerando diferentes tipos de boolean)
        const salasAtivas = todasSalasUnidade.filter(sala => {
          const isAtivo = sala.ativo === true || sala.ativo === 'true' || sala.ativo === 1 || sala.ativo === '1';
          console.log(`🔍 ${sala.nome}: ativo=${sala.ativo} (${typeof sala.ativo}) -> incluir: ${isAtivo}`);
          return isAtivo;
        });
        
        console.log('🏢 Salas ATIVAS filtradas:', salasAtivas.length);
        
        if (salasAtivas.length > 0) {
          setSalas(salasAtivas);
        } else {
          console.log('🏢 Nenhuma sala ativa encontrada, usando todas as salas da unidade...');
          setSalas(todasSalasUnidade);
        }
      } else {
        console.log('❌ Nenhuma sala encontrada para a unidade:', unidadeCompleta.id);
        setSalas([]);
      }

      // Carregar profissionais - TEMPORÁRIO: sem filtro de unidade até coluna ser criada
      setPacientes(pacientesData || []);
      // setSalas já foi definido acima com tratamento de erro

      console.log('✅ loadFormData concluído com sucesso');
      
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados do formulário:', error);
    }
  }

  // Função para diagnosticar problemas do banco (apenas para desenvolvimento)
  async function diagnosticarBanco() {
    try {
      console.log('=== DIAGNÓSTICO DO BANCO ===');
      
      // Verificar pacientes da unidade atual
      let pacientesUnidadeAtual = 0;
      if (unidadeCompleta) {
        let pacientesUnidade: Paciente[] | null = null;
        let pacientesError = null;
        
        const { data: pacientesUnidadeData, error: pacientesErrorData } = await supabase
          .from('pacientes')
          .select(`
            id, 
            nome, 
            unidade_id, 
            ativo,
            convenio_nome,
            convenios(nome)
          `)
          .eq('unidade_id', unidadeCompleta.id);

        // Se der erro no JOIN, tentar query simples
        if (pacientesErrorData) {
          console.log('⚠️ Erro no JOIN diagnóstico, tentando query simples:', pacientesErrorData);
          const { data: pacientesSimples, error: pacientesErroSimples } = await supabase
            .from('pacientes')
            .select('id, nome, unidade_id, ativo, convenio_id, convenio_nome')
            .eq('unidade_id', unidadeCompleta.id);

          // Normalizar estrutura para compatibilidade de tipos
          pacientesUnidade = pacientesSimples?.map(p => ({
            ...p,
            convenio_id: p.convenio_id || '',
            convenio_nome: p.convenio_nome || '',
            convenios: p.convenio_nome ? [{ nome: p.convenio_nome }] : []
          })) || null;
          
          pacientesError = pacientesErroSimples;
        } else {
          pacientesUnidade = pacientesUnidadeData as Paciente[] | null;
          pacientesError = pacientesErrorData;
        }
        
        pacientesUnidadeAtual = pacientesUnidade?.length || 0;
        console.log('📋 Pacientes da unidade atual:', pacientesUnidade);
        console.log('❌ Erro ao buscar pacientes:', pacientesError);
      }

      // Contar registros gerais
      const { count: pacientesTotais } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact' });

      const { count: profissionaisTotais } = await supabase
        .from('profissionais')
        .select('*', { count: 'exact' });

      const diagnostico = `
🏥 UNIDADE: ${unidadeCompleta?.nome || 'Nenhuma selecionada'}
📋 Pacientes nesta unidade: ${pacientesUnidadeAtual}
📋 Total de pacientes no sistema: ${pacientesTotais}
👨‍⚕️ Total de profissionais: ${profissionaisTotais}

${pacientesUnidadeAtual === 0 && unidadeCompleta ? '⚠️ PROBLEMA: Nenhum paciente encontrado na unidade selecionada!' : '✅ Pacientes encontrados na unidade'}
      `;

      console.log(diagnostico);
      alert(diagnostico);

    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert('❌ Erro no diagnóstico: ' + errorMessage);
    }
  }

  async function testConnection() {
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Erro de conexão:', error);
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus('error');
    }
  }

  async function fetchAgendamentos() {
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Início da semana
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Fim da semana

      console.log('📅 Buscando agendamentos da semana:', {
        inicio: startDate.toISOString().split('T')[0],
        fim: endDate.toISOString().split('T')[0]
      });

      // Usar a view que funciona diretamente
      const { data, error } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .gte('data_agendamento', startDate.toISOString().split('T')[0])
        .lte('data_agendamento', endDate.toISOString().split('T')[0])
        .order('data_agendamento', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar agendamentos:', error);
        setAgendamentos([]);
      } else {
        console.log('✅ Agendamentos encontrados:', data?.length || 0);
        setAgendamentos(data || []);
      }
    } catch (error) {
      console.error('❌ Erro ao conectar com o banco:', error);
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEstatisticas() {
    try {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('agendamentos')
        .select('status')
        .gte('data_agendamento', startOfMonth.toISOString().split('T')[0])
        .lte('data_agendamento', endOfMonth.toISOString().split('T')[0]);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setEstatisticas({ agendados: 0, compareceram: 0, faltaram: 0, reagendamentos: 0 });
      } else {
        const stats = data?.reduce((acc, item) => {
          switch (item.status) {
            case 'agendado':
            case 'confirmado':
              acc.agendados++;
              break;
            case 'compareceu':
            case 'realizado':
              acc.compareceram++;
              break;
            case 'faltou':
            case 'ausente':
              acc.faltaram++;
              break;
            case 'reagendado':
              acc.reagendamentos++;
              break;
          }
          return acc;
        }, { agendados: 0, compareceram: 0, faltaram: 0, reagendamentos: 0 });

        setEstatisticas(stats || { agendados: 0, compareceram: 0, faltaram: 0, reagendamentos: 0 });
      }
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      setEstatisticas({ agendados: 0, compareceram: 0, faltaram: 0, reagendamentos: 0 });
    }
  }

  const gerarMensagemWhatsApp = (agendamento: Agendamento) => {
    const data = new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horario = formatTime(agendamento.horario_inicio);
    
    return `🏥 *CONFIRMAÇÃO DE CONSULTA - FONCARE*

Olá, ${agendamento.paciente_nome}!

Você tem uma consulta agendada:

📅 *Data:* ${data}
🕐 *Horário:* ${horario}
👨‍⚕️ *Profissional:* ${agendamento.profissional_nome}
🩺 *Especialidade:* ${agendamento.especialidade_nome}
🏢 *Sala:* ${agendamento.sala_nome}
💳 *Convênio:* ${agendamento.convenio_nome || 'Particular'}

Por favor, confirme sua presença respondendo:
✅ SIM - para confirmar
❌ NÃO - para cancelar/reagendar

⚠️ *IMPORTANTE:*
• Chegue 15 minutos antes do horário
• Traga documento com foto e carteirinha do convênio
• Em caso de impedimento, avise com 24h de antecedência

📞 Dúvidas? Entre em contato conosco!

_Mensagem automática - Foncare Sistema_`;
  };

  const abrirModalWhatsApp = (agendamento: Agendamento) => {
    setAgendamentoWhatsApp(agendamento);
    setMensagemWhatsApp(gerarMensagemWhatsApp(agendamento));
    setMostrarModalWhatsApp(true);
  };

  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagemWhatsApp);
      alert('Mensagem copiada para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar mensagem:', error);
      alert('Erro ao copiar mensagem. Selecione e copie manualmente.');
    }
  };

  const abrirWhatsAppWeb = () => {
    if (!agendamentoWhatsApp?.paciente_telefone) {
      alert('Telefone do paciente não cadastrado!');
      return;
    }
    
    const telefone = agendamentoWhatsApp.paciente_telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(mensagemWhatsApp);
    const url = `https://web.whatsapp.com/send?phone=55${telefone}&text=${mensagem}`;
    window.open(url, '_blank');
  };

  const abrirWhatsAppMobile = () => {
    if (!agendamentoWhatsApp?.paciente_telefone) {
      alert('Telefone do paciente não cadastrado!');
      return;
    }
    
    const telefone = agendamentoWhatsApp.paciente_telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(mensagemWhatsApp);
    const url = `https://api.whatsapp.com/send?phone=55${telefone}&text=${mensagem}`;
    window.open(url, '_blank');
  };

  const getWeekDays = () => {
    const start = new Date(selectedDate);
    // Ajustar para segunda-feira (1) como primeiro dia
    const dayOfWeek = start.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + daysToMonday);
    
    const days = [];
    // Apenas segunda a sexta (5 dias)
    for (let i = 0; i < 5; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Horários disponíveis (7h às 18h)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getAgendamentosForDateAndTime = (date: Date, timeSlot: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const [hour] = timeSlot.split(':');
    return agendamentos.filter(ag => {
      if (ag.data_agendamento !== dateStr) return false;
      const agHour = ag.horario_inicio ? ag.horario_inicio.split(':')[0] : '';
      return agHour === hour;
    });
  };

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '--:--';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
      case 'confirmado':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'compareceu':
      case 'realizado':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'faltou':
      case 'ausente':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'reagendado':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelado':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'confirmado': return 'Confirmado';
      case 'compareceu': return 'Compareceu';
      case 'realizado': return 'Realizado';
      case 'faltou': return 'Faltou';
      case 'ausente': return 'Ausente';
      case 'reagendado': return 'Reagendado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  async function handleCreateAgendamento() {
    console.log('🚀 Iniciando criação de agendamento...');
    console.log('📋 Dados do formulário:', formData);
    console.log('🏢 Unidade completa:', unidadeCompleta);
    
    if (!formData.paciente_id || !formData.sala_id || !formData.data_agendamento || !formData.horario_inicio || !unidadeCompleta) {
      const camposVazios = [];
      if (!formData.paciente_id) camposVazios.push('Paciente');
      if (!formData.sala_id) camposVazios.push('Sala');
      if (!formData.data_agendamento) camposVazios.push('Data');
      if (!formData.horario_inicio) camposVazios.push('Horário');
      if (!unidadeCompleta) camposVazios.push('Unidade');
      
      console.error('❌ Campos obrigatórios vazios:', camposVazios);
      alert(`Preencha todos os campos obrigatórios: ${camposVazios.join(', ')}`);
      return;
    }

    setLoadingCreate(true);
    try {
      // Buscar dados da sala selecionada
      const salaSelecionada = salas.find(s => s.id === formData.sala_id);
      console.log('🏠 Sala selecionada:', salaSelecionada);
      
      if (!salaSelecionada) {
        throw new Error('Sala selecionada não encontrada');
      }
      
      // Criar especialidade baseada no nome da sala com IDs reais do banco
      const especialidadeMap = {
        'Sala de Anamnese': { id: 'a6f79f0a-93ca-4382-a34c-901d50e46c9f', nome: 'Anamnese' },
        'Sala de Educação Física': { id: 'c76feb52-616e-4491-87e6-f951aa39cfe8', nome: 'Educador Físico' },
        'Sala de Fisioterapia': { id: '33783afe-b00b-412c-b5a9-af445d34812f', nome: 'Fisioterapia' },
        'Sala de Fonoaudiologia': { id: '8f2647a6-6ed4-48d0-b986-e8f6cd67fb39', nome: 'Fonoaudiologia' },
        'Sala de Musicoterapia': { id: '51c36511-bc19-4722-9e83-16cfdd795a13', nome: 'Musicoterapia' },
        'Sala de Neuropsicologia': { id: 'eb553162-1d76-449b-91bd-e662068c78d0', nome: 'Neuropsicologia' },
        'Sala de Psicologia': { id: '5072eac3-8bac-4256-aab8-361418727625', nome: 'Psicologia' },
        'Sala de Psicomotricidade': { id: '5ebf6131-4a28-4366-84fc-1d9f53483db3', nome: 'Psicomotricidade' },
        'Sala de Psicopedagogia': { id: '14897662-7850-445d-bc3f-1225bb2e4eb5', nome: 'Psicopedagogia' },
        'Sala de Terapia Ocupacional': { id: 'c978440c-081a-4fc0-8459-b5a0ff664f53', nome: 'Terapia Ocupacional' }
      };
      
      const especialidadeDaSala = especialidadeMap[salaSelecionada.nome as keyof typeof especialidadeMap] || 
        { id: '5072eac3-8bac-4256-aab8-361418727625', nome: salaSelecionada.nome.replace('Sala de ', '') }; // Default para Psicologia
      
      console.log('🎯 Especialidade da sala:', especialidadeDaSala);
      
      const isNeuropsicologia = especialidadeDaSala?.nome === 'Neuropsicologia';
      const isAnamnese = especialidadeDaSala?.nome === 'Anamnese';
      
      console.log('🧠 É Neuropsicologia?', isNeuropsicologia);
      console.log('📋 É Anamnese?', isAnamnese);

      // Determinar número de sessões baseado na modalidade
      let totalSessoes = 1;
      if (isNeuropsicologia) {
        totalSessoes = 6; // Neuropsicologia sempre 6 sessões
      } else if (!isAnamnese && formData.gerar_sequencia) {
        // Modalidades que permitem até 3 meses (12 semanas)
        totalSessoes = 12;
      }
      
      console.log('📊 Total de sessões a criar:', totalSessoes);

      // VALIDAÇÃO: Verificar se paciente existe e buscar convenio_id ANTES do loop
      console.log('🔍 Validando paciente e buscando convenio_id...');
      const { data: pacienteExiste } = await supabase
        .from('pacientes')
        .select('id, nome, convenio_id')
        .eq('id', formData.paciente_id)
        .single();
      
      console.log('👤 Paciente encontrado:', pacienteExiste);
      console.log('💳 Convênio do paciente:', {
        convenio_id: pacienteExiste?.convenio_id,
        tipo: typeof pacienteExiste?.convenio_id,
        valor: pacienteExiste?.convenio_id || 'NULL/UNDEFINED'
      });
      
      if (!pacienteExiste) {
        throw new Error(`Paciente com ID ${formData.paciente_id} não encontrado`);
      }

      // NOVA VALIDAÇÃO: Verificar se paciente tem convênio
      if (!pacienteExiste.convenio_id) {
        console.warn('⚠️ ATENÇÃO: Paciente não tem convênio cadastrado!');
      } else {
        console.log('✅ Paciente tem convênio:', pacienteExiste.convenio_id);
      }

      const agendamentosParaCriar = [];
      const dataBase = new Date(formData.data_agendamento);
      console.log('📅 Data base:', dataBase);

      // Criar agendamentos conforme as regras
      for (let i = 0; i < totalSessoes; i++) {
        const dataAgendamento = new Date(dataBase);
        dataAgendamento.setDate(dataBase.getDate() + (i * 7)); // Sempre mesmo dia da semana

        const agendamento = {
          paciente_id: formData.paciente_id,
          especialidade_id: especialidadeDaSala.id, // Usar ID real da especialidade
          sala_id: formData.sala_id,
          profissional_id: null, // Profissional será determinado pela alocação da sala
          unidade_id: unidadeCompleta.id, // Usar unidade do contexto
          convenio_id: pacienteExiste?.convenio_id || null, // CORRIGIDO: Usar convenio_id do paciente
          data_agendamento: dataAgendamento.toISOString().split('T')[0],
          horario_inicio: formData.horario_inicio,
          horario_fim: formData.horario_fim,
          duracao_minutos: formData.duracao_minutos,
          tipo_sessao: 'individual', // CORRIGIDO: Usar valor aceito pela constraint
          modalidade: especialidadeDaSala?.nome,
          status: 'agendado',
          status_confirmacao: 'pendente', // NOVO: Campo obrigatório para constraint
          is_neuropsicologia: isNeuropsicologia,
          sessao_sequencia: i + 1,
          total_sessoes: totalSessoes,
          agendamento_pai_id: i === 0 ? null : undefined, // Será definido após criar o primeiro
          observacoes: formData.observacoes,
          created_by: null, // NOVO: Campo para constraint (null permitido)
          updated_by: null  // NOVO: Campo para constraint (null permitido)
        };

        // Log detalhado do convênio para cada agendamento
        console.log(`📋 Agendamento ${i + 1}/${totalSessoes} - Convênio:`, {
          paciente_convenio_id: pacienteExiste?.convenio_id,
          agendamento_convenio_id: agendamento.convenio_id,
          data: agendamento.data_agendamento
        });

        agendamentosParaCriar.push(agendamento);
      }
      
      console.log('📝 Agendamentos para criar:', agendamentosParaCriar);

      // NOVA VALIDAÇÃO: Verificar se os IDs das foreign keys existem
      console.log('🔍 Validando foreign keys restantes...');
      
      // Paciente já foi validado acima, agora verificar as outras foreign keys

      // Verificar se sala existe
      const { data: salaExiste } = await supabase
        .from('salas')
        .select('id, nome, unidade_id')
        .eq('id', formData.sala_id)
        .single();
      
      console.log('🏠 Sala encontrada:', salaExiste);

      // Verificar se unidade existe
      const { data: unidadeExiste } = await supabase
        .from('unidades')
        .select('id, nome')
        .eq('id', unidadeCompleta.id)
        .single();
      
      console.log('🏢 Unidade encontrada:', unidadeExiste);

      // Validar se algum dos registros não foi encontrado (paciente já foi validado acima)
      if (!salaExiste) {
        throw new Error(`Sala com ID ${formData.sala_id} não encontrada`);
      }
      if (!unidadeExiste) {
        throw new Error(`Unidade com ID ${unidadeCompleta.id} não encontrada`);
      }

      console.log('✅ Todas as foreign keys são válidas!');

      // Inserir primeiro agendamento (pai)
      console.log('💾 Inserindo primeiro agendamento (pai)...');
      console.log('📋 Dados do agendamento pai:', JSON.stringify(agendamentosParaCriar[0], null, 2));
      
      const { data: agendamentoPai, error: errorPai } = await supabase
        .from('agendamentos')
        .insert([agendamentosParaCriar[0]])
        .select()
        .single();

      console.log('✅ Resultado inserção pai:', { agendamentoPai, errorPai });

      if (errorPai) {
        console.error('❌ Erro ao inserir agendamento pai (detalhado):', {
          error: errorPai,
          message: errorPai?.message,
          details: errorPai?.details,
          hint: errorPai?.hint,
          code: errorPai?.code
        });
        throw errorPai;
      }

      // Se houver mais agendamentos, inserir os filhos
      if (agendamentosParaCriar.length > 1) {
        console.log('👶 Inserindo agendamentos filhos...');
        const agendamentosFilhos = agendamentosParaCriar.slice(1).map(ag => ({
          ...ag,
          agendamento_pai_id: agendamentoPai.id
        }));
        
        console.log('📝 Agendamentos filhos:', agendamentosFilhos);

        const { error: errorFilhos } = await supabase
          .from('agendamentos')
          .insert(agendamentosFilhos);

        console.log('✅ Resultado inserção filhos:', { errorFilhos });

        if (errorFilhos) {
          console.error('❌ Erro ao inserir agendamentos filhos (detalhado):', {
            error: errorFilhos,
            message: errorFilhos?.message,
            details: errorFilhos?.details,
            hint: errorFilhos?.hint,
            code: errorFilhos?.code
          });
          throw errorFilhos;
        }
      }

      // Sucesso
      console.log('🎉 Agendamentos criados com sucesso!');
      alert(`${totalSessoes} agendamento(s) criado(s) com sucesso!`);
      setShowNewAgendamentoModal(false);
      resetarFormulario();
      
      // Recarregar dados
      fetchAgendamentos();
      fetchEstatisticas();

    } catch (error) {
      console.error('Erro ao criar agendamento (detalhado):', {
        error: error,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      
      // Extrair mensagem de erro detalhada
      let errorMessage = 'Erro ao criar agendamento. Verifique os dados e tente novamente.';
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = `Erro: ${error.message}`;
        } else if ('details' in error) {
          errorMessage = `Erro: ${error.details}`;
        } else if ('hint' in error) {
          errorMessage = `Erro: ${error.hint}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleStatusChange(agendamentoId: string, novoStatus: string) {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamentoId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status do agendamento');
      } else {
        // Recarregar dados
        fetchAgendamentos();
        fetchEstatisticas();
      }
    } catch (error) {
      console.error('Erro ao conectar com o banco:', error);
      alert('Erro de conexão');
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-blue-100 dark:border-blue-800/50 shadow-lg">
          <div className="px-4 md:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  📅
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Agendamentos NAC</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base">Gestão de agendamentos e sessões</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 lg:px-4 py-2 rounded-2xl font-semibold text-xs lg:text-sm">
                  Total: {agendamentosFiltrados.length} agendamentos
                  {(agendamentosFiltrados.length !== agendamentos.length) && (
                    <span className="text-blue-600 dark:text-blue-400 ml-1">
                      (de {agendamentos.length})
                    </span>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  connectionStatus === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                  connectionStatus === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                    connectionStatus === 'error' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`}></div>
                  {connectionStatus === 'connected' ? 'DB Conectado' :
                   connectionStatus === 'error' ? 'DB Erro' : 'Testando DB'}
                </div>
              </div>
            </div>

            {/* Estatísticas do Mês */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{estatisticas.agendados}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Agendados</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{estatisticas.compareceram}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Compareceram</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{estatisticas.faltaram}</div>
                <div className="text-sm text-red-600 dark:text-red-400">Faltaram</div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{estatisticas.reagendamentos}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Reagendamentos</div>
              </div>
            </div>

            {/* Dashboard de Profissionais - NOVO */}
            {getProfissionaisUnicos().length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  👨‍⚕️ Atendimentos por Profissional Hoje
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getProfissionaisUnicos().map(profissional => {
                    const atendimentosProf = agendamentos.filter(ag => ag.profissional_nome === profissional);
                    const atendimentosHoje = atendimentosProf.filter(ag => {
                      const hoje = new Date().toISOString().split('T')[0];
                      return ag.data_agendamento === hoje;
                    });
                    return (
                      <div key={profissional} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            👨‍⚕️
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-green-800 dark:text-green-300 truncate">
                              {profissional}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <div className="font-bold text-green-700 dark:text-green-400">{atendimentosHoje.length}</div>
                            <div className="text-green-600 dark:text-green-500">Hoje</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <div className="font-bold text-green-700 dark:text-green-400">{atendimentosProf.length}</div>
                            <div className="text-green-600 dark:text-green-500">Total</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Controles */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600'
                  }`}
                >
                  <Calendar size={16} />
                  Calendário
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600'
                  }`}
                >
                  <List size={16} />
                  Lista
                </button>
              </div>

              <div className="flex gap-2 ml-auto flex-wrap">
                <button 
                  onClick={() => setShowNewAgendamentoModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus size={16} />
                  Novo Agendamento
                </button>
                
                <button 
                  onClick={() => setFiltroMostrando(!filtroMostrando)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${
                    filtroMostrando || filtroProfissional || filtroEspecialidade || filtroStatus
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Filter size={16} />
                  Filtros
                  {(filtroProfissional || filtroEspecialidade || filtroStatus) && (
                    <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                      {[filtroProfissional, filtroEspecialidade, filtroStatus].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Filtros */}
        {filtroMostrando && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-blue-100 dark:border-blue-800/50 shadow-sm">
            <div className="px-4 md:px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por Profissional */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    👨‍⚕️ Profissional
                  </label>
                  <select
                    value={filtroProfissional}
                    onChange={(e) => setFiltroProfissional(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os profissionais</option>
                    {getProfissionaisUnicos().map(prof => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Especialidade */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    🩺 Especialidade
                  </label>
                  <select
                    value={filtroEspecialidade}
                    onChange={(e) => setFiltroEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as especialidades</option>
                    {Array.from(new Set(agendamentos.map(ag => ag.especialidade_nome).filter(Boolean))).sort().map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    📊 Status
                  </label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os status</option>
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="compareceu">Compareceu</option>
                    <option value="faltou">Faltou</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              
              {/* Botões de ação dos filtros */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setFiltroProfissional('');
                    setFiltroEspecialidade('');
                    setFiltroStatus('');
                  }}
                  className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Limpar Filtros
                </button>
                <div className="text-sm text-slate-600 dark:text-slate-400 px-4 py-2">
                  Mostrando {agendamentosFiltrados.length} de {agendamentos.length} agendamentos
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div className="px-4 md:px-6 py-2">
          {viewMode === 'calendar' ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden animate-fade-in">
              {/* Cabeçalho do Calendário */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-lg lg:text-xl font-bold">
                    Semana de {getWeekDays()[0].toLocaleDateString('pt-BR')} a {getWeekDays()[4].toLocaleDateString('pt-BR')} (Segunda a Sexta)
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(selectedDate.getDate() - 7);
                        setSelectedDate(newDate);
                      }}
                      className="px-3 lg:px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all text-sm lg:text-base"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-3 lg:px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all text-sm lg:text-base"
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(selectedDate.getDate() + 7);
                        setSelectedDate(newDate);
                      }}
                      className="px-3 lg:px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all text-sm lg:text-base"
                    >
                      Próxima →
                    </button>
                  </div>
                </div>
              </div>

              {/* Grade do Calendário com Horários */}
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-1 p-6 min-w-[800px]">
                  {/* Header com dias da semana */}
                  <div className="font-medium text-slate-600 dark:text-slate-400 text-center py-2">
                    Horário
                  </div>
                  {getWeekDays().map((day, index) => (
                    <div key={index} className="text-center py-2">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {day.getDate()}/{(day.getMonth() + 1).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ))}

                  {/* Linhas de horários */}
                  {getTimeSlots().map((timeSlot) => (
                    <Fragment key={timeSlot}>
                      {/* Coluna do horário */}
                      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-center font-medium text-slate-700 dark:text-slate-300 text-sm">
                        {timeSlot}
                      </div>
                      
                      {/* Colunas dos dias */}
                      {getWeekDays().map((day, dayIndex) => (
                        <div key={`${timeSlot}-${dayIndex}`} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-1 min-h-[60px] border border-slate-200 dark:border-slate-600">
                          {getAgendamentosForDateAndTime(day, timeSlot).map((agendamento: Agendamento) => (
                            <div
                              key={agendamento.id}
                              className="bg-white dark:bg-slate-600 rounded-lg p-2 shadow-sm hover:shadow-md transition-all cursor-pointer group mb-1"
                              style={{
                                borderLeft: `4px solid ${CORES_ESPECIALIDADES[agendamento.especialidade_nome as keyof typeof CORES_ESPECIALIDADES] || agendamento.sala_cor || '#6B7280'}`
                              }}
                              title={`${agendamento.paciente_nome} - ${agendamento.especialidade_nome}\n👨‍⚕️ ${agendamento.profissional_nome || 'Profissional não definido'}\n${agendamento.convenio_nome || 'Particular'}\n${formatTime(agendamento.horario_inicio)} - ${formatTime(agendamento.horario_fim)}`}
                            >
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {agendamento.paciente_nome}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {formatTime(agendamento.horario_inicio)}-{formatTime(agendamento.horario_fim)}
                              </div>
                              
                              {/* BADGE DO PROFISSIONAL - DESTAQUE PRINCIPAL */}
                              {agendamento.profissional_nome ? (
                                <div className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-md font-medium truncate mt-1 flex items-center gap-1">
                                  <span>👨‍⚕️</span>
                                  <span>{agendamento.profissional_nome}</span>
                                </div>
                              ) : (
                                <div className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium mt-1 flex items-center gap-1">
                                  <span>⚠️</span>
                                  <span>Sem profissional</span>
                                </div>
                              )}
                              
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {agendamento.sala_nome}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                💳 {agendamento.convenio_nome || 'Particular'}
                              </div>
                              {agendamento.numero_agendamento && (
                                <div className="text-xs text-slate-400 dark:text-slate-500">
                                  #{agendamento.numero_agendamento}
                                </div>
                              )}
                              <div className={`text-xs px-1 py-0.5 rounded mt-1 ${getStatusColor(agendamento.status)}`}>
                                {getStatusLabel(agendamento.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Visualização em Lista */
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden animate-fade-in">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-600">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Data/Hora</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Paciente</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Convênio</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Sala & Especialidade</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Profissional</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            <div className="flex justify-center items-center gap-2">
                              <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                              <span className="text-slate-600 dark:text-slate-400">Carregando agendamentos...</span>
                            </div>
                          </td>
                        </tr>
                      ) : agendamentosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Calendar className="h-12 w-12 text-slate-400" />
                              <span className="text-slate-500 dark:text-slate-400 font-medium">
                                Nenhum agendamento encontrado
                              </span>
                              <span className="text-sm text-slate-400 dark:text-slate-500">
                                para o período selecionado
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        agendamentosFiltrados.map((agendamento) => (
                          <tr key={agendamento.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                {agendamento.paciente_nome}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center">
                                💳 {agendamento.convenio_nome || 'Particular'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded"
                                  style={{backgroundColor: agendamento.sala_cor || '#6B7280'}}
                                ></div>
                                <div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {agendamento.sala_nome || 'Sala não especificada'}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {agendamento.especialidade_nome || 'Especialidade não especificada'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {agendamento.profissional_nome ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                      👨‍⚕️
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-green-700 dark:text-green-400">
                                        {agendamento.profissional_nome}
                                      </div>
                                      <div className="text-xs text-green-600 dark:text-green-500">
                                        Profissional responsável
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-orange-600">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                      ⚠️
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">Não atribuído</div>
                                      <div className="text-xs">Precisa definir profissional</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                                {getStatusLabel(agendamento.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {agendamento.status === 'agendado' && (
                                  <>
                                    <button 
                                      onClick={() => handleStatusChange(agendamento.id, 'compareceu')}
                                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                                    >
                                      ✓ Compareceu
                                    </button>
                                    <button 
                                      onClick={() => handleStatusChange(agendamento.id, 'faltou')}
                                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                      ✗ Faltou
                                    </button>
                                    <button 
                                      onClick={() => {
                                        // Função temporária para WhatsApp
                                        alert(`WhatsApp para ${agendamento.paciente_nome} - Função em desenvolvimento`);
                                      }}
                                      className="text-green-500 hover:text-green-700 text-sm font-medium"
                                      title="Enviar confirmação via WhatsApp"
                                    >
                                      📱 WhatsApp
                                    </button>
                                  </>
                                )}
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                  📝 Editar
                                </button>
                                {agendamento.numero_agendamento && (
                                  <span className="text-xs text-gray-500">
                                    #{agendamento.numero_agendamento}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Novo Agendamento */}
      {showNewAgendamentoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-blue-200 dark:border-blue-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">📅 Novo Agendamento</h2>
                  <p className="text-blue-100 mt-1">
                    Criar agendamento conforme modalidade selecionada
                    {process.env.NODE_ENV === 'development' && (
                      <span className="text-xs ml-2 bg-white/20 px-2 py-1 rounded">
                        {pacientes.length} pacientes | {salas.length} salas
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowNewAgendamentoModal(false)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Formulário */}
            <div className="p-6 space-y-6">
              {/* Busca Avançada de Paciente */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  👤 Paciente *
                </label>
                
                {/* Campo de busca */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchPaciente}
                    onChange={(e) => {
                      setSearchPaciente(e.target.value);
                      filtrarPacientes(e.target.value);
                      setShowPacienteDropdown(true);
                      if (!e.target.value.trim()) {
                        limparSelecaoPaciente();
                      }
                    }}
                    onFocus={() => {
                      if (searchPaciente.trim()) {
                        filtrarPacientes(searchPaciente);
                        setShowPacienteDropdown(true);
                      }
                    }}
                    placeholder="Digite o nome do paciente para buscar..."
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  {/* Ícones */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {pacienteSelecionado ? (
                      <button
                        onClick={limparSelecaoPaciente}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        type="button"
                      >
                        ✕
                      </button>
                    ) : (
                      <div className="text-slate-400">🔍</div>
                    )}
                  </div>
                </div>

                {/* Dropdown com resultados */}
                {showPacienteDropdown && pacientesFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {pacientesFiltrados.map((paciente) => (
                      <button
                        key={paciente.id}
                        onClick={() => selecionarPaciente(paciente)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {paciente.nome}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {paciente.convenios?.[0]?.nome || paciente.convenio_nome || 'Particular'}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                            ID: {paciente.id.slice(-8)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Paciente selecionado */}
                {pacienteSelecionado && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-300">
                          ✅ {pacienteSelecionado.nome}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {pacienteSelecionado.convenios?.[0]?.nome || pacienteSelecionado.convenio_nome || 'Particular'}
                        </div>
                      </div>
                      <button
                        onClick={limparSelecaoPaciente}
                        className="text-green-600 hover:text-red-500 transition-colors text-sm"
                        type="button"
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                )}

                {/* Mensagem quando não há pacientes */}
                {pacientes.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Nenhum paciente encontrado na unidade "{unidadeCompleta?.nome}". 
                    <button 
                      onClick={diagnosticarBanco}
                      className="ml-1 text-blue-600 underline hover:no-underline"
                    >
                      Verificar
                    </button>
                  </p>
                )}

                {/* Dica de uso */}
                {!pacienteSelecionado && pacientes.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    💡 Digite pelo menos 2 caracteres para buscar entre {pacientes.length} pacientes
                  </p>
                )}
              </div>

              {/* Seleção Unificada: Sala + Especialidade */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  � Sala & Especialidade *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSalaDropdown(!showSalaDropdown)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
                  >
                    {formData.sala_id ? (
                      (() => {
                        const salaSelecionada = salas.find(s => s.id === formData.sala_id);
                        return salaSelecionada ? (
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-5 h-5 rounded-md border border-white shadow-sm"
                              style={{backgroundColor: salaSelecionada.cor || '#6B7280'}}
                            ></div>
                            <span>{salaSelecionada.nome} {salaSelecionada.tipo && `(${salaSelecionada.tipo})`}</span>
                          </div>
                        ) : 'Sala não encontrada';
                      })()
                    ) : (
                      <span className="text-slate-500">Selecione uma sala...</span>
                    )}
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showSalaDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {salas.length === 0 ? (
                        <div className="px-4 py-3 text-slate-500 text-center">
                          Nenhuma sala encontrada para esta unidade
                        </div>
                      ) : (
                        salas.map(sala => (
                          <button
                            key={sala.id}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData, 
                                sala_id: sala.id,
                                duracao_minutos: 60,
                                total_sessoes: 1
                              });
                              setShowSalaDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-3 transition-colors"
                          >
                            <div 
                              className="w-5 h-5 rounded-md border border-white shadow-sm flex-shrink-0"
                              style={{backgroundColor: sala.cor || '#6B7280'}}
                            ></div>
                            <span className="flex-1">{sala.nome} {sala.tipo && `(${sala.tipo})`}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                {/* Visualização da sala selecionada */}
                {formData.sala_id && (
                  <div className="mt-3 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                    {(() => {
                      const salaSelecionada = salas.find(s => s.id === formData.sala_id);
                      if (!salaSelecionada) return null;
                      
                      return (
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-8 h-8 rounded-lg shadow-sm border border-white"
                            style={{backgroundColor: salaSelecionada.cor || '#6B7280'}}
                          ></div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {salaSelecionada.nome}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              📍 {salaSelecionada.tipo || 'Sala padrão'}
                              <span className="ml-2">• ⏱️ 60 min (padrão)</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 bg-white dark:bg-slate-600 px-2 py-1 rounded">
                            {salaSelecionada.tipo || 'Sala'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {salas.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Nenhuma sala encontrada na unidade "{unidadeCompleta?.nome}".
                  </p>
                )}
              </div>

              {/* Data e Horários */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    📅 Data *
                  </label>
                  <input
                    type="date"
                    value={formData.data_agendamento}
                    onChange={(e) => setFormData({...formData, data_agendamento: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    🕐 Horário Início *
                  </label>
                  <input
                    type="time"
                    value={formData.horario_inicio}
                    onChange={(e) => {
                      setFormData({
                        ...formData, 
                        horario_inicio: e.target.value
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    🕐 Horário Fim *
                  </label>
                  <input
                    type="time"
                    value={formData.horario_fim}
                    onChange={(e) => {
                      setFormData({
                        ...formData, 
                        horario_fim: e.target.value
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Opções Especiais */}
              {formData.sala_id && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">⚙️ Configurações da Modalidade</h3>
                  
                  {/* Informações da Especialidade */}
                  <div className="mb-4">
                    {(() => {
                      const salaSelecionada = salas.find(s => s.id === formData.sala_id);
                      const especialidadeNome = salaSelecionada?.especialidades?.nome;
                      
                      if (especialidadeNome === 'Neuropsicologia') {
                        return (
                          <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                              🧠 Neuropsicologia: Serão criadas 6 sessões automaticamente, sempre no mesmo dia da semana e horário.
                            </p>
                          </div>
                        );
                      } else if (especialidadeNome === 'Anamnese') {
                        return (
                          <div className="bg-gray-100 dark:bg-gray-900/20 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              📋 Anamnese: Sessão única de 1 hora.
                            </p>
                          </div>
                        );
                      } else {
                        return (
                          <div className="space-y-3">
                            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
                              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                🔄 {especialidadeNome}: Modalidade permite agendamentos recorrentes de até 3 meses.
                              </p>
                            </div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.gerar_sequencia}
                                onChange={(e) => setFormData({...formData, gerar_sequencia: e.target.checked})}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Gerar 12 sessões (3 meses) no mesmo dia/horário
                              </span>
                            </label>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  📝 Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações adicionais sobre o agendamento..."
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 justify-end pt-6 border-t border-slate-200 dark:border-slate-600">
                <button
                  onClick={() => {
                    resetarFormulario();
                    setShowNewAgendamentoModal(false);
                  }}
                  className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAgendamento}
                  disabled={loadingCreate || !pacienteSelecionado}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingCreate ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus size={16} />}
                  {loadingCreate ? 'Criando...' : 'Criar Agendamento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
  
 
 