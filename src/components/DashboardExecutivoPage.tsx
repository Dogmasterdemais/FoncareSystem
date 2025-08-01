"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Calendar, MapPin, TrendingUp, Users, FileText, Download, Building2, Activity, DollarSign, Clock, AlertCircle } from "lucide-react";
import { dashboardExecutivoService } from '@/lib/dashboardExecutivoService';
import { 
  DashboardExecutivo, 
  AtendimentoPorEspecialidade, 
  GuiasPorConvenio, 
  ResumoProfissionais,
  MapaCalorDados
} from '@/types/dashboardExecutivo';

interface DashboardExecutivoPageProps {
  unidadeId?: string;
}

export default function DashboardExecutivoPage({ unidadeId }: DashboardExecutivoPageProps) {
  const [dashboard, setDashboard] = useState<DashboardExecutivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedUnidade, setSelectedUnidade] = useState<string>(unidadeId || '');
  const [exportando, setExportando] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  useEffect(() => {
    carregarDashboard();
  }, [selectedYear, selectedMonth, selectedUnidade]);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dashboard:', { selectedYear, selectedMonth, selectedUnidade });
      
      const dashboardData = await dashboardExecutivoService.obterDashboardCompleto({
        ano: selectedYear,
        mes: selectedMonth,
        unidade_id: selectedUnidade || undefined
      });
      
      console.log('✅ Dashboard carregado:', dashboardData);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = async (tipo: 'geral' | 'especialidades' | 'convenios' | 'profissionais') => {
    try {
      setExportando(true);
      console.log('📊 Exportando relatório:', tipo);
      
      await dashboardExecutivoService.exportarRelatorio(tipo);
      
      console.log('✅ Relatório exportado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao exportar relatório:', error);
    } finally {
      setExportando(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularTaxaAprovacao = (guias: GuiasPorConvenio[]) => {
    const totalGuias = guias.reduce((acc, g) => acc + g.quantidade_guias, 0);
    const totalAprovado = guias.reduce((acc, g) => acc + g.valor_aprovado, 0);
    const totalGeral = guias.reduce((acc, g) => acc + g.valor_total, 0);
    
    return totalGeral > 0 ? (totalAprovado / totalGeral) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard executivo...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
          <Button onClick={carregarDashboard} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão abrangente dos indicadores da clínica
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => exportarRelatorio('geral')}
            disabled={exportando}
            className="border border-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            {exportando ? 'Exportando...' : 'Exportar Excel'}
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.kpis.total_pacientes_ativos}</div>
            <p className="text-xs text-muted-foreground">
              no período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.kpis.total_atendimentos_mes}</div>
            <p className="text-xs text-muted-foreground">
              Média: {dashboard.kpis.media_atendimentos_dia.toFixed(1)}/dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(dashboard.kpis.receita_total_mes)}</div>
            <p className="text-xs text-muted-foreground">
              guias aprovadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Ocupação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.kpis.taxa_ocupacao_salas.toFixed(1)}%</div>
            <Progress value={dashboard.kpis.taxa_ocupacao_salas} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Relatórios Detalhados */}
      <Tabs defaultValue="mapa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mapa">Mapa de Calor</TabsTrigger>
          <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
          <TabsTrigger value="convenios">Convênios</TabsTrigger>
          <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
        </TabsList>

        <TabsContent value="mapa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização Regional Pacientes
              </CardTitle>
              <CardDescription>
                Distribuição geográfica dos pacientes atendidos no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.mapa_calor.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboard.mapa_calor.map((local: MapaCalorDados, index: number) => (
                    <div 
                      key={index}
                      className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{local.bairro}</h4>
                        <Badge className="bg-gray-100 text-gray-800">{local.quantidade_pacientes}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {local.cidade}, {local.estado}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CEP: {local.cep}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {local.lat.toFixed(4)}, {local.lng.toFixed(4)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum dado de localização disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="especialidades" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Atendimentos por Especialidade</h3>
            <Button 
              onClick={() => exportarRelatorio('especialidades')}
              disabled={exportando}
              className="border border-gray-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboard.atendimentos_especialidade.map((esp: AtendimentoPorEspecialidade, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{esp.especialidade}</CardTitle>
                  <CardDescription>{esp.unidade_nome}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Atendimentos</p>
                      <p className="text-2xl font-bold">{esp.quantidade_atendimentos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pacientes</p>
                      <p className="text-2xl font-bold">{esp.quantidade_pacientes_unicos}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-xl font-bold text-green-600">{formatarMoeda(esp.valor_total)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="convenios" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Desempenho por Convênio</h3>
            <div className="flex gap-2">
              <Badge className="bg-gray-100 text-gray-800">
                Taxa Aprovação: {calcularTaxaAprovacao(dashboard.guias_convenio).toFixed(1)}%
              </Badge>
              <Button 
                onClick={() => exportarRelatorio('convenios')}
                disabled={exportando}
                className="border border-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboard.guias_convenio.map((conv: GuiasPorConvenio, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{conv.convenio_nome}</CardTitle>
                  <CardDescription>{conv.unidade_nome}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Guias</p>
                      <p className="text-lg font-bold">{conv.quantidade_guias}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aprovado</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatarMoeda(conv.valor_aprovado)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rejeitado</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatarMoeda(conv.valor_rejeitado)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Aprovação</span>
                      <span>
                        {conv.valor_total > 0 
                          ? ((conv.valor_aprovado / conv.valor_total) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={conv.valor_total > 0 ? (conv.valor_aprovado / conv.valor_total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profissionais" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Resumo de Profissionais</h3>
            <Button 
              onClick={() => exportarRelatorio('profissionais')}
              disabled={exportando}
              className="border border-gray-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.resumo_profissionais.map((prof: ResumoProfissionais, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {prof.especialidade}
                  </CardTitle>
                  <CardDescription>{prof.unidade_nome}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">{prof.total_profissionais}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos</p>
                      <p className="text-xl font-bold text-green-600">{prof.profissionais_ativos}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">CLT</p>
                      <p className="font-semibold">{prof.profissionais_clt}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">PJ</p>
                      <p className="font-semibold">{prof.profissionais_pj}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
