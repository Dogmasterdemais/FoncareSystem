"use client";
import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";
import { Calendar, Clock, User, MapPin, Phone, FileText, Plus, Filter, List, Grid, Loader2 } from 'lucide-react';
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
  const { unidadeSelecionada, unidades } = useUnidade();
  
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
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    paciente_id: '',
    especialidade_id: '',
    sala_id: '',
    profissional_id: '',
    data_agendamento: '',
    horario_inicio: '',
    horario_fim: '',
    tipo_sessao: '',
    modalidade: '',
    duracao_minutos: 60,
    total_sessoes: 1,
    gerar_sequencia: false,
    observacoes: ''
  });

  useEffect(() => {
    testConnection();
    fetchAgendamentos();
    fetchEstatisticas();
    loadFormData();
  }, [selectedDate, unidadeCompleta]);

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
        console.error('❌ Erro ao buscar pacientes:', pacientesError);
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

      // Carregar especialidades ativas
      console.log('🏥 Buscando especialidades...');
      const { data: especialidadesData, error: especialidadesError } = await supabase
        .from('especialidades')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      console.log('🏥 Especialidades encontradas:', especialidadesData?.length || 0);
      if (especialidadesError) {
        console.error('❌ Erro ao buscar especialidades:', especialidadesError);
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
        console.error('❌ ERRO: Tabela salas não existe ou não acessível:', errorExistencia);
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
      
      // Buscar salas da unidade atual
      console.log('🏢 Buscando salas da unidade atual:', unidadeCompleta.id);
      const { data: todasSalasUnidade, error: errorTodasSalasUnidade } = await supabase
        .from('salas')
        .select('*')
        .eq('unidade_id', unidadeCompleta.id)
        .order('nome');
      
      console.log('🏢 Total de salas na unidade:', todasSalasUnidade?.length || 0);
      if (errorTodasSalasUnidade) {
        console.error('❌ ERRO na query de salas:', errorTodasSalasUnidade);
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
      console.log('👨‍⚕️ Buscando profissionais...');
      const { data: profissionaisData, error: profissionaisError } = await supabase
        .from('profissionais')
        .select('*, especialidades(nome)')
        .eq('ativo', true)
        .order('nome');

      // Se der erro por causa da coluna unidade_id, tentar sem o filtro
      if (profissionaisError && profissionaisError.message.includes('unidade_id')) {
        console.log('⚠️ Coluna unidade_id não existe, carregando todos os profissionais');
        const { data: allProfissionais } = await supabase
          .from('profissionais')
          .select('*, especialidades(nome)')
          .eq('ativo', true)
          .order('nome');
        setProfissionais(allProfissionais || []);
        console.log('👨‍⚕️ Profissionais encontrados (fallback):', allProfissionais?.length || 0);
      } else {
        setProfissionais(profissionaisData || []);
        console.log('👨‍⚕️ Profissionais encontrados:', profissionaisData?.length || 0);
        if (profissionaisError) {
          console.error('❌ Erro ao buscar profissionais:', profissionaisError);
        }
      }

      setPacientes(pacientesData || []);
      setEspecialidades(especialidadesData || []);
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

      const { data, error } = await supabase
        .from('vw_agendamentos_completo')
        .select('*')
        .gte('data_agendamento', startDate.toISOString().split('T')[0])
        .lte('data_agendamento', endDate.toISOString().split('T')[0])
        .order('data_agendamento', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        // Fallback para dados mock se houver erro
        setAgendamentos([]);
      } else {
        setAgendamentos(data || []);
      }
    } catch (error) {
      console.error('Erro ao conectar com o banco:', error);
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
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAgendamentosForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return agendamentos.filter(ag => ag.data_agendamento === dateStr);
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
    
    if (!formData.paciente_id || !formData.especialidade_id || !formData.sala_id || !formData.data_agendamento || !formData.horario_inicio || !unidadeCompleta) {
      const camposVazios = [];
      if (!formData.paciente_id) camposVazios.push('Paciente');
      if (!formData.especialidade_id) camposVazios.push('Especialidade');
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
      // Buscar dados da especialidade selecionada
      const especialidadeSelecionada = especialidades.find(e => e.id === formData.especialidade_id);
      console.log('🎯 Especialidade selecionada:', especialidadeSelecionada);
      
      const isNeuropsicologia = especialidadeSelecionada?.nome === 'Neuropsicologia';
      const isAnamnese = especialidadeSelecionada?.nome === 'Anamnese';
      
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
          especialidade_id: formData.especialidade_id,
          sala_id: formData.sala_id,
          profissional_id: formData.profissional_id || null, // Opcional
          unidade_id: unidadeCompleta.id, // Usar unidade do contexto
          convenio_id: pacienteExiste?.convenio_id || null, // CORRIGIDO: Usar convenio_id do paciente
          data_agendamento: dataAgendamento.toISOString().split('T')[0],
          horario_inicio: formData.horario_inicio,
          horario_fim: formData.horario_fim,
          duracao_minutos: formData.duracao_minutos,
          tipo_sessao: especialidadeSelecionada?.nome,
          modalidade: especialidadeSelecionada?.nome,
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

      // Verificar se especialidade existe
      const { data: especialidadeExiste } = await supabase
        .from('especialidades')
        .select('id, nome')
        .eq('id', formData.especialidade_id)
        .single();
      
      console.log('🎯 Especialidade encontrada:', especialidadeExiste);

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
      if (!especialidadeExiste) {
        throw new Error(`Especialidade com ID ${formData.especialidade_id} não encontrada`);
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
      setFormData({
        paciente_id: '',
        especialidade_id: '',
        sala_id: '',
        profissional_id: '',
        data_agendamento: '',
        horario_inicio: '',
        horario_fim: '',
        tipo_sessao: '',
        modalidade: '',
        duracao_minutos: 60,
        total_sessoes: 1,
        gerar_sequencia: false,
        observacoes: ''
      });
      
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
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-blue-100 dark:border-blue-800/50 sticky top-0 z-20 shadow-lg">
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  📅
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Agendamentos NAC</h1>
                  <p className="text-slate-600 dark:text-slate-400">Gestão de agendamentos e sessões</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-2xl font-semibold text-sm">
                  Total: {agendamentos.length} agendamentos
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
                
                <button className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-all">
                  <Filter size={16} />
                  Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-4 md:px-6 py-2">
          {viewMode === 'calendar' ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden animate-fade-in">
              {/* Cabeçalho do Calendário */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    Semana de {getWeekDays()[0].toLocaleDateString('pt-BR')} a {getWeekDays()[6].toLocaleDateString('pt-BR')}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(selectedDate.getDate() - 7);
                        setSelectedDate(newDate);
                      }}
                      className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(selectedDate.getDate() + 7);
                        setSelectedDate(newDate);
                      }}
                      className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Grade do Calendário */}
              <div className="grid grid-cols-7 gap-1 p-6">
                {getWeekDays().map((day, index) => (
                  <div key={index} className="min-h-[300px] bg-slate-50 dark:bg-slate-700 rounded-2xl p-3">
                    <div className="text-center mb-3">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {day.getDate()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {getAgendamentosForDate(day).map((agendamento) => (
                        <div
                          key={agendamento.id}
                          className="bg-white dark:bg-slate-600 rounded-xl p-2 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          style={{
                            borderLeft: `4px solid ${CORES_ESPECIALIDADES[agendamento.especialidade_nome as keyof typeof CORES_ESPECIALIDADES] || agendamento.sala_cor || '#6B7280'}`
                          }}
                          title={`${agendamento.paciente_nome} - ${agendamento.especialidade_nome}\n${agendamento.profissional_nome}\n${agendamento.convenio_nome || 'Particular'}`}
                        >
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {agendamento.paciente_nome}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {formatTime(agendamento.horario_inicio)} - {formatTime(agendamento.horario_fim)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {agendamento.sala_nome}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {agendamento.especialidade_nome}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 truncate flex items-center">
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
                  </div>
                ))}
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
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Modalidade</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Sala</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Profissional</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8">
                            <div className="flex justify-center items-center gap-2">
                              <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                              <span className="text-slate-600 dark:text-slate-400">Carregando agendamentos...</span>
                            </div>
                          </td>
                        </tr>
                      ) : agendamentos.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8">
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
                        agendamentos.map((agendamento) => (
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
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{
                                  backgroundColor: CORES_ESPECIALIDADES[agendamento.especialidade_nome as keyof typeof CORES_ESPECIALIDADES] || agendamento.sala_cor || '#6B7280'
                                }}
                              >
                                {agendamento.especialidade_nome}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                              {agendamento.sala_nome}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                              {agendamento.profissional_nome}
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

        {/* Seção de Especialidades Disponíveis */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800/50 overflow-hidden mt-6">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              🎨 Especialidades Disponíveis
            </h3>
            <p className="text-emerald-100 mt-1">Cores e modalidades de atendimento</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(CORES_ESPECIALIDADES).map(([especialidade, cor]) => (
                <div key={especialidade} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:shadow-md transition-all">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: cor }}
                  ></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {especialidade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instruções de Uso */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 border border-blue-200 dark:border-blue-800 mt-6">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            💡 Como usar o sistema de agendamentos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h5 className="font-medium text-slate-800 dark:text-slate-100 mb-2">📅 Visão Calendário:</h5>
              <ul className="space-y-1">
                <li>• Visualize agendamentos da semana</li>
                <li>• Cores indicam especialidades</li>
                <li>• Navegue entre semanas com as setas</li>
                <li>• Passe o mouse para mais detalhes</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-slate-800 dark:text-slate-100 mb-2">📋 Visão Lista:</h5>
              <ul className="space-y-1">
                <li>• Lista detalhada de agendamentos</li>
                <li>• Marque presença/falta diretamente</li>
                <li>• Visualize informações completas</li>
                <li>• Acesse número do agendamento</li>
              </ul>
            </div>
          </div>
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
                        {pacientes.length} pacientes | {especialidades.length} especialidades | {profissionais.length} profissionais
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
              {/* Seleção de Paciente */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  👤 Paciente *
                </label>
                <select
                  value={formData.paciente_id}
                  onChange={(e) => setFormData({...formData, paciente_id: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um paciente...</option>
                  {pacientes.length === 0 && (
                    <option disabled>Nenhum paciente encontrado para esta unidade</option>
                  )}
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} - {p.convenios?.[0]?.nome || p.convenio_nome || 'Particular'}
                    </option>
                  ))}
                </select>
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
              </div>

              {/* Seleção de Especialidade */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  🎯 Especialidade *
                </label>
                <select
                  value={formData.especialidade_id}
                  onChange={(e) => {
                    const especialidadeSelecionada = especialidades.find(esp => esp.id === e.target.value);
                    setFormData({
                      ...formData, 
                      especialidade_id: e.target.value,
                      duracao_minutos: especialidadeSelecionada?.duracao_padrao_minutos || 60,
                      total_sessoes: especialidadeSelecionada?.nome === 'Neuropsicologia' ? 6 : 1
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma especialidade...</option>
                  {especialidades.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nome} - {e.descricao}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Sala */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  🏠 Sala *
                </label>
                <select
                  value={formData.sala_id}
                  onChange={(e) => setFormData({...formData, sala_id: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma sala...</option>
                  {salas.length === 0 && (
                    <option disabled>Nenhuma sala encontrada para esta unidade</option>
                  )}
                  {salas.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nome} {s.especialidades?.nome && `- ${s.especialidades.nome}`}
                    </option>
                  ))}
                </select>
                {salas.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Nenhuma sala encontrada na unidade "{unidadeCompleta?.nome}". 
                    <br />
                    Clique no botão "🏗️ Criar Salas" acima para adicionar salas de exemplo.
                  </p>
                )}
              </div>

              {/* Seleção de Profissional */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  👨‍⚕️ Profissional *
                </label>
                <select
                  value={formData.profissional_id}
                  onChange={(e) => setFormData({...formData, profissional_id: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um profissional...</option>
                  {profissionais.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} - {p.especialidades?.nome}
                    </option>
                  ))}
                </select>
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
                      const inicio = e.target.value;
                      const [horas, minutos] = inicio.split(':');
                      const inicioDate = new Date();
                      inicioDate.setHours(parseInt(horas), parseInt(minutos));
                      
                      const fimDate = new Date(inicioDate.getTime() + (formData.duracao_minutos * 60000));
                      const fim = fimDate.toTimeString().substring(0, 5);
                      
                      setFormData({
                        ...formData, 
                        horario_inicio: inicio,
                        horario_fim: fim
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    🕐 Horário Fim
                  </label>
                  <input
                    type="time"
                    value={formData.horario_fim}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 text-slate-500"
                  />
                </div>
              </div>

              {/* Opções Especiais */}
              {formData.especialidade_id && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">⚙️ Configurações da Modalidade</h3>
                  
                  {/* Informações da Especialidade */}
                  <div className="mb-4">
                    {(() => {
                      const esp = especialidades.find(e => e.id === formData.especialidade_id);
                      if (esp?.nome === 'Neuropsicologia') {
                        return (
                          <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                              🧠 Neuropsicologia: Serão criadas 6 sessões automaticamente, sempre no mesmo dia da semana e horário.
                            </p>
                          </div>
                        );
                      } else if (esp?.nome === 'Anamnese') {
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
                                🔄 {esp?.nome}: Modalidade permite agendamentos recorrentes de até 3 meses.
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
                  onClick={() => setShowNewAgendamentoModal(false)}
                  className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAgendamento}
                  disabled={loadingCreate}
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
