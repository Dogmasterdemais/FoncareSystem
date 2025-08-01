// Teste de sintaxe dos componentes criados

// Hook
import { useAgendamentoView } from '@/hooks/useAgendamentoView';

// Componentes
import { SeletorSalasAgendamento } from '@/components/agendamento/SeletorSalasAgendamento';
import { AgendaRecepcao } from '@/components/recepcao/AgendaRecepcao';

console.log('✅ Todos os imports estão corretos!');

export default function TesteImports() {
  return (
    <div>
      <h1>Teste de Imports</h1>
      <p>Todos os componentes foram importados com sucesso!</p>
    </div>
  );
}
