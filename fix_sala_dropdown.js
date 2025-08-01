const fs = require('fs');

// Ler o arquivo
let content = fs.readFileSync('src/app/nac/agendamentos/page.tsx', 'utf8');

// Primeiro, adicionar o estado para o dropdown se não existir
if (!content.includes('showSalaDropdown')) {
  content = content.replace(
    'const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);',
    'const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);\n  const [showSalaDropdown, setShowSalaDropdown] = useState(false);'
  );
}

// Substituir o select por dropdown customizado
const selectPattern = /<select[\s\S]*?value={formData\.sala_id}[\s\S]*?<\/select>/;
const newDropdown = `<div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSalaDropdown(!showSalaDropdown)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
                  >
                    {formData.sala_id ? (
                      (() => {
                        const salaSelecionada = salas.find(s => s.id === formData.sala_id);
                        return salaSelecionada ? (
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-5 h-5 rounded-md border border-white shadow-sm"
                              style={{backgroundColor: salaSelecionada.cor || '#6B7280'}}
                            ></div>
                            <span>{salaSelecionada.nome} {salaSelecionada.tipo && \`(\${salaSelecionada.tipo})\`}</span>
                          </div>
                        ) : 'Sala não encontrada';
                      })()
                    ) : (
                      <span className="text-slate-500">Selecione uma sala...</span>
                    )}
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showSalaDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {salas.length === 0 ? (
                        <div className="px-4 py-3 text-slate-500 text-center">
                          Nenhuma sala encontrada para esta unidade
                        </div>
                      ) : (
                        salas.map(sala => (
                          <button
                            key={sala.id}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData, 
                                sala_id: sala.id,
                                duracao_minutos: 60,
                                total_sessoes: 1
                              });
                              setShowSalaDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-3 transition-colors"
                          >
                            <div 
                              className="w-5 h-5 rounded-md border border-white shadow-sm flex-shrink-0"
                              style={{backgroundColor: sala.cor || '#6B7280'}}
                            ></div>
                            <span className="flex-1">{sala.nome} {sala.tipo && \`(\${sala.tipo})\`}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>`;

if (selectPattern.test(content)) {
  content = content.replace(selectPattern, newDropdown);
  console.log('✅ Dropdown de salas substituído com sucesso!');
} else {
  console.log('❌ Padrão do select não encontrado');
  console.log('Buscando por select...');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('<select') || line.includes('formData.sala_id')) {
      console.log(`Linha ${index + 1}: ${line.trim()}`);
    }
  });
}

// Salvar o arquivo
fs.writeFileSync('src/app/nac/agendamentos/page.tsx', content);
console.log('Arquivo salvo!');
