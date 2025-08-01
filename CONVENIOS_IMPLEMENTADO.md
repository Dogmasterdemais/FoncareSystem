# 🏥 Integração com Tabela de Convênios

## ✨ Funcionalidade Implementada

O sistema agora utiliza a **tabela `convenios`** do banco de dados para carregar dinamicamente os convênios disponíveis no cadastro de pacientes!

### 🎯 Como Funciona

1. **Carregamento Automático**: Os convênios são carregados automaticamente da tabela `convenios`
2. **Dropdown Dinâmico**: Campo convertido de input para select dropdown
3. **Dados da Tabela**: Utiliza `convenios.nome` como display principal
4. **Filtro por Status**: Apenas convênios ativos (`ativo = true`) são carregados
5. **Ordenação**: Convênios ordenados alfabeticamente por nome

### 📋 Campos Utilizados da Tabela `convenios`

- **`id`**: Identificador único (valor salvo no campo `convenio_id` do paciente)
- **`nome`**: Nome do convênio (exibido no dropdown)
- **`tipo`**: Tipo do convênio (exibido entre parênteses)
- **`codigo`**: Código do convênio (para referência futura)
- **`ativo`**: Status do convênio (apenas ativos são carregados)

### 🎨 Interface do Usuário

#### Antes (Input manual):
```
ID do Convênio: [_____________]
```

#### Agora (Dropdown dinâmico):
```
Convênio *: [Selecione um convênio ▼]
            [Particular (Particular)   ]
            [SUS (Público)             ]
            [Unimed (Plano de Saúde)   ]
            [...]
```

### 🔧 Código Implementado

#### 1. Estados Adicionados:
```typescript
const [convenios, setConvenios] = useState<any[]>([]);
const [carregandoConvenios, setCarregandoConvenios] = useState(false);
```

#### 2. Função para Carregar Convênios:
```typescript
async function carregarConvenios() {
  setCarregandoConvenios(true);
  try {
    const { data, error } = await supabase
      .from('convenios')
      .select('id, nome, tipo, codigo')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao carregar convênios:', error);
    } else {
      setConvenios(data || []);
    }
  } catch (error) {
    console.error('Erro ao carregar convênios:', error);
  } finally {
    setCarregandoConvenios(false);
  }
}
```

#### 3. useEffect para Carregar Dados:
```typescript
useEffect(() => {
  carregarConvenios();
}, []);
```

#### 4. Dropdown Component:
```typescript
<select 
  name="convenio_id" 
  value={form.convenio_id} 
  onChange={handleChange} 
  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none cursor-pointer"
  disabled={carregandoConvenios}
>
  <option value="">Selecione um convênio</option>
  {convenios.map((convenio) => (
    <option key={convenio.id} value={convenio.id}>
      {convenio.nome} {convenio.tipo && `(${convenio.tipo})`}
    </option>
  ))}
</select>
```

### 🎯 Benefícios

1. **📊 Dados Consistentes**: Convênios sempre atualizados da base de dados
2. **🚀 Facilidade de Uso**: Não precisa digitar ou lembrar IDs
3. **🔄 Dinâmico**: Novos convênios aparecem automaticamente
4. **✅ Validação**: Apenas convênios válidos podem ser selecionados
5. **🎨 Interface Melhorada**: Dropdown mais intuitivo que input manual
6. **🌙 Dark Mode**: Suporte completo ao tema escuro
7. **📱 Responsivo**: Funciona em todos os dispositivos

### 💾 Relação com o Banco de Dados

```sql
-- Tabela convenios (origem dos dados)
CREATE TABLE convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(20),
  tipo VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela pacientes (destino do convenio_id)
ALTER TABLE pacientes 
ADD COLUMN convenio_id UUID,
ADD CONSTRAINT fk_pacientes_convenio 
FOREIGN KEY (convenio_id) REFERENCES convenios(id);
```

### 🧪 Dados de Exemplo

A migração já inclui convênios de exemplo:
- **Particular** (Particular)
- **SUS** (Público)  
- **Unimed** (Plano de Saúde)
- **Bradesco Saúde** (Plano de Saúde)
- **Amil** (Plano de Saúde)

### 🔍 Como Testar

1. **Acesse**: http://localhost:3003/nac/cadastrar-paciente
2. **Vá para o passo 4** (Convênio)
3. **Clique no dropdown** "Convênio"
4. **Observe**: Lista de convênios carregados da tabela
5. **Selecione**: Um convênio da lista
6. **Verifique**: Valor salvo no banco de dados

### 🎉 Resultado

A funcionalidade torna o **cadastro de convênios muito mais profissional e confiável**, eliminando erros de digitação e garantindo que apenas convênios válidos sejam selecionados!
