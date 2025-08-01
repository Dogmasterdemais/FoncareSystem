import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route Focus NFe iniciada...');
    
    const token = process.env.FOCUS_NFE_TOKEN || process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    const environment = process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || 'homologacao';
    
    console.log('🔑 Token disponível:', token ? `${token.substring(0, 10)}...` : 'NÃO DEFINIDO');
    console.log('🌍 Ambiente:', environment);
    
    if (!token) {
      console.error('❌ Token Focus NFe não configurado');
      return NextResponse.json(
        { error: 'Token Focus NFe não configurado' },
        { status: 500 }
      );
    }

    // URL correta baseada no ambiente
    const baseUrl = environment === 'producao' 
      ? 'https://api.focusnfe.com.br/v2' 
            : 'https://homologacao.focusnfe.com.br/v2';
        
    const body = await request.json();
    console.log('📨 Dados recebidos:', body);
    
    const { path, method = 'POST', data } = body;
    // Suporte para NFSe (padrão) e NFCe
    const url = path ? `${baseUrl}${path}` : `${baseUrl}/nfse`; // Usar NFSe por padrão
    
    console.log('🌐 URL final:', url);    const requestOptions: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(token + ':').toString('base64')}`, // Formato correto: token:
        'User-Agent': 'FoncareSystem/1.0'
      }
    };

    if (method !== 'GET' && method !== 'DELETE' && data) {
      requestOptions.body = JSON.stringify(data);
      console.log('📤 Enviando dados:', JSON.stringify(data, null, 2));
    }

    console.log('🌐 Fazendo requisição para Focus NFe...');
    const response = await fetch(url, requestOptions);
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Resposta raw:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      console.warn('⚠️ Resposta vazia da Focus NFe');
      return NextResponse.json(
        { 
          error: 'Resposta vazia da API Focus NFCe',
          status: response.status
        },
        { status: response.status }
      );
    }

    try {
      const responseData = JSON.parse(responseText);
      console.log('✅ Parse JSON bem-sucedido:', responseData);
      return NextResponse.json(responseData, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } catch (jsonError) {
      console.error('❌ Erro no parse JSON:', jsonError);
      console.error('📄 Conteúdo que causou erro:', responseText);
      return NextResponse.json(
        { 
          error: 'Erro no parse JSON da resposta Focus NFCe',
          details: responseText,
          json_error: jsonError instanceof Error ? jsonError.message : 'Erro desconhecido'
        },
        { 
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

  } catch (error) {
    console.error('💥 Erro na API Route:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor proxy',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

// Adicionar suporte para OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const token = process.env.FOCUS_NFE_TOKEN || process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token Focus NFe não configurado' },
        { status: 500 }
      );
    }

    const baseUrl = 'https://api.focusnfe.com.br/v2';

    const response = await fetch(`${baseUrl}/nfce`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(token + ':').toString('base64')}`,
        'User-Agent': 'FoncareSystem/1.0'
      }
    });

    const responseData = await response.json().catch(() => ({}));

    return NextResponse.json({
      status: response.status,
      message: response.status < 500 ? 'Conectividade OK' : 'Erro do servidor',
      data: responseData
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Erro de conectividade',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
