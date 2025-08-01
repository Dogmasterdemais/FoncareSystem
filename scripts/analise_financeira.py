#!/usr/bin/env python3
"""
Script Python para Análise Financeira Automática
Sistema FoncareSystem - Módulo Financeiro

Este script gera relatórios descritivos das origens de receita,
análise de glosas e projeções financeiras.
"""

import os
import psycopg2
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import numpy as np
from typing import Dict, List, Tuple
import json

class AnaliseFinanceira:
    def __init__(self):
        """Inicializa a conexão com o banco de dados Supabase"""
        # Configurações do banco (usar variáveis de ambiente em produção)
        self.db_config = {
            'host': os.getenv('SUPABASE_DB_HOST', 'localhost'),
            'database': os.getenv('SUPABASE_DB_NAME', 'postgres'),
            'user': os.getenv('SUPABASE_DB_USER', 'postgres'),
            'password': os.getenv('SUPABASE_DB_PASSWORD', ''),
            'port': os.getenv('SUPABASE_DB_PORT', '5432')
        }
        
        # Configurar estilo dos gráficos
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        
    def conectar_bd(self):
        """Estabelece conexão com o banco de dados"""
        try:
            conn = psycopg2.connect(**self.db_config)
            return conn
        except Exception as e:
            print(f"Erro ao conectar ao banco: {e}")
            return None
    
    def executar_query(self, query: str, params: tuple = None) -> pd.DataFrame:
        """Executa query e retorna DataFrame"""
        conn = self.conectar_bd()
        if not conn:
            return pd.DataFrame()
        
        try:
            df = pd.read_sql_query(query, conn, params=params)
            return df
        except Exception as e:
            print(f"Erro ao executar query: {e}")
            return pd.DataFrame()
        finally:
            conn.close()
    
    def gerar_relatorio_receitas_origem(self, meses: int = 12) -> Dict:
        """Gera relatório detalhado das origens de receita"""
        
        query = """
        SELECT 
            DATE_TRUNC('month', cr.created_at) as mes,
            u.nome as unidade,
            cr.origem,
            c.nome as convenio,
            COUNT(*) as quantidade_guias,
            SUM(cr.valor_bruto) as valor_bruto_total,
            SUM(cr.valor_liquido) as valor_liquido_total,
            SUM(cr.valor_glosa) as valor_glosa_total,
            ROUND(AVG(cr.valor_bruto), 2) as ticket_medio,
            ROUND((SUM(cr.valor_glosa) / NULLIF(SUM(cr.valor_bruto), 0)) * 100, 2) as percentual_glosa
        FROM contas_receber cr
        JOIN unidades u ON cr.unidade_id = u.id
        LEFT JOIN convenios c ON cr.convenio_id = c.id
        WHERE cr.created_at >= CURRENT_DATE - INTERVAL '%s months'
        GROUP BY DATE_TRUNC('month', cr.created_at), u.nome, cr.origem, c.nome
        ORDER BY mes DESC, valor_liquido_total DESC
        """
        
        df = self.executar_query(query, (meses,))
        
        if df.empty:
            return {"erro": "Nenhum dado encontrado"}
        
        # Análises estatísticas
        analise = {
            "periodo_analise": f"Últimos {meses} meses",
            "total_receita_bruta": float(df['valor_bruto_total'].sum()),
            "total_receita_liquida": float(df['valor_liquido_total'].sum()),
            "total_glosas": float(df['valor_glosa_total'].sum()),
            "percentual_glosa_geral": round((df['valor_glosa_total'].sum() / df['valor_bruto_total'].sum()) * 100, 2),
            
            # Por origem
            "receitas_por_origem": df.groupby('origem').agg({
                'valor_liquido_total': 'sum',
                'quantidade_guias': 'sum',
                'ticket_medio': 'mean'
            }).round(2).to_dict(),
            
            # Por convênio
            "receitas_por_convenio": df.groupby('convenio').agg({
                'valor_liquido_total': 'sum',
                'percentual_glosa': 'mean'
            }).round(2).to_dict(),
            
            # Tendências mensais
            "tendencia_mensal": df.groupby('mes').agg({
                'valor_liquido_total': 'sum',
                'valor_glosa_total': 'sum'
            }).round(2).to_dict(),
            
            # Top performing
            "top_origens": df.groupby('origem')['valor_liquido_total'].sum().sort_values(ascending=False).head(5).to_dict(),
            "top_convenios": df.groupby('convenio')['valor_liquido_total'].sum().sort_values(ascending=False).head(5).to_dict()
        }
        
        return analise
    
    def analise_glosas_detalhada(self) -> Dict:
        """Análise detalhada de glosas e sua evolução"""
        
        query = """
        SELECT 
            DATE_TRUNC('month', cr.created_at) as mes,
            u.nome as unidade,
            c.nome as convenio,
            cr.origem,
            COUNT(*) as total_guias,
            COUNT(CASE WHEN cr.valor_glosa > 0 THEN 1 END) as guias_com_glosa,
            SUM(cr.valor_bruto) as valor_provisionado,
            SUM(cr.valor_liquido) as valor_recebido,
            SUM(cr.valor_glosa) as valor_glosa,
            MIN(cr.percentual_glosa) as menor_glosa,
            MAX(cr.percentual_glosa) as maior_glosa,
            AVG(cr.percentual_glosa) as media_glosa,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cr.percentual_glosa) as mediana_glosa
        FROM contas_receber cr
        JOIN unidades u ON cr.unidade_id = u.id
        LEFT JOIN convenios c ON cr.convenio_id = c.id
        WHERE cr.created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', cr.created_at), u.nome, c.nome, cr.origem
        HAVING SUM(cr.valor_bruto) > 0
        ORDER BY mes DESC, valor_glosa DESC
        """
        
        df = self.executar_query(query)
        
        if df.empty:
            return {"erro": "Nenhum dado de glosas encontrado"}
        
        analise_glosas = {
            "resumo_geral": {
                "total_provisionado": float(df['valor_provisionado'].sum()),
                "total_recebido": float(df['valor_recebido'].sum()),
                "total_glosado": float(df['valor_glosa'].sum()),
                "percentual_glosa_geral": round((df['valor_glosa'].sum() / df['valor_provisionado'].sum()) * 100, 2),
                "taxa_glosa_media": round(df['media_glosa'].mean(), 2),
                "guias_afetadas_por_glosa": int(df['guias_com_glosa'].sum()),
                "total_guias": int(df['total_guias'].sum())
            },
            
            "glosas_por_convenio": df.groupby('convenio').agg({
                'valor_glosa': 'sum',
                'valor_provisionado': 'sum',
                'media_glosa': 'mean'
            }).assign(
                percentual_glosa=lambda x: round((x['valor_glosa'] / x['valor_provisionado']) * 100, 2)
            ).round(2).to_dict(),
            
            "evolucao_mensal": df.groupby('mes').agg({
                'valor_provisionado': 'sum',
                'valor_recebido': 'sum',
                'valor_glosa': 'sum',
                'media_glosa': 'mean'
            }).round(2).to_dict(),
            
            "pior_performance": {
                "convenio_maior_glosa": df.loc[df['valor_glosa'].idxmax(), 'convenio'],
                "valor_maior_glosa": float(df['valor_glosa'].max()),
                "origem_maior_glosa": df.loc[df['media_glosa'].idxmax(), 'origem'],
                "percentual_maior_glosa": float(df['media_glosa'].max())
            }
        }
        
        return analise_glosas
    
    def projecao_fluxo_caixa(self, meses_projecao: int = 6) -> Dict:
        """Projeta fluxo de caixa baseado em dados históricos"""
        
        # Receitas históricas
        query_receitas = """
        SELECT 
            DATE_TRUNC('month', created_at) as mes,
            SUM(valor_liquido) as receita_total
        FROM contas_receber 
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        AND status = 'Recebido'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY mes
        """
        
        # Despesas históricas
        query_despesas = """
        SELECT 
            DATE_TRUNC('month', created_at) as mes,
            categoria,
            SUM(valor) as despesa_total
        FROM contas_pagar 
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        AND status = 'Pago'
        GROUP BY DATE_TRUNC('month', created_at), categoria
        ORDER BY mes
        """
        
        df_receitas = self.executar_query(query_receitas)
        df_despesas = self.executar_query(query_despesas)
        
        if df_receitas.empty or df_despesas.empty:
            return {"erro": "Dados insuficientes para projeção"}
        
        # Calcular médias e tendências
        media_receita = df_receitas['receita_total'].mean()
        crescimento_receita = np.polyfit(range(len(df_receitas)), df_receitas['receita_total'], 1)[0]
        
        media_despesas = df_despesas.groupby('mes')['despesa_total'].sum().mean()
        crescimento_despesas = np.polyfit(range(len(df_despesas.groupby('mes')['despesa_total'].sum())), 
                                        df_despesas.groupby('mes')['despesa_total'].sum(), 1)[0]
        
        # Projetar próximos meses
        projecoes = []
        for i in range(1, meses_projecao + 1):
            mes_futuro = datetime.now() + timedelta(days=30 * i)
            receita_projetada = media_receita + (crescimento_receita * i)
            despesa_projetada = media_despesas + (crescimento_despesas * i)
            
            projecoes.append({
                "mes": mes_futuro.strftime("%Y-%m"),
                "receita_projetada": round(receita_projetada, 2),
                "despesa_projetada": round(despesa_projetada, 2),
                "resultado_projetado": round(receita_projetada - despesa_projetada, 2)
            })
        
        projecao = {
            "historico": {
                "media_receita_mensal": round(media_receita, 2),
                "media_despesa_mensal": round(media_despesas, 2),
                "crescimento_receita_mensal": round(crescimento_receita, 2),
                "crescimento_despesa_mensal": round(crescimento_despesas, 2)
            },
            "projecoes": projecoes,
            "alerta": self._gerar_alertas_projecao(projecoes)
        }
        
        return projecao
    
    def _gerar_alertas_projecao(self, projecoes: List[Dict]) -> List[str]:
        """Gera alertas baseados nas projeções"""
        alertas = []
        
        for proj in projecoes:
            if proj["resultado_projetado"] < 0:
                alertas.append(f"⚠️ Resultado negativo projetado para {proj['mes']}: R$ {proj['resultado_projetado']}")
            
            if proj["despesa_projetada"] > proj["receita_projetada"] * 0.9:
                alertas.append(f"⚠️ Despesas muito altas em {proj['mes']}: {round((proj['despesa_projetada']/proj['receita_projetada'])*100, 1)}% da receita")
        
        return alertas
    
    def gerar_relatorio_completo(self, salvar_arquivo: bool = True) -> Dict:
        """Gera relatório financeiro completo"""
        
        print("🔄 Gerando análise de receitas por origem...")
        receitas = self.gerar_relatorio_receitas_origem()
        
        print("🔄 Analisando glosas detalhadamente...")
        glosas = self.analise_glosas_detalhada()
        
        print("🔄 Projetando fluxo de caixa...")
        projecao = self.projecao_fluxo_caixa()
        
        relatorio_completo = {
            "data_geracao": datetime.now().isoformat(),
            "versao": "1.0",
            "receitas_por_origem": receitas,
            "analise_glosas": glosas,
            "projecao_fluxo_caixa": projecao,
            "resumo_executivo": self._gerar_resumo_executivo(receitas, glosas, projecao)
        }
        
        if salvar_arquivo:
            nome_arquivo = f"relatorio_financeiro_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(nome_arquivo, 'w', encoding='utf-8') as f:
                json.dump(relatorio_completo, f, indent=2, ensure_ascii=False, default=str)
            print(f"✅ Relatório salvo em: {nome_arquivo}")
        
        return relatorio_completo
    
    def _gerar_resumo_executivo(self, receitas: Dict, glosas: Dict, projecao: Dict) -> Dict:
        """Gera resumo executivo dos principais indicadores"""
        
        if any("erro" in item for item in [receitas, glosas, projecao]):
            return {"erro": "Dados insuficientes para resumo executivo"}
        
        resumo = {
            "indicadores_principais": {
                "receita_liquida_total": receitas.get("total_receita_liquida", 0),
                "percentual_glosa_geral": receitas.get("percentual_glosa_geral", 0),
                "crescimento_mensal_receita": projecao["historico"]["crescimento_receita_mensal"],
                "resultado_projetado_6m": sum([p["resultado_projetado"] for p in projecao["projecoes"]])
            },
            
            "alertas_gestao": [],
            
            "recomendacoes": []
        }
        
        # Gerar alertas automáticos
        if resumo["indicadores_principais"]["percentual_glosa_geral"] > 10:
            resumo["alertas_gestao"].append("🚨 Taxa de glosa elevada - requer atenção imediata")
            resumo["recomendacoes"].append("Revisar processos de autorização e documentação com convênios")
        
        if resumo["indicadores_principais"]["crescimento_mensal_receita"] < 0:
            resumo["alertas_gestao"].append("📉 Tendência de queda na receita")
            resumo["recomendacoes"].append("Implementar estratégias para aumento de captação de pacientes")
        
        if resumo["indicadores_principais"]["resultado_projetado_6m"] < 0:
            resumo["alertas_gestao"].append("💰 Projeção negativa para próximos 6 meses")
            resumo["recomendacoes"].append("Revisar estrutura de custos e otimizar despesas")
        
        return resumo

