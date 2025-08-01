"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  Filter,
  Calendar,
  Building2,
  CreditCard,
  User,
  DollarSign,
  FileCheck,
  Search,
  ArrowUpDown,
  FileSpreadsheet,
  X,
  MessageSquare
} from 'lucide-react';

interface GuiaFaturamento {
  id: number;
  paciente_nome: string;
  data_agendamento: string;
  convenio_nome: string;
  codigo_tuss: string;
  especialidade_nome: string;
  valor_procedimento: number;
  numero_guia: string;
  data_autorizacao: string;
  validade_autorizacao: string;
  unidade_nome: string;
  status_faturamento: 'pendente' | 'revisada' | 'faturada';
  data_revisao?: string;
  data_faturamento?: string;
  observacoes_faturamento?: string;
}

export default function FaturamentoPage() {
  const [guias, setGuias] = useState<GuiaFaturamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    convenio: '',
    unidade: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    busca: ''
  });
  const [convenios, setConvenios] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [guiasAgrupadas, setGuiasAgrupadas] = useState<any>({});
  const [modalRevisao, setModalRevisao] = useState<{
    isOpen: boolean;
    guiaId: number | null;
    observacoes: string;
  }>({
    isOpen: false,
    guiaId: null,
    observacoes: ''
  });

  useEffect(() => {
    carregarDados();
    carregarFiltros();
  }, []);

  useEffect(() => {
    agruparGuias();
  }, [guias]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar guias tabuladas usando a nova view
      const { data: guiasData, error } = await supabase
        .from('vw_faturamento_completo')
        .select('*')
        .order('data_agendamento', { ascending: false });

      if (error) throw error;

      const guiasFormatadas = (guiasData || []).map(guia => ({
        id: guia.id,
        paciente_nome: guia.paciente_nome,
        data_agendamento: guia.data_agendamento,
        convenio_nome: guia.convenio_nome,
        codigo_tuss: guia.codigo_tuss || guia.codigo_autorizacao || 'N/A',
        especialidade_nome: guia.especialidade_nome,
        valor_procedimento: guia.valor_procedimento,
        numero_guia: guia.numero_guia,
        data_autorizacao: guia.data_autorizacao,
        validade_autorizacao: guia.validade_autorizacao,
        unidade_nome: guia.unidade_nome,
        status_faturamento: guia.status_faturamento || 'pendente',
        data_revisao: guia.data_revisao,
        data_faturamento: guia.data_faturamento,
        usuario_revisao: guia.usuario_revisao,
        usuario_faturamento: guia.usuario_faturamento,
        lote_faturamento: guia.lote_faturamento
      }));

      // Garantir que não há duplicatas por ID
      const guiasUnicas = guiasFormatadas.filter((guia, index, self) => 
        self.findIndex(g => g.id === guia.id) === index
      );

      setGuias(guiasUnicas);
      console.log('Guias carregadas:', guiasUnicas.length, 'de', guiasFormatadas.length, 'registros únicos'); // Debug
    } catch (error) {
      console.error('Erro ao carregar guias:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarFiltros = async () => {
    try {
      // Carregar convênios
      const { data: conveniosData } = await supabase
        .from('convenios')
        .select('id, nome')
        .order('nome');

      // Carregar unidades
      const { data: unidadesData } = await supabase
        .from('unidades')
        .select('id, nome')
        .order('nome');

      setConvenios(conveniosData || []);
      setUnidades(unidadesData || []);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  const agruparGuias = () => {
    // Remover duplicatas por ID antes de agrupar
    const guiasUnicas = guias.filter((guia, index, self) => 
      self.findIndex(g => g.id === guia.id) === index
    );
    
    console.log('Guias únicas para agrupamento:', guiasUnicas.length, 'de', guias.length, 'totais'); // Debug
    
    const agrupadas = guiasUnicas.reduce((acc, guia) => {
      const chave = `${guia.convenio_nome}_${guia.unidade_nome}`.replace(/\s/g, '_');
      
      if (!acc[chave]) {
        acc[chave] = {
          convenio: guia.convenio_nome,
          unidade: guia.unidade_nome,
          guias: [],
          totalValor: 0,
          totalGuias: 0,
          pendentes: 0,
          revisadas: 0,
          faturadas: 0
        };
      }
      
      // Verificar se a guia já existe no grupo para evitar duplicatas
      const guiaExiste = acc[chave].guias.some((g: any) => g.id === guia.id);
      if (!guiaExiste) {
        acc[chave].guias.push(guia);
        // Garantir que o valor é um número válido
        const valorProcedimento = Number(guia.valor_procedimento) || 0;
        acc[chave].totalValor += valorProcedimento;
        acc[chave].totalGuias += 1;
        
        // Contar status corretamente
        if (guia.status_faturamento === 'pendente') {
          acc[chave].pendentes += 1;
        } else if (guia.status_faturamento === 'revisada') {
          acc[chave].revisadas += 1;
        } else if (guia.status_faturamento === 'faturada') {
          acc[chave].faturadas += 1;
        }
      }
      
      return acc;
    }, {} as any);

    // Debug detalhado
    Object.entries(agrupadas).forEach(([chave, grupo]: [string, any]) => {
      console.log(`Grupo ${chave}:`, {
        totalGuias: grupo.totalGuias,
        totalValor: grupo.totalValor,
        guiasNoArray: grupo.guias.length
      });
    });
    
    setGuiasAgrupadas(agrupadas);
  };

  const marcarComoRevisada = async (guiaId: number, observacoes: string = '') => {
    try {
      const { error } = await supabase
        .from('status_faturamento')
        .upsert({
          agendamento_id: guiaId,
          status: 'revisada',
          data_revisao: new Date().toISOString(),
          usuario_revisao: 'Usuario Atual', // Aqui você pode pegar do contexto de autenticação
          observacoes: observacoes,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Atualizar estado local
      setGuias(prev => prev.map(guia => 
        guia.id === guiaId 
          ? { 
              ...guia, 
              status_faturamento: 'revisada' as const, 
              data_revisao: new Date().toISOString(),
              usuario_revisao: 'Usuario Atual',
              observacoes_faturamento: observacoes
            }
          : guia
      ));
      
      // Fechar modal
      setModalRevisao({ isOpen: false, guiaId: null, observacoes: '' });
      
      console.log('Guia marcada como revisada:', guiaId);
    } catch (error) {
      console.error('Erro ao marcar guia como revisada:', error);
      alert('Erro ao marcar guia como revisada. Tente novamente.');
    }
  };

  const marcarComoFaturada = async (convenio: string, unidade: string) => {
    try {
      const guiasParaFaturar = guias.filter(
        guia => guia.convenio_nome === convenio && 
                guia.unidade_nome === unidade && 
                guia.status_faturamento === 'revisada'
      );

      const loteId = `LOTE_${convenio.replace(/\s/g, '_')}_${unidade.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}`;

      // Atualizar status no banco
      for (const guia of guiasParaFaturar) {
        const { error } = await supabase
          .from('status_faturamento')
          .update({
            status: 'faturada',
            data_faturamento: new Date().toISOString(),
            usuario_faturamento: 'Usuario Atual', // Aqui você pode pegar do contexto de autenticação
            lote_faturamento: loteId,
            updated_at: new Date().toISOString()
          })
          .eq('agendamento_id', guia.id);

        if (error) throw error;
      }

      // Atualizar estado local
      setGuias(prev => prev.map(guia => 
        guiasParaFaturar.some(g => g.id === guia.id)
          ? { 
              ...guia, 
              status_faturamento: 'faturada' as const, 
              data_faturamento: new Date().toISOString(),
              usuario_faturamento: 'Usuario Atual',
              lote_faturamento: loteId
            }
          : guia
      ));

      alert(`${guiasParaFaturar.length} guias faturadas com sucesso!\nLote: ${loteId}`);
    } catch (error) {
      console.error('Erro ao faturar guias:', error);
      alert('Erro ao faturar guias. Tente novamente.');
    }
  };

  const gerarXML = (convenio: string, unidade: string) => {
    const guiasParaXML = guias.filter(
      guia => guia.convenio_nome === convenio && 
              guia.unidade_nome === unidade && 
              guia.status_faturamento === 'revisada'
    );

    // Garantir que não há duplicatas por ID
    const guiasUnicasXML = guiasParaXML.filter((guia, index, self) => 
      self.findIndex(g => g.id === guia.id) === index
    );

    if (guiasUnicasXML.length === 0) {
      alert('Nenhuma guia revisada encontrada para gerar XML.');
      return;
    }

    const dataHoje = new Date();
    const loteId = `${Date.now()}`;
    // Calcular valor total corretamente com Number
    const valorTotal = guiasUnicasXML.reduce((acc, guia) => {
      const valor = Number(guia.valor_procedimento) || 0;
      return acc + valor;
    }, 0);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.ans.gov.br/padroes/tiss/schemas tissV3_03_00.xsd">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>ENVIO_LOTE_GUIAS</ans:tipoTransacao>
      <ans:sequencialTransacao>${loteId}</ans:sequencialTransacao>
      <ans:dataRegistroTransacao>${dataHoje.toISOString().split('T')[0]}</ans:dataRegistroTransacao>
      <ans:horaRegistroTransacao>${dataHoje.toTimeString().split(' ')[0]}</ans:horaRegistroTransacao>
    </ans:identificacaoTransacao>
    <ans:origem>
      <ans:identificacaoPrestador>
        <ans:codigoPrestadorNaOperadora>123456</ans:codigoPrestadorNaOperadora>
      </ans:identificacaoPrestador>
    </ans:origem>
    <ans:destino>
      <ans:registroANS>${convenio.replace(/\s/g, '').toUpperCase()}</ans:registroANS>
    </ans:destino>
    <ans:versaoPadrao>3.03.00</ans:versaoPadrao>
  </ans:cabecalho>
  <ans:prestadorParaOperadora>
    <ans:loteGuias>
      <ans:numeroLote>${loteId}</ans:numeroLote>
      <ans:guiasTISS>
        ${guiasUnicasXML.map((guia, index) => `
        <ans:guiaSP-SADT>
          <ans:cabecalhoGuia>
            <ans:registroANSOperadora>${convenio.replace(/\s/g, '').toUpperCase()}</ans:registroANSOperadora>
            <ans:numeroGuiaPrestador>${guia.numero_guia}</ans:numeroGuiaPrestador>
            <ans:numeroGuiaOperadora>${guia.numero_guia}</ans:numeroGuiaOperadora>
          </ans:cabecalhoGuia>
          <ans:dadosAutorizacao>
            <ans:numeroGuiaOperadora>${guia.numero_guia}</ans:numeroGuiaOperadora>
            <ans:dataAutorizacao>${guia.data_autorizacao ? new Date(guia.data_autorizacao).toISOString().split('T')[0] : dataHoje.toISOString().split('T')[0]}</ans:dataAutorizacao>
            <ans:senha>${guia.numero_guia}</ans:senha>
            <ans:dataValidadeSenha>${guia.validade_autorizacao ? new Date(guia.validade_autorizacao).toISOString().split('T')[0] : new Date(dataHoje.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}</ans:dataValidadeSenha>
          </ans:dadosAutorizacao>
          <ans:dadosBeneficiario>
            <ans:numeroCarteira>000000000000000${index.toString().padStart(3, '0')}</ans:numeroCarteira>
            <ans:atendimentoRN>S</ans:atendimentoRN>
            <ans:nomeBeneficiario>${guia.paciente_nome}</ans:nomeBeneficiario>
          </ans:dadosBeneficiario>
          <ans:dadosSolicitante>
            <ans:contratadoSolicitante>
              <ans:cnpjContratado>12345678000100</ans:cnpjContratado>
              <ans:nomeContratado>${unidade}</ans:nomeContratado>
            </ans:contratadoSolicitante>
            <ans:profissionalSolicitante>
              <ans:nomeProfissional>Profissional Solicitante</ans:nomeProfissional>
              <ans:conselho>1</ans:conselho>
              <ans:numeroConselho>123456</ans:numeroConselho>
              <ans:UF>SP</ans:UF>
              <ans:CBOS>225125</ans:CBOS>
            </ans:profissionalSolicitante>
          </ans:dadosSolicitante>
          <ans:dadosSolicitacao>
            <ans:dataSolicitacao>${new Date(guia.data_agendamento).toISOString().split('T')[0]}</ans:dataSolicitacao>
            <ans:caraterAtendimento>1</ans:caraterAtendimento>
            <ans:indicacaoClinica>Procedimento solicitado conforme necessidade clínica</ans:indicacaoClinica>
            <ans:procedimentosSolicitados>
              <ans:procedimentoSolicitado>
                <ans:codigoTabela>22</ans:codigoTabela>
                <ans:codigoProcedimento>${guia.codigo_tuss}</ans:codigoProcedimento>
                <ans:quantidadeSolicitada>1</ans:quantidadeSolicitada>
              </ans:procedimentoSolicitado>
            </ans:procedimentosSolicitados>
          </ans:dadosSolicitacao>
          <ans:dadosExecutante>
            <ans:contratadoExecutante>
              <ans:cnpjContratado>12345678000100</ans:cnpjContratado>
              <ans:nomeContratado>${unidade}</ans:nomeContratado>
            </ans:contratadoExecutante>
            <ans:CNES>1234567</ans:CNES>
          </ans:dadosExecutante>
          <ans:dadosAtendimento>
            <ans:tipoAtendimento>04</ans:tipoAtendimento>
            <ans:indicacaoAcidente>0</ans:indicacaoAcidente>
            <ans:tipoConsulta>1</ans:tipoConsulta>
          </ans:dadosAtendimento>
          <ans:procedimentosExecutados>
            <ans:procedimentoExecutado>
              <ans:codigoTabela>22</ans:codigoTabela>
              <ans:codigoProcedimento>${guia.codigo_tuss}</ans:codigoProcedimento>
              <ans:descricaoProcedimento>${guia.especialidade_nome}</ans:descricaoProcedimento>
              <ans:quantidadeExecutada>1</ans:quantidadeExecutada>
              <ans:unidadeMedida>036</ans:unidadeMedida>
              <ans:valorUnitario>${(Number(guia.valor_procedimento) || 0).toFixed(2)}</ans:valorUnitario>
              <ans:valorTotal>${(Number(guia.valor_procedimento) || 0).toFixed(2)}</ans:valorTotal>
              <ans:dataExecucao>${new Date(guia.data_agendamento).toISOString().split('T')[0]}</ans:dataExecucao>
            </ans:procedimentoExecutado>
          </ans:procedimentosExecutados>
          <ans:observacao>Atendimento realizado conforme protocolo clínico</ans:observacao>
          <ans:valorTotal>
            <ans:valorProcedimentos>${(Number(guia.valor_procedimento) || 0).toFixed(2)}</ans:valorProcedimentos>
            <ans:valorDiarias>0.00</ans:valorDiarias>
            <ans:valorTaxasAluguel>0.00</ans:valorTaxasAluguel>
            <ans:valorMateriais>0.00</ans:valorMateriais>
            <ans:valorMedicamentos>0.00</ans:valorMedicamentos>
            <ans:valorOPME>0.00</ans:valorOPME>
            <ans:valorGasesMedicinais>0.00</ans:valorGasesMedicinais>
            <ans:valorTotalGeral>${(Number(guia.valor_procedimento) || 0).toFixed(2)}</ans:valorTotalGeral>
          </ans:valorTotal>
        </ans:guiaSP-SADT>`).join('')}
      </ans:guiasTISS>
      <ans:valorTotalLote>${valorTotal.toFixed(2)}</ans:valorTotalLote>
    </ans:loteGuias>
    <ans:hash>123456789ABCDEF</ans:hash>
  </ans:prestadorParaOperadora>
</ans:mensagemTISS>`;

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TISS_${convenio.replace(/\s/g, '_')}_${unidade.replace(/\s/g, '_')}_${loteId}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`XML TISS gerado com sucesso!\n${guiasUnicasXML.length} guias\nValor total: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nLote: ${loteId}`);
  };

  const exportarPDF = (convenio: string, unidade: string) => {
    const guiasParaExportar = guias.filter(
      guia => guia.convenio_nome === convenio && guia.unidade_nome === unidade
    );

    // Garantir que não há duplicatas por ID
    const guiasUnicasPDF = guiasParaExportar.filter((guia, index, self) => 
      self.findIndex(g => g.id === guia.id) === index
    );

    if (guiasUnicasPDF.length === 0) {
      alert('Nenhuma guia encontrada para exportar.');
      return;
    }

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Relatório de Faturamento', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Convênio: ${convenio}`, 14, 35);
    doc.text(`Unidade: ${unidade}`, 14, 42);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 49);
    
    // Calcular valor total corretamente com Number
    const valorTotal = guiasUnicasPDF.reduce((acc, guia) => {
      const valor = Number(guia.valor_procedimento) || 0;
      return acc + valor;
    }, 0);
    doc.text(`Total: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 56);

    // Tabela
    const tableData = guiasUnicasPDF.map(guia => [
      guia.paciente_nome,
      new Date(guia.data_agendamento).toLocaleDateString('pt-BR'),
      guia.codigo_tuss,
      guia.especialidade_nome,
      `R$ ${(Number(guia.valor_procedimento) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      guia.numero_guia,
      guia.status_faturamento === 'pendente' ? 'Pendente' : 
       guia.status_faturamento === 'revisada' ? 'Revisada' : 'Faturada'
    ]);

    autoTable(doc, {
      head: [['Paciente', 'Data', 'Código TUSS', 'Especialidade', 'Valor', 'Nº Guia', 'Status']],
      body: tableData,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`faturamento_${convenio.replace(/\s/g, '_')}_${unidade.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportarExcel = (convenio: string, unidade: string) => {
    const guiasParaExportar = guias.filter(
      guia => guia.convenio_nome === convenio && guia.unidade_nome === unidade
    );

    // Garantir que não há duplicatas por ID
    const guiasUnicasExcel = guiasParaExportar.filter((guia, index, self) => 
      self.findIndex(g => g.id === guia.id) === index
    );

    if (guiasUnicasExcel.length === 0) {
      alert('Nenhuma guia encontrada para exportar.');
      return;
    }

    const dadosExcel = guiasUnicasExcel.map(guia => ({
      'Paciente': guia.paciente_nome,
      'Data Atendimento': new Date(guia.data_agendamento).toLocaleDateString('pt-BR'),
      'Convênio': guia.convenio_nome,
      'Código TUSS': guia.codigo_tuss,
      'Especialidade': guia.especialidade_nome,
      'Valor': Number(guia.valor_procedimento) || 0,
      'Número da Guia': guia.numero_guia,
      'Data Autorização': guia.data_autorizacao ? new Date(guia.data_autorizacao).toLocaleDateString('pt-BR') : '',
      'Validade Autorização': guia.validade_autorizacao ? new Date(guia.validade_autorizacao).toLocaleDateString('pt-BR') : '',
      'Status': guia.status_faturamento === 'pendente' ? 'Pendente' : 
               guia.status_faturamento === 'revisada' ? 'Revisada' : 'Faturada',
      'Data Revisão': guia.data_revisao ? new Date(guia.data_revisao).toLocaleDateString('pt-BR') : '',
      'Observações': guia.observacoes_faturamento || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dadosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faturamento");

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // Paciente
      { wch: 12 }, // Data
      { wch: 15 }, // Convênio
      { wch: 12 }, // Código TUSS
      { wch: 20 }, // Especialidade
      { wch: 10 }, // Valor
      { wch: 15 }, // Nº Guia
      { wch: 12 }, // Data Autorização
      { wch: 12 }, // Validade
      { wch: 10 }, // Status
      { wch: 12 }, // Data Revisão
      { wch: 30 }  // Observações
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `faturamento_${convenio.replace(/\s/g, '_')}_${unidade.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const guiasFiltradas = guias.filter(guia => {
    return (
      (!filtros.convenio || guia.convenio_nome.includes(filtros.convenio)) &&
      (!filtros.unidade || guia.unidade_nome.includes(filtros.unidade)) &&
      (!filtros.status || guia.status_faturamento === filtros.status) &&
      (!filtros.busca || 
        guia.paciente_nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        guia.numero_guia.includes(filtros.busca)
      )
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando guias...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faturamento</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestão de guias tabuladas e faturamento</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Guias</p>
                <p className="text-xl font-bold">{guias.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                <p className="text-xl font-bold">
                  R$ {guias.reduce((acc, guia) => acc + (guia.valor_procedimento || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nome ou nº guia..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Convênio</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.convenio}
              onChange={(e) => setFiltros(prev => ({ ...prev, convenio: e.target.value }))}
            >
              <option value="">Todos</option>
              {convenios.map(convenio => (
                <option key={convenio.id} value={convenio.nome}>{convenio.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unidade</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.unidade}
              onChange={(e) => setFiltros(prev => ({ ...prev, unidade: e.target.value }))}
            >
              <option value="">Todas</option>
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.nome}>{unidade.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="revisada">Revisada</option>
              <option value="faturada">Faturada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.dataFim}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Guias Agrupadas por Convênio/Unidade */}
      <div className="space-y-6">
        {Object.entries(guiasAgrupadas).map(([chave, grupo]: [string, any]) => (
          <div key={chave} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
            {/* Header do Grupo */}
            <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{grupo.unidade}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{grupo.convenio}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {grupo.totalGuias} guias • R$ {grupo.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {grupo.pendentes} pendentes
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {grupo.revisadas} revisadas
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {grupo.faturadas} faturadas
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Botões sempre visíveis */}
                    <button
                      onClick={() => exportarPDF(grupo.convenio, grupo.unidade)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      title="Exportar todas as guias para PDF"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => exportarExcel(grupo.convenio, grupo.unidade)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Exportar todas as guias para Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel
                    </button>
                    
                    {/* Botões específicos para guias revisadas */}
                    {grupo.revisadas > 0 && (
                      <>
                        <button
                          onClick={() => gerarXML(grupo.convenio, grupo.unidade)}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          title="Gerar XML TISS das guias revisadas"
                        >
                          <Download className="w-4 h-4" />
                          XML
                        </button>
                        <button
                          onClick={() => marcarComoFaturada(grupo.convenio, grupo.unidade)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          title="Faturar guias revisadas"
                        >
                          <FileCheck className="w-4 h-4" />
                          Faturar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Guias */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Paciente
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Data
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Código TUSS
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Especialidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nº Guia
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Autorização
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Validade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {grupo.guias
                    .filter((guia: GuiaFaturamento) => {
                      // Aplicar filtros aqui se necessário
                      return (
                        (!filtros.busca || 
                          guia.paciente_nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                          guia.numero_guia.includes(filtros.busca)
                        ) &&
                        (!filtros.status || guia.status_faturamento === filtros.status)
                      );
                    })
                    .map((guia: GuiaFaturamento, index: number) => (
                    <tr key={`${chave}-${guia.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {guia.paciente_nome}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(guia.data_agendamento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                        {guia.codigo_tuss}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {guia.especialidade_nome}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        R$ {guia.valor_procedimento?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                        {guia.numero_guia}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {guia.data_autorizacao ? new Date(guia.data_autorizacao).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {guia.validade_autorizacao ? new Date(guia.validade_autorizacao).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          guia.status_faturamento === 'pendente' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : guia.status_faturamento === 'revisada'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {guia.status_faturamento === 'pendente' && <Clock className="w-3 h-3 mr-1" />}
                          {guia.status_faturamento === 'revisada' && <Eye className="w-3 h-3 mr-1" />}
                          {guia.status_faturamento === 'faturada' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {guia.status_faturamento === 'pendente' ? 'Pendente' : 
                           guia.status_faturamento === 'revisada' ? 'Revisada' : 'Faturada'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {guia.status_faturamento === 'pendente' && (
                          <button
                            onClick={() => setModalRevisao({ 
                              isOpen: true, 
                              guiaId: guia.id, 
                              observacoes: '' 
                            })}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Revisar
                          </button>
                        )}
                        {guia.status_faturamento === 'revisada' && guia.observacoes_faturamento && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-20" title={guia.observacoes_faturamento}>
                              {guia.observacoes_faturamento}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(guiasAgrupadas).length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma guia tabulada encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            As guias aparecerão aqui após serem tabuladas na recepção
          </p>
        </div>
      )}
      
      {/* Modal de Revisão */}
      {modalRevisao.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revisar Guia
              </h3>
              <button
                onClick={() => setModalRevisao({ isOpen: false, guiaId: null, observacoes: '' })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações (opcional):
              </label>
              <textarea
                value={modalRevisao.observacoes}
                onChange={(e) => setModalRevisao(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Digite observações sobre a revisão da guia..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalRevisao({ isOpen: false, guiaId: null, observacoes: '' })}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalRevisao.guiaId) {
                    marcarComoRevisada(modalRevisao.guiaId, modalRevisao.observacoes);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Marcar como Revisada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
