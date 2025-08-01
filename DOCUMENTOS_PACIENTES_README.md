# Sistema de Documentos dos Pacientes

## Visão Geral

O sistema de documentos dos pacientes permite o upload, gerenciamento e organização de documentos importantes de cada paciente, com estrutura organizada por unidade e nome do paciente.

## Estrutura de Pastas no Storage

Os documentos são organizados no bucket `pacientes-documentos` com a seguinte estrutura:

```
pacientes-documentos/
├── nome-da-unidade/
│   ├── nome-do-paciente/
│   │   ├── rg_2025-01-28_14-30-15.pdf
│   │   ├── carteirinha-convenio_2025-01-28_14-32-20.jpg
│   │   ├── pedido-medico_2025-01-28_14-35-10.pdf
│   │   └── comprovante-endereco_2025-01-28_14-40-05.pdf
│   └── outro-paciente/
│       └── ...
└── outra-unidade/
    └── ...
```

## Tipos de Documentos Suportados

1. **RG** (`rg`)
   - Documento de identidade
   - Ícone: 🆔
   - Não possui vencimento

2. **Carteirinha do Convênio** (`carteirinha_convenio`)
   - Carteira do plano de saúde
   - Ícone: 🏥
   - Possui vencimento

3. **Pedido Médico Atualizado** (`pedido_medico`)
   - Prescrições e solicitações médicas
   - Ícone: 📋
   - Não possui vencimento

4. **Comprovante de Endereço** (`comprovante_endereco`)
   - Comprovante de residência
   - Ícone: 🏠
   - Não possui vencimento

## Funcionalidades

### Upload de Documentos
- Suporte para imagens (JPG, PNG, HEIC) e PDFs
- Limite de 50MB por arquivo
- Nomenclatura automática com timestamp
- Validação de tipos de arquivo

### Gerenciamento
- Visualização de documentos
- Download de arquivos
- Exclusão de documentos
- Edição de informações (observações, data de vencimento)

### Status e Controle
- Status de vencimento (válido, vencendo, vencido)
- Progresso da documentação por paciente
- Relatórios de documentos pendentes

## Estrutura do Banco de Dados

### Tabela `pacientes_documentos`

```sql
CREATE TABLE pacientes_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento IN ('rg', 'carteirinha_convenio', 'pedido_medico', 'comprovante_endereco')),
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  tamanho_arquivo INTEGER NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  data_vencimento DATE NULL,
  observacoes TEXT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### View `view_documentos_pacientes`

Facilita consultas com informações completas, incluindo dados do paciente, unidade e status de vencimento.

## Segurança (RLS)

### Políticas Implementadas

1. **SELECT**: Usuários podem ver documentos de pacientes de suas unidades
2. **INSERT**: Usuários podem adicionar documentos para pacientes de suas unidades
3. **UPDATE**: Usuários podem atualizar documentos de pacientes de suas unidades
4. **DELETE**: Usuários podem excluir documentos de pacientes de suas unidades

### Storage Policies

1. **SELECT**: Acesso a arquivos baseado na relação usuário-unidade-paciente
2. **INSERT**: Upload permitido para usuários autenticados
3. **DELETE**: Exclusão baseada na relação usuário-unidade-paciente

## Componentes Frontend

### `DocumentosPacienteManager`
- Componente principal para gerenciamento de documentos
- Interface completa com upload, visualização e exclusão
- Dashboard de status dos documentos

### Integração com `PacienteModal`
- Tab dedicada para documentos
- Acesso direto durante visualização/edição do paciente

## API Service

### `documentosPacienteService`

Principais métodos:

```typescript
// Upload de documento
uploadDocumento(arquivo: File, pacienteId: string, pacienteNome: string, tipo: TipoDocumentoPaciente, dataVencimento?: string, observacoes?: string)

// Listar documentos
listarDocumentos(pacienteId: string)

// Obter URL para visualização
obterUrlDocumento(caminhoArquivo: string)

// Verificar status dos documentos
verificarStatusDocumentos(pacienteId: string)

// Excluir documento
excluirDocumento(documentoId: string)
```

## Instalação e Configuração

### 1. Executar Script SQL
Execute o arquivo `setup_completo_documentos.sql` no Supabase SQL Editor.

### 2. Verificar Configuração
Execute o arquivo `testar_documentos_estrutura.sql` para validar a instalação.

### 3. Configurar Variáveis de Ambiente
Certifique-se de que as variáveis do Supabase estão configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Uso

### No Modal do Paciente
1. Abra o modal de visualização/edição do paciente
2. Navegue para a aba "Documentos"
3. Use o botão "Adicionar Documento" para upload
4. Visualize o progresso e status dos documentos

### Dashboard de Status
- **Verde**: Documentos completos e válidos
- **Amarelo**: Documentos pendentes
- **Vermelho**: Documentos vencidos

## Validações

### Tipos de Arquivo Aceitos
- Imagens: JPG, JPEG, PNG, HEIC
- Documentos: PDF
- Tamanho máximo: 50MB

### Tipos de Documento Obrigatórios
- RG
- Carteirinha do Convênio
- Pedido Médico Atualizado
- Comprovante de Endereço

## Troubleshooting

### Problemas Comuns

1. **Erro de Upload**
   - Verificar tamanho do arquivo (max 50MB)
   - Verificar tipo de arquivo suportado
   - Verificar conexão com Supabase

2. **Problemas de Permissão**
   - Verificar se o usuário está autenticado
   - Verificar relação usuário-unidade-paciente
   - Verificar políticas RLS

3. **Documentos Não Aparecem**
   - Verificar se a coluna `unidade_id` existe na tabela `pacientes`
   - Executar script `adicionar_unidade_pacientes.sql` se necessário

## Melhorias Futuras

- [ ] Compressão automática de imagens
- [ ] OCR para extração de texto
- [ ] Notificações de vencimento
- [ ] Histórico de alterações
- [ ] Backup automático
- [ ] Integração com prontuário eletrônico