def main():
    """Função principal - executa análise completa"""
    print("🏥 FoncareSystem - Análise Financeira Automática")
    print("=" * 50)
    
    analise = AnaliseFinanceira()
    
    try:
        relatorio = analise.gerar_relatorio_completo()
        
        print("\n📊 RESUMO EXECUTIVO")
        print("-" * 30)
        
        if "resumo_executivo" in relatorio and "erro" not in relatorio["resumo_executivo"]:
            resumo = relatorio["resumo_executivo"]["indicadores_principais"]
            print(f"💰 Receita Líquida Total: R$ {resumo['receita_liquida_total']:,.2f}")
            print(f"📉 Taxa de Glosa: {resumo['percentual_glosa_geral']:.1f}%")
            print(f"📈 Crescimento Mensal: R$ {resumo['crescimento_mensal_receita']:,.2f}")
            print(f"🔮 Projeção 6 meses: R$ {resumo['resultado_projetado_6m']:,.2f}")
            
            if relatorio["resumo_executivo"]["alertas_gestao"]:
                print("\n⚠️ ALERTAS:")
                for alerta in relatorio["resumo_executivo"]["alertas_gestao"]:
                    print(f"  {alerta}")
            
            if relatorio["resumo_executivo"]["recomendacoes"]:
                print("\n💡 RECOMENDAÇÕES:")
                for rec in relatorio["resumo_executivo"]["recomendacoes"]:
                    print(f"  • {rec}")
        
        print(f"\n✅ Análise concluída em {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        
    except Exception as e:
        print(f"❌ Erro durante análise: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
