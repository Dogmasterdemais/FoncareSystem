// Script para testar variáveis de ambiente Focus NFe
console.log('🧪 Testando variáveis de ambiente Focus NFe...');

console.log('📋 Variáveis disponíveis:');
console.log('NEXT_PUBLIC_FOCUS_NFE_TOKEN:', process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN ? '✅ Configurado' : '❌ Não encontrado');
console.log('NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT:', process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || '❌ Não encontrado');

if (process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN) {
  console.log('🔑 Token length:', process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN.length);
  console.log('🔑 Token preview:', process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN.substring(0, 10) + '...');
} else {
  console.log('❌ Token não encontrado!');
  console.log('💡 Verifique se NEXT_PUBLIC_FOCUS_NFE_TOKEN está no .env.local');
  console.log('💡 Reinicie o servidor após adicionar variáveis de ambiente');
}

// Testar serviço
import FocusNFeService from '../src/services/focusNFeService';

const service = new FocusNFeService();
console.log('🔧 Serviço configurado:', service.isConfigured());
console.log('📊 Config info:', service.getConfigInfo());
