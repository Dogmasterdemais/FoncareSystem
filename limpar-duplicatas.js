const fs = require('fs');

console.log('🧹 === LIMPEZA DE DUPLICATAS ===');

// Ler o arquivo SQL
const sqlContent = fs.readFileSync('./salas_rows.sql', 'utf8');
console.log('📄 Arquivo lido:', sqlContent.length, 'caracteres');

// Extrair os VALUES
const valuesMatch = sqlContent.match(/VALUES\s+(.+)$/);
if (!valuesMatch) {
  console.error('❌ Não foi possível extrair VALUES');
  process.exit(1);
}

const valuesString = valuesMatch[1];
console.log('✅ VALUES extraídos');

// Parse das linhas (cada registro)
console.log('🔄 Processando registros...');

// Separar os registros - cada um está entre parênteses
const registros = [];
let depth = 0;
let currentRecord = '';
let inString = false;
let escapeNext = false;

for (let i = 0; i < valuesString.length; i++) {
  const char = valuesString[i];
  
  if (escapeNext) {
    currentRecord += char;
    escapeNext = false;
    continue;
  }
  
  if (char === '\\') {
    escapeNext = true;
    currentRecord += char;
    continue;
  }
  
  if (char === "'" && !escapeNext) {
    inString = !inString;
  }
  
  if (!inString) {
    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
      if (depth === 0) {
        // Fim de um registro
        currentRecord += char;
        registros.push(currentRecord.trim());
        currentRecord = '';
        continue;
      }
    }
  }
  
  currentRecord += char;
}

console.log('📊 Total de registros encontrados:', registros.length);

// Detectar duplicatas por nome da sala e unidade_id
const registrosUnicos = new Map();
const duplicatasEncontradas = [];

registros.forEach((registro, index) => {
  // Extrair dados básicos do registro
  const match = registro.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'/);
  if (match) {
    const [, id, unidade_id, nome] = match;
    const chave = `${unidade_id}|${nome}`;
    
    if (registrosUnicos.has(chave)) {
      duplicatasEncontradas.push({
        index,
        id,
        unidade_id,
        nome,
        registro,
        original: registrosUnicos.get(chave)
      });
    } else {
      registrosUnicos.set(chave, {
        index,
        id,
        unidade_id,
        nome,
        registro
      });
    }
  }
});

console.log('✅ Análise concluída:');
console.log('📊 Registros únicos:', registrosUnicos.size);
console.log('🔄 Duplicatas encontradas:', duplicatasEncontradas.length);

if (duplicatasEncontradas.length > 0) {
  console.log('\n🔍 === DUPLICATAS DETECTADAS ===');
  
  // Agrupar por sala e unidade
  const grupos = new Map();
  duplicatasEncontradas.forEach(dup => {
    const chave = `${dup.nome} (${dup.unidade_id})`;
    if (!grupos.has(chave)) {
      grupos.set(chave, []);
    }
    grupos.get(chave).push(dup);
  });
  
  grupos.forEach((dups, chave) => {
    console.log(`\n📍 ${chave}:`);
    dups.forEach(dup => {
      console.log(`  🔸 ID: ${dup.id}`);
    });
  });
  
  // Criar arquivo limpo
  const registrosLimpos = Array.from(registrosUnicos.values());
  console.log('\n🧹 Criando arquivo limpo...');
  console.log('📊 Registros finais:', registrosLimpos.length);
  
  // Montar novo SQL
  const novoSQL = `INSERT INTO "public"."salas" ("id", "unidade_id", "nome", "numero", "tipo", "capacidade", "equipamentos", "ativo", "observacoes", "created_at", "updated_at", "cor", "especialidade_id", "capacidade_maxima") VALUES ${registrosLimpos.map(r => r.registro).join(', ')};`;
  
  // Salvar arquivo limpo
  fs.writeFileSync('./salas_rows_limpo.sql', novoSQL);
  
  console.log('✅ Arquivo limpo salvo como: salas_rows_limpo.sql');
  console.log('📊 Economia:', duplicatasEncontradas.length, 'registros removidos');
  console.log('📊 Tamanho original:', sqlContent.length, 'caracteres');
  console.log('📊 Tamanho limpo:', novoSQL.length, 'caracteres');
  
} else {
  console.log('✅ Nenhuma duplicata encontrada! O arquivo já está limpo.');
}

console.log('\n🎯 Processo concluído!');
