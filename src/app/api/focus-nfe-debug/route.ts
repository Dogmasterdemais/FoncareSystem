import { NextRequest, NextResponse } from 'next/server';

// API Route simplificada para debug
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 PROXY DEBUG: Recebendo requisição');
    
    const token = process.env.FOCUS_NFE_TOKEN || process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    
    if (!token) {
      console.error('❌ Token não encontrado');
      return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
    }

    console.log('🔑 Token encontrado:', token ? `${token.substring(0, 10)}...` : 'NÃO');

    const body = await request.json();
    console.log('📦 Body recebido:', JSON.stringify(body, null, 2));

    // URL base sempre a mesma
    const baseUrl = 'https://api.focusnfe.com.br/v2';
    
    // Para teste, vamos usar um endpoint de teste específico da Focus NFe
    // Ou testar com inutilizacoes que é mais seguro para teste
    const testUrl = `${baseUrl}/nfce/inutilizacoes`;
    
    console.log('🌐 Testando conectividade com:', testUrl);
    
    try {
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'User-Agent': 'FoncareSystem/1.0'
        }
      });
      
      console.log('📡 Status teste GET:', testResponse.status);
      console.log('📄 Headers teste:', Object.fromEntries(testResponse.headers.entries()));
      
      const testText = await testResponse.text();
      console.log('📄 Resposta teste (primeiros 500 chars):', testText.substring(0, 500));
      
      // Status 200 = sucesso, Status 401 = token inválido mas endpoint existe
      if (testResponse.status === 200) {
        return NextResponse.json({
          success: true,
          message: 'Conectividade perfeita! Token válido e API acessível',
          testStatus: testResponse.status,
          testResponse: testText.substring(0, 200)
        });
      } else if (testResponse.status === 401) {
        return NextResponse.json({
          success: false,
          message: 'Token inválido ou expirado, mas API está acessível',
          testStatus: testResponse.status,
          testResponse: testText.substring(0, 200),
          solution: 'Verificar token no arquivo .env.local'
        });
      } else if (testResponse.status === 404) {
        // Se este endpoint também der 404, vamos tentar outro
        console.log('⚠️ Endpoint inutilizacoes também não existe, testando endpoint básico...');
        
        // Tentar com empresa/info que pode existir
        const testUrl2 = `${baseUrl}/../empresa`;
        const testResponse2 = await fetch(testUrl2, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'User-Agent': 'FoncareSystem/1.0'
          }
        });
        
        const testText2 = await testResponse2.text();
        console.log('📄 Teste alternativo status:', testResponse2.status);
        console.log('📄 Teste alternativo resposta:', testText2.substring(0, 300));
        
        return NextResponse.json({
          success: testResponse2.status === 200 || testResponse2.status === 401,
          message: testResponse2.status === 200 ? 'Token válido, mas endpoints NFe precisam ser corrigidos' : 
                   testResponse2.status === 401 ? 'Token inválido' : 'API Focus NFe com problemas de conectividade',
          testStatus: testResponse2.status,
          testResponse: testText2.substring(0, 200),
          originalError: `Endpoint NFe retornou 404: ${testText.substring(0, 100)}`
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `API retornou status inesperado: ${testResponse.status}`,
          testStatus: testResponse.status,
          testResponse: testText.substring(0, 200),
          hint: 'Verificar documentação da API Focus NFe'
        }, { status: 502 });
      }
      
    } catch (fetchError) {
      console.error('💥 Erro na requisição fetch:', fetchError);
      return NextResponse.json({
        error: 'Erro de conectividade com Focus NFe',
        details: fetchError instanceof Error ? fetchError.message : 'Erro desconhecido'
      }, { status: 502 });
    }

  } catch (error) {
    console.error('💥 Erro no proxy:', error);
    return NextResponse.json({
      error: 'Erro interno do proxy',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request); // Redirecionar GET para POST temporariamente
}
