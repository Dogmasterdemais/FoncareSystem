#!/usr/bin/env python3
"""
Script de Verificação de Integridade - Módulo Financeiro
FoncareSystem

Este script verifica:
1. Integridade dos dados
2. Consistência das referências
3. Performance das queries
4. Alertas de inconsistências
"""

import psycopg2
import os
from datetime import datetime, timedelta
import json

class FinanceiroIntegrityChecker:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('SUPABASE_DB_HOST', 'localhost'),
            'database': os.getenv('SUPABASE_DB_NAME', 'postgres'),
            'user': os.getenv('SUPABASE_DB_USER', 'postgres'),
            'password': os.getenv('SUPABASE_DB_PASSWORD', ''),
            'port': os.getenv('SUPABASE_DB_PORT', '5432')
        }
        self.alertas = []
        self.verificacoes = {}
    
    def conectar(self):
        """Conecta ao banco de dados"""
        try:
            return psycopg2.connect(**self.db_config)
        except Exception as e:
            self.alertas.append(f"CRÍTICO: Erro de conexão - {e}")
            return None
    
    def verificar_estrutura_tabelas(self):
        """Verifica se todas as tabelas necessárias existem"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            # Verificar tabelas principais
            tabelas_obrigatorias = [
                'contas_pagar', 'contas_receber', 'folha_clt', 
                'folha_pj', 'notas_fiscais', 'unidades',
                'anexos_notas_fiscais', 'atendimentos_guias_tabuladas'
            ]
            
            tabelas_existentes = []
            tabelas_faltando = []
            
            for tabela in tabelas_obrigatorias:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = %s
                    )
                """, (tabela,))
                
                if cursor.fetchone()[0]:
                    tabelas_existentes.append(tabela)
                else:
                    tabelas_faltando.append(tabela)
                    self.alertas.append(f"ERRO: Tabela {tabela} não encontrada")
            
            self.verificacoes['tabelas_existentes'] = tabelas_existentes
            self.verificacoes['tabelas_faltando'] = tabelas_faltando
            
            cursor.close()
            conn.close()
            return len(tabelas_faltando) == 0
            
        except Exception as e:
            self.alertas.append(f"ERRO: Falha na verificação de estrutura - {e}")
            if conn:
                conn.close()
            return False
    
    def verificar_integridade_dados(self):
        """Verifica integridade referencial e consistência dos dados"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            # 1. Verificar referências órfãs
            cursor.execute("""
                SELECT 
                    'contas_pagar' as tabela,
                    COUNT(*) as registros_orfaos
                FROM contas_pagar cp
                LEFT JOIN unidades u ON cp.unidade_id = u.id
                WHERE cp.unidade_id IS NOT NULL AND u.id IS NULL
                
                UNION ALL
                
                SELECT 
                    'contas_receber' as tabela,
                    COUNT(*) as registros_orfaos
                FROM contas_receber cr
                LEFT JOIN unidades u ON cr.unidade_id = u.id
                WHERE cr.unidade_id IS NOT NULL AND u.id IS NULL
            """)
            
            orfaos = cursor.fetchall()
            for tabela, count in orfaos:
                if count > 0:
                    self.alertas.append(f"ATENÇÃO: {count} registros órfãos em {tabela}")
            
            # 2. Verificar valores negativos inconsistentes
            cursor.execute("""
                SELECT 
                    'contas_pagar' as tabela,
                    COUNT(*) as valores_negativos
                FROM contas_pagar 
                WHERE valor < 0
                
                UNION ALL
                
                SELECT 
                    'contas_receber' as tabela,
                    COUNT(*) as valores_negativos
                FROM contas_receber 
                WHERE valor_bruto < 0 OR valor_liquido < 0
            """)
            
            valores_negativos = cursor.fetchall()
            for tabela, count in valores_negativos:
                if count > 0:
                    self.alertas.append(f"ATENÇÃO: {count} valores negativos em {tabela}")
            
            # 3. Verificar consistência de glosas
            cursor.execute("""
                SELECT COUNT(*) 
                FROM contas_receber 
                WHERE valor_liquido > valor_bruto
            """)
            
            glosas_inconsistentes = cursor.fetchone()[0]
            if glosas_inconsistentes > 0:
                self.alertas.append(f"ERRO: {glosas_inconsistentes} registros com valor líquido > bruto")
            
            # 4. Verificar datas futuras excessivas
            cursor.execute("""
                SELECT 
                    'contas_pagar' as tabela,
                    COUNT(*) as datas_futuras
                FROM contas_pagar 
                WHERE data_vencimento > CURRENT_DATE + INTERVAL '2 years'
                
                UNION ALL
                
                SELECT 
                    'contas_receber' as tabela,
                    COUNT(*) as datas_futuras
                FROM contas_receber 
                WHERE data_vencimento > CURRENT_DATE + INTERVAL '2 years'
            """)
            
            datas_futuras = cursor.fetchall()
            for tabela, count in datas_futuras:
                if count > 0:
                    self.alertas.append(f"ATENÇÃO: {count} datas de vencimento > 2 anos em {tabela}")
            
            self.verificacoes['integridade_dados'] = 'verificada'
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            self.alertas.append(f"ERRO: Falha na verificação de integridade - {e}")
            if conn:
                conn.close()
            return False
    
    def verificar_performance_queries(self):
        """Verifica performance das principais consultas"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            queries_teste = [
                {
                    'nome': 'Dashboard Principal',
                    'query': 'SELECT * FROM vw_dashboard_financeiro LIMIT 10'
                },
                {
                    'nome': 'Análise de Glosas',
                    'query': 'SELECT * FROM vw_analise_glosas LIMIT 10'
                },
                {
                    'nome': 'Receitas por Origem',
                    'query': 'SELECT * FROM vw_receitas_origem LIMIT 10'
                },
                {
                    'nome': 'Contas em Atraso',
                    'query': """
                        SELECT COUNT(*) FROM contas_pagar 
                        WHERE status = 'Pendente' AND data_vencimento < CURRENT_DATE
                    """
                }
            ]
            
            tempos_execucao = {}
            
            for teste in queries_teste:
                inicio = datetime.now()
                try:
                    cursor.execute(teste['query'])
                    cursor.fetchall()
                    tempo = (datetime.now() - inicio).total_seconds()
                    tempos_execucao[teste['nome']] = tempo
                    
                    if tempo > 5:  # Mais de 5 segundos
                        self.alertas.append(f"PERFORMANCE: Query '{teste['nome']}' demorou {tempo:.2f}s")
                        
                except Exception as e:
                    self.alertas.append(f"ERRO: Query '{teste['nome']}' falhou - {e}")
                    tempos_execucao[teste['nome']] = 'ERRO'
            
            self.verificacoes['performance_queries'] = tempos_execucao
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            self.alertas.append(f"ERRO: Falha na verificação de performance - {e}")
            if conn:
                conn.close()
            return False
    
    def verificar_alertas_financeiros(self):
        """Verifica alertas específicos do módulo financeiro"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            # 1. Contas em atraso
            cursor.execute("""
                SELECT 
                    'Contas a Pagar' as tipo,
                    COUNT(*) as quantidade,
                    COALESCE(SUM(valor), 0) as valor_total
                FROM contas_pagar 
                WHERE status = 'Pendente' AND data_vencimento < CURRENT_DATE
                
                UNION ALL
                
                SELECT 
                    'Contas a Receber' as tipo,
                    COUNT(*) as quantidade,
                    COALESCE(SUM(valor_liquido), 0) as valor_total
                FROM contas_receber 
                WHERE status = 'Pendente' AND data_vencimento < CURRENT_DATE
            """)
            
            contas_atraso = cursor.fetchall()
            for tipo, qtd, valor in contas_atraso:
                if qtd > 0:
                    self.alertas.append(f"ATENÇÃO: {qtd} {tipo} em atraso (R$ {valor:,.2f})")
            
            # 2. Glosas altas
            cursor.execute("""
                SELECT 
                    COUNT(*) as registros_alta_glosa,
                    AVG(percentual_glosa) as percentual_medio
                FROM (
                    SELECT 
                        (valor_glosa::float / NULLIF(valor_bruto, 0)) * 100 as percentual_glosa
                    FROM contas_receber 
                    WHERE valor_bruto > 0
                ) sq
                WHERE percentual_glosa > 30
            """)
            
            resultado_glosa = cursor.fetchone()
            if resultado_glosa[0] > 0:
                self.alertas.append(f"ATENÇÃO: {resultado_glosa[0]} registros com glosa > 30% (média: {resultado_glosa[1]:.1f}%)")
            
            # 3. Fluxo de caixa crítico
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END), 0) as entradas,
                    COALESCE(SUM(CASE WHEN tipo = 'Saida' THEN valor ELSE 0 END), 0) as saidas
                FROM (
                    SELECT valor_liquido as valor, 'Entrada' as tipo
                    FROM contas_receber 
                    WHERE data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                    
                    UNION ALL
                    
                    SELECT valor as valor, 'Saida' as tipo
                    FROM contas_pagar 
                    WHERE data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                ) fluxo
            """)
            
            entradas, saidas = cursor.fetchone()
            saldo_projetado = entradas - saidas
            
            if saldo_projetado < 0:
                self.alertas.append(f"CRÍTICO: Fluxo de caixa negativo próximos 30 dias (R$ {saldo_projetado:,.2f})")
            
            self.verificacoes['alertas_financeiros'] = {
                'entradas_30d': entradas,
                'saidas_30d': saidas,
                'saldo_projetado': saldo_projetado
            }
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            self.alertas.append(f"ERRO: Falha na verificação de alertas - {e}")
            if conn:
                conn.close()
            return False
    
    def gerar_relatorio_integridade(self):
        """Gera relatório detalhado de integridade"""
        relatorio = {
            "data_verificacao": datetime.now().isoformat(),
            "versao": "1.0",
            "status": "OK" if len(self.alertas) == 0 else "ATENÇÃO",
            "total_alertas": len(self.alertas),
            "alertas": self.alertas,
            "verificacoes": self.verificacoes,
            "recomendacoes": []
        }
        
        # Adicionar recomendações baseadas nos alertas
        if any("CRÍTICO" in alerta for alerta in self.alertas):
            relatorio["recomendacoes"].append("Resolver problemas críticos imediatamente")
        
        if any("PERFORMANCE" in alerta for alerta in self.alertas):
            relatorio["recomendacoes"].append("Otimizar queries com baixa performance")
        
        if any("glosa" in alerta.lower() for alerta in self.alertas):
            relatorio["recomendacoes"].append("Revisar processo de glosas com convênios")
        
        if any("atraso" in alerta.lower() for alerta in self.alertas):
            relatorio["recomendacoes"].append("Implementar rotina de cobrança automática")
        
        # Salvar relatório
        filename = f'integrity_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(relatorio, f, indent=2, ensure_ascii=False)
        
        return filename

