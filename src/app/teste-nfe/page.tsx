import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import FocusNFeService from '../../services/focusNFeService';
import { 
  FileText, 
  Send, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TestTube,
  Play,
  RefreshCw,
  Copy,
  Eye
} from 'lucide-react';

// Configuração Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Dados de teste pré-configurados para NFSe
const dadosTeste = [
  {
    id: 'teste1',
    nome: 'Teste NFSe - Pessoa Física',
    destinatario_nome: 'João Silva Santos',
    destinatario_documento: '12345678901',
    destinatario_email: 'joao.teste@email.com',
    destinatario_endereco: 'Rua das Flores, 123, Centro, São Paulo - SP',
    destinatario_telefone: '(11) 99999-9999',
    valor_servicos: '150.00',
    discriminacao_servicos: 'Sessão de fisioterapia pediátrica - Atendimento individual com exercícios terapêuticos específicos para desenvolvimento motor.',
    observacoes: 'NFSe de teste emitida em ambiente de homologação'
  },
  {
    id: 'teste2',
    nome: 'Teste NFSe - Pessoa Jurídica',
    destinatario_nome: 'Clínica Pediatria Ltda',
    destinatario_documento: '12345678000190',
    destinatario_email: 'financeiro@clinicateste.com.br',
    destinatario_endereco: 'Av. Paulista, 1000, Bela Vista, São Paulo - SP',
    destinatario_telefone: '(11) 3333-4444',
    valor_servicos: '500.00',
    discriminacao_servicos: 'Pacote de 5 sessões de terapia ocupacional infantil - Atendimento especializado em desenvolvimento neuropsicomotor.',
    observacoes: 'NFSe de teste - Convênio empresarial'
  },
  {
    id: 'teste3',
    nome: 'Teste NFSe - Valor Baixo',
    destinatario_nome: 'Maria Oliveira Lima',
    destinatario_documento: '98765432100',
    destinatario_email: 'maria.teste@gmail.com',
    destinatario_endereco: 'Rua da Consolação, 500, Consolação, São Paulo - SP',
    destinatario_telefone: '(11) 88888-7777',
    valor_servicos: '80.00',
    discriminacao_servicos: 'Consulta de avaliação fonoaudiológica - Primeira consulta com anamnese completa e avaliação inicial.',
    observacoes: 'NFSe de teste - Primeira consulta'
  }
];

