#!/usr/bin/env python3
"""
Script de Inicialização do Módulo Financeiro
FoncareSystem

Este script configura automaticamente:
1. Estrutura do banco de dados
2. Dados de exemplo
3. Configurações iniciais
4. Testes de conectividade
"""

import os
import sys
import psycopg2
from datetime import datetime, timedelta
import json

class FinanceiroInitializer:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('SUPABASE_DB_HOST', 'localhost'),
            'database': os.getenv('SUPABASE_DB_NAME', 'postgres'),
            'user': os.getenv('SUPABASE_DB_USER', 'postgres'),
            'password': os.getenv('SUPABASE_DB_PASSWORD', ''),
            'port': os.getenv('SUPABASE_DB_PORT', '5432')
        }
        
    def conectar(self):
        """Testa conexão com o banco"""
        try:
            conn = psycopg2.connect(**self.db_config)
            print("✅ Conexão com banco de dados estabelecida")
            return conn
        except Exception as e:
            print(f"❌ Erro na conexão: {e}")
            return None
    
    def executar_sql_file(self, arquivo_sql):
        """Executa arquivo SQL"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            with open(arquivo_sql, 'r', encoding='utf-8') as f:
                sql_commands = f.read()
            
            cursor = conn.cursor()
            cursor.execute(sql_commands)
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"✅ Arquivo SQL executado: {arquivo_sql}")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao executar SQL: {e}")
            if conn:
                conn.close()
            return False
    
    def verificar_tabelas(self):
        """Verifica se as tabelas foram criadas"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            tabelas_esperadas = [
                'contas_pagar',
                'contas_receber', 
                'folha_clt',
                'folha_pj',
                'notas_fiscais'
            ]
            
            for tabela in tabelas_esperadas:
                cursor.execute(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = '{tabela}'
                    )
                """)
                existe = cursor.fetchone()[0]
                
                if existe:
                    print(f"✅ Tabela {tabela} criada")
                else:
                    print(f"❌ Tabela {tabela} não encontrada")
                    return False
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            print(f"❌ Erro ao verificar tabelas: {e}")
            if conn:
                conn.close()
            return False
    
    def inserir_dados_exemplo(self):
        """Insere dados de exemplo para testes"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            # Verificar se já existem dados
            cursor.execute("SELECT COUNT(*) FROM contas_pagar")
            count_pagar = cursor.fetchone()[0]
            
            if count_pagar > 0:
                print("ℹ️ Dados de exemplo já existem")
                cursor.close()
                conn.close()
                return True
            
            # Obter ID da primeira unidade
            cursor.execute("SELECT id FROM unidades LIMIT 1")
            unidade_result = cursor.fetchone()
            
            if not unidade_result:
                print("⚠️ Nenhuma unidade encontrada. Criando dados de exemplo sem unidade.")
                unidade_id = None
            else:
                unidade_id = unidade_result[0]
            
            # Inserir contas a pagar de exemplo
            contas_pagar = [
                {
                    'descricao': 'Energia Elétrica - Janeiro 2025',
                    'fornecedor': 'CPFL Energia',
                    'valor': 2450.00,
                    'data_vencimento': '2025-02-15',
                    'categoria': 'Consumo',
                    'status': 'Pendente'
                },
                {
                    'descricao': 'Aluguel Consultório',
                    'fornecedor': 'Imobiliária Central',
                    'valor': 5800.00,
                    'data_vencimento': '2025-02-01',
                    'categoria': 'Fixa',
                    'status': 'Pago'
                },
                {
                    'descricao': 'Material de Limpeza',
                    'fornecedor': 'Distribuidora Limpa',
                    'valor': 320.00,
                    'data_vencimento': '2025-02-10',
                    'categoria': 'Variavel',
                    'status': 'Pendente'
                }
            ]
            
            for conta in contas_pagar:
                cursor.execute("""
                    INSERT INTO contas_pagar 
                    (descricao, fornecedor, valor, data_vencimento, categoria, status, unidade_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    conta['descricao'],
                    conta['fornecedor'],
                    conta['valor'],
                    conta['data_vencimento'],
                    conta['categoria'],
                    conta['status'],
                    unidade_id
                ))
            
            # Inserir contas a receber de exemplo
            contas_receber = [
                {
                    'descricao': 'Consulta Cardiológica',
                    'valor_bruto': 250.00,
                    'valor_liquido': 250.00,
                    'valor_glosa': 0,
                    'data_vencimento': '2025-02-28',
                    'origem': 'Particular',
                    'status': 'Recebido'
                },
                {
                    'descricao': 'Terapia em Grupo',
                    'valor_bruto': 180.00,
                    'valor_liquido': 144.00,
                    'valor_glosa': 36.00,
                    'data_vencimento': '2025-03-15',
                    'origem': 'Guia_Tabulada',
                    'status': 'Pendente'
                },
                {
                    'descricao': 'Exame Neurológico',
                    'valor_bruto': 350.00,
                    'valor_liquido': 315.00,
                    'valor_glosa': 35.00,
                    'data_vencimento': '2025-03-10',
                    'origem': 'Guia_Tabulada',
                    'status': 'Recebido'
                }
            ]
            
            for conta in contas_receber:
                cursor.execute("""
                    INSERT INTO contas_receber 
                    (descricao, valor_bruto, valor_liquido, valor_glosa, data_vencimento, origem, status, unidade_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    conta['descricao'],
                    conta['valor_bruto'],
                    conta['valor_liquido'],
                    conta['valor_glosa'],
                    conta['data_vencimento'],
                    conta['origem'],
                    conta['status'],
                    unidade_id
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print("✅ Dados de exemplo inseridos com sucesso")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao inserir dados de exemplo: {e}")
            if conn:
                conn.rollback()
                conn.close()
            return False
    
    def verificar_views(self):
        """Verifica se as views foram criadas"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            views_esperadas = [
                'vw_dashboard_financeiro',
                'vw_analise_glosas',
                'vw_receitas_origem'
            ]
            
            for view in views_esperadas:
                cursor.execute(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.views 
                        WHERE table_name = '{view}'
                    )
                """)
                existe = cursor.fetchone()[0]
                
                if existe:
                    print(f"✅ View {view} criada")
                else:
                    print(f"❌ View {view} não encontrada")
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            print(f"❌ Erro ao verificar views: {e}")
            if conn:
                conn.close()
            return False
    
    def testar_funcionalidades(self):
        """Testa funcionalidades básicas"""
        conn = self.conectar()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            # Testar dashboard
            cursor.execute("SELECT * FROM vw_dashboard_financeiro LIMIT 1")
            dashboard = cursor.fetchone()
            
            if dashboard:
                print("✅ Dashboard funcional")
            else:
                print("⚠️ Dashboard sem dados")
            
            # Testar função de encargos
            cursor.execute("SELECT calcular_encargos_clt(1000.00)")
            encargos = cursor.fetchone()[0]
            
            if encargos == 340.00:  # 34% de 1000
                print("✅ Função de cálculo de encargos funcional")
            else:
                print(f"⚠️ Função de encargos retornou valor inesperado: {encargos}")
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            print(f"❌ Erro ao testar funcionalidades: {e}")
            if conn:
                conn.close()
            return False
    
    def gerar_relatorio_inicializacao(self):
        """Gera relatório de inicialização"""
        relatorio = {
            "data_inicializacao": datetime.now().isoformat(),
            "versao": "1.0",
            "status": "inicializado",
            "configuracoes": {
                "banco_dados": self.db_config['host'],
                "usuario": self.db_config['user'],
                "porta": self.db_config['port']
            }
        }
        
        with open('financeiro_init_report.json', 'w', encoding='utf-8') as f:
            json.dump(relatorio, f, indent=2, ensure_ascii=False)
        
        print("✅ Relatório de inicialização gerado: financeiro_init_report.json")

def main():
    """Função principal de inicialização"""
    print("🏥 FoncareSystem - Inicialização do Módulo Financeiro")
    print("=" * 55)
    
    initializer = FinanceiroInitializer()
    
    # 1. Testar conexão
    print("\n1️⃣ Testando conexão com banco de dados...")
    if not initializer.conectar():
        print("❌ Falha na conexão. Verifique as configurações.")
        return 1
    
    # 2. Executar estrutura SQL
    print("\n2️⃣ Executando estrutura do banco...")
    sql_file = 'modulo_financeiro_estrutura.sql'
    
    if os.path.exists(sql_file):
        if not initializer.executar_sql_file(sql_file):
            print("❌ Falha ao executar estrutura SQL.")
            return 1
    else:
        print(f"⚠️ Arquivo {sql_file} não encontrado. Pulando...")
    
    # 3. Verificar tabelas
    print("\n3️⃣ Verificando tabelas criadas...")
    if not initializer.verificar_tabelas():
        print("⚠️ Algumas tabelas podem não ter sido criadas corretamente.")
    
    # 4. Verificar views
    print("\n4️⃣ Verificando views...")
    initializer.verificar_views()
    
    # 5. Inserir dados de exemplo
    print("\n5️⃣ Inserindo dados de exemplo...")
    initializer.inserir_dados_exemplo()
    
    # 6. Testar funcionalidades
    print("\n6️⃣ Testando funcionalidades...")
    initializer.testar_funcionalidades()
    
    # 7. Gerar relatório
    print("\n7️⃣ Gerando relatório de inicialização...")
    initializer.gerar_relatorio_inicializacao()
    
    print("\n🎉 Inicialização do Módulo Financeiro concluída!")
    print("\nPróximos passos:")
    print("1. Acesse /financeiro no sistema")
    print("2. Configure suas unidades e convênios")
    print("3. Execute: python scripts/analise_financeira.py")
    print("4. Consulte a documentação: MODULO_FINANCEIRO_DOCUMENTACAO.md")
    
    return 0

if __name__ == "__main__":
    exit(main())