def main():
    """Função principal de verificação"""
    print("🔍 FoncareSystem - Verificação de Integridade do Módulo Financeiro")
    print("=" * 65)
    
    checker = FinanceiroIntegrityChecker()
    
    # Executar verificações
    print("\n1️⃣ Verificando estrutura das tabelas...")
    checker.verificar_estrutura_tabelas()
    
    print("2️⃣ Verificando integridade dos dados...")
    checker.verificar_integridade_dados()
    
    print("3️⃣ Verificando performance das queries...")
    checker.verificar_performance_queries()
    
    print("4️⃣ Verificando alertas financeiros...")
    checker.verificar_alertas_financeiros()
    
    # Gerar relatório
    print("\n📊 Gerando relatório de integridade...")
    relatorio_file = checker.gerar_relatorio_integridade()
    
    # Resumo
    print(f"\n📋 RESUMO DA VERIFICAÇÃO")
    print(f"Total de alertas: {len(checker.alertas)}")
    
    if len(checker.alertas) == 0:
        print("✅ Sistema íntegro - nenhum problema encontrado")
    else:
        print("\n⚠️ ALERTAS ENCONTRADOS:")
        for i, alerta in enumerate(checker.alertas, 1):
            nivel = "🔴" if "CRÍTICO" in alerta else "🟡" if "ATENÇÃO" in alerta else "🔵"
            print(f"{nivel} {i}. {alerta}")
    
    print(f"\n📄 Relatório detalhado salvo em: {relatorio_file}")
    
    return len([a for a in checker.alertas if "CRÍTICO" in a])

if __name__ == "__main__":
    exit(main())
