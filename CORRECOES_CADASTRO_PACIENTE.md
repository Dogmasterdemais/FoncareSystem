# Correções no Cadastro de Pacientes

## Mudanças Realizadas

### 1. ✅ Remoção do Campo Unidade do Cadastro

**Problema**: O campo unidade estava sendo exibido como um campo de entrada manual no cadastro.

**Solução**: 
- Removido o step "Unidade" do formulário de cadastro
- A unidade agora é preenchida automaticamente baseada na unidade selecionada no seletor superior
- Adicionado aviso visual quando nenhuma unidade está selecionada
- A validação garante que uma unidade esteja selecionada antes do cadastro

**Arquivos modificados**:
- `src/components/PacienteCadastroStepper.tsx`
- `src/components/PacienteModal.tsx`

### 2. ✅ Correção do Erro "documento" Column

**Problema**: Erro "Could not find the 'documento' column of 'pacientes' in the schema cache"

**Solução**: 
- Removido o campo `documento` do código de inserção
- Mantidos os campos `cpf` e `rg` separadamente
- Criado script SQL para adicionar o campo `documento` se necessário

**Script SQL**: `fix_documento_pacientes.sql`

### 3. ✅ Melhorada a Revisão do Paciente

**Problema**: A revisão aparecia como código JSON bruto.

**Solução**: 
- Reformulada a tela de revisão com interface amigável
- Exibição dos dados em formato legível
- Destacada a unidade selecionada automaticamente
- Melhor organização visual dos campos

## Como Aplicar as Correções

### 1. Banco de Dados
Execute o script SQL no Supabase Dashboard:
```sql
-- Conteúdo do arquivo fix_documento_pacientes.sql
```

### 2. Código
Os arquivos já foram atualizados com as correções.

### 3. Validação
1. Selecione uma unidade no seletor superior
2. Acesse o cadastro de pacientes
3. Preencha os dados do paciente
4. Verifique na tela de revisão se a unidade aparece corretamente
5. Confirme o cadastro

## Fluxo de Cadastro Atualizado

1. **Seleção de Unidade**: Usuário seleciona unidade no menu superior
2. **Dados Básicos**: Nome, sexo, data de nascimento, email, telefone
3. **Documentos**: CPF e RG
4. **Endereço**: CEP com busca automática
5. **Convênio**: Seleção do plano de saúde
6. **Dados Adicionais**: Profissão, estado civil, observações
7. **Responsável**: Dados do responsável (se menor de idade)
8. **Documentos**: Upload de arquivos (funcionalidade futura)
9. **Revisão**: Visualização amigável dos dados + unidade selecionada

## Benefícios

- ✅ Cadastro mais intuitivo (unidade automática)
- ✅ Erro de banco corrigido
- ✅ Interface de revisão melhorada
- ✅ Validação de unidade obrigatória
- ✅ Consistência nos dados

## Observações

- A unidade não pode mais ser alterada após o cadastro (removida do modal de edição)
- O campo documento foi preparado para futuras implementações
- A interface mantém compatibilidade com o contexto de unidades