const TesteNFe: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [focusNFeService] = useState(() => new FocusNFeService());
  const [testeAtivo, setTesteAtivo] = useState<string | null>(null);
  const [nfesCriadas, setNfesCriadas] = useState<any[]>([]);

  // Função para calcular valores fiscais
  const calcularValoresFiscais = (valorServicos: number) => {
    const iss = (valorServicos * 2.00) / 100;
    const pis = (valorServicos * 0.65) / 100;
    const cofins = (valorServicos * 3.00) / 100;
    const irrf = (valorServicos * 1.50) / 100;
    const csll = (valorServicos * 1.00) / 100;
    
    const totalImpostos = iss + pis + cofins + irrf + csll;
    const valorLiquido = valorServicos - totalImpostos;
    
    return {
      iss,
      pis,
      cofins,
      irrf,
      csll,
      totalImpostos,
      valorLiquido
    };
  };

  // Criar NFe de teste no banco
  const criarNFeTeste = async (dadosTeste: any) => {
    const valorServicos = parseFloat(dadosTeste.valor_servicos);
    const valores = calcularValoresFiscais(valorServicos);

    const nfeData = {
      destinatario_nome: dadosTeste.destinatario_nome,
      destinatario_documento: dadosTeste.destinatario_documento,
      destinatario_email: dadosTeste.destinatario_email,
      destinatario_endereco: dadosTeste.destinatario_endereco,
      destinatario_telefone: dadosTeste.destinatario_telefone,
      natureza_operacao: 'Prestação de Serviços',
      codigo_servico: '04472',
      valor_servicos: valorServicos,
      aliquota_iss: 2.00,
      valor_iss: valores.iss,
      pis: 0.65,
      cofins: 3.00,
      irrf: 1.50,
      csll: 1.00,
      valor_liquido: valores.valorLiquido,
      discriminacao_servicos: dadosTeste.discriminacao_servicos,
      observacoes: dadosTeste.observacoes,
      data_emissao: new Date().toISOString().split('T')[0],
      status: 'rascunho' as const
    };

    const { data, error } = await supabase
      .from('nfes')
      .insert([nfeData])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Executar teste de emissão
  const executarTeste = async (dadosTeste: any) => {
    setLoading(true);
    setTesteAtivo(dadosTeste.id);
    setResultado(null);

    try {
      console.log(`🧪 Iniciando teste: ${dadosTeste.nome}`);
      
      // Passo 1: Criar NFe no banco
      console.log('📝 Passo 1: Criando NFe no banco...');
      const nfeCriada = await criarNFeTeste(dadosTeste);
      console.log('✅ NFe criada com ID:', nfeCriada.id);

      // Atualizar lista de NFes criadas
      setNfesCriadas(prev => [...prev, nfeCriada]);

      // Passo 2: Preparar dados para Focus NFe
      console.log('🔧 Passo 2: Preparando dados para transmissão...');
      const dados = {
        natureza_operacao: nfeCriada.natureza_operacao,
        data_emissao: nfeCriada.data_emissao,
        discriminacao: nfeCriada.discriminacao_servicos,
        cpf_cnpj_tomador: nfeCriada.destinatario_documento,
        razao_social_tomador: nfeCriada.destinatario_nome,
        logradouro_tomador: 'Rua Teste',
        numero_tomador: '123',
        bairro_tomador: 'Centro',
        codigo_municipio_tomador: '3550308', // São Paulo
        uf_tomador: 'SP',
        cep_tomador: '01000000',
        email_tomador: nfeCriada.destinatario_email,
        telefone_tomador: nfeCriada.destinatario_telefone,
        valor_servicos: nfeCriada.valor_servicos,
        observacoes: nfeCriada.observacoes
      };

      // Passo 3: Transmitir para Focus NFe
      console.log('📡 Passo 3: Transmitindo para Focus NFe...');
      const resultadoTransmissao = await focusNFeService.emitirNFSe(dados);

      if (resultadoTransmissao.sucesso) {
        // Atualizar NFe com dados de retorno
        await supabase
          .from('nfes')
          .update({ 
            status: 'autorizada',
            chave_acesso: resultadoTransmissao.chaveAcesso || resultadoTransmissao.nfeId,
            protocolo: resultadoTransmissao.protocolo,
            observacoes: nfeCriada.observacoes + `\n\nReferência Focus NFe: ${resultadoTransmissao.nfeId}`
          })
          .eq('id', nfeCriada.id);

        setResultado({
          sucesso: true,
          nfeId: nfeCriada.id,
          dadosTeste: dadosTeste.nome,
          chaveAcesso: resultadoTransmissao.chaveAcesso,
          protocolo: resultadoTransmissao.protocolo,
          mensagem: resultadoTransmissao.mensagem,
          valorLiquido: nfeCriada.valor_liquido
        });

        console.log('✅ Teste concluído com sucesso!');
      } else {
        // Erro na transmissão
        await supabase
          .from('nfes')
          .update({ 
            status: 'erro',
            erro_processamento: resultadoTransmissao.mensagem
          })
          .eq('id', nfeCriada.id);

        setResultado({
          sucesso: false,
          nfeId: nfeCriada.id,
          dadosTeste: dadosTeste.nome,
          erro: resultadoTransmissao.mensagem
        });

        console.log('❌ Erro no teste:', resultadoTransmissao.mensagem);
      }

    } catch (error) {
      console.error('💥 Erro no teste:', error);
      setResultado({
        sucesso: false,
        dadosTeste: dadosTeste.nome,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
      setTesteAtivo(null);
    }
  };

  // Copiar dados de teste
  const copiarDados = (dados: any) => {
    const texto = `
Dados de Teste - ${dados.nome}
=====================================
Nome: ${dados.destinatario_nome}
Documento: ${dados.destinatario_documento}
Email: ${dados.destinatario_email}
Endereço: ${dados.destinatario_endereco}
Telefone: ${dados.destinatario_telefone}
Valor: R$ ${dados.valor_servicos}
Serviços: ${dados.discriminacao_servicos}
Observações: ${dados.observacoes}
    `.trim();

    navigator.clipboard.writeText(texto);
    alert('📋 Dados copiados para a área de transferência!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TestTube className="w-8 h-8 text-blue-600" />
          Teste de Emissão NFSe
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sistema de teste para validar a emissão de Notas Fiscais de Serviço Eletrônicas (NFSe) com o token Focus NFe
        </p>
      </div>

      {/* Status do Sistema */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📊 Status do Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-blue-600 dark:text-blue-400">Token Focus NFe</div>
            <div className="font-bold text-green-600">✅ Configurado</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-blue-600 dark:text-blue-400">Ambiente</div>
            <div className="font-bold text-orange-600">🧪 Homologação</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-blue-600 dark:text-blue-400">Campos Fiscais</div>
            <div className="font-bold text-green-600">🔒 Travados</div>
          </div>
        </div>
      </div>

      {/* Cenários de Teste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {dadosTeste.map((teste) => (
          <div key={teste.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {teste.nome}
              </h3>
              <TestTube className="w-5 h-5 text-blue-600" />
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Cliente:</span>
                <p className="font-medium">{teste.destinatario_nome}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Documento:</span>
                <p className="font-mono text-sm">{teste.destinatario_documento}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Valor:</span>
                <p className="font-bold text-green-600">R$ {teste.valor_servicos}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Valor Líquido:</span>
                <p className="font-bold text-blue-600">
                  R$ {calcularValoresFiscais(parseFloat(teste.valor_servicos)).valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => executarTeste(teste)}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {testeAtivo === teste.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {testeAtivo === teste.id ? 'Testando...' : 'Executar Teste'}
              </button>
              
              <button
                onClick={() => copiarDados(teste)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copiar Dados
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resultado do Teste */}
      {resultado && (
        <div className={`rounded-lg p-6 mb-6 ${resultado.sucesso 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {resultado.sucesso ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <h3 className={`text-lg font-semibold ${resultado.sucesso ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
              {resultado.sucesso ? '✅ Teste Executado com Sucesso!' : '❌ Erro no Teste'}
            </h3>
          </div>

          <div className="space-y-2">
            <p><strong>Cenário:</strong> {resultado.dadosTeste}</p>
            {resultado.sucesso ? (
              <>
                {resultado.chaveAcesso && <p><strong>Chave de Acesso:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{resultado.chaveAcesso}</code></p>}
                {resultado.protocolo && <p><strong>Protocolo:</strong> {resultado.protocolo}</p>}
                {resultado.valorLiquido && <p><strong>Valor Líquido:</strong> R$ {resultado.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                <p><strong>Mensagem:</strong> {resultado.mensagem}</p>
              </>
            ) : (
              <p><strong>Erro:</strong> {resultado.erro}</p>
            )}
          </div>
        </div>
      )}

      {/* NFes Criadas */}
      {nfesCriadas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            NFes Criadas nos Testes ({nfesCriadas.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {nfesCriadas.map((nfe) => (
                  <tr key={nfe.id}>
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{nfe.destinatario_nome}</div>
                        <div className="text-sm text-gray-500">{nfe.destinatario_documento}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm text-gray-900 dark:text-white">
                        R$ {nfe.valor_servicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        nfe.status === 'autorizada' ? 'bg-green-100 text-green-800' :
                        nfe.status === 'erro' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {nfe.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => window.open(`/financeiro`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Ver no Sistema
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📝 Como Usar Este Teste
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>Escolha um dos cenários de teste acima</li>
          <li>Clique em "Executar Teste" para criar e transmitir uma NFSe</li>
          <li>Aguarde o processamento (pode levar alguns segundos)</li>
          <li>Verifique o resultado na seção de resultado</li>
          <li>As NFSe criadas aparecerão na tabela abaixo</li>
          <li>Use "Ver no Sistema" para verificar no módulo financeiro</li>
        </ol>
        
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Importante:</strong> Este é um ambiente de homologação. As NFSe emitidas são apenas para teste e não têm validade fiscal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TesteNFe;
