"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

interface Unidade {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  ativo?: boolean;
}

interface Convenio {
  id: string;
  nome: string;
  codigo?: string;
  tipo?: string;
  ativo?: boolean;
}

interface UnidadeContextType {
  unidadeSelecionada: string;
  setUnidadeSelecionada: (id: string) => void;
  unidades: Unidade[];
  convenios: Convenio[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

const UnidadeContext = createContext<UnidadeContextType | undefined>(undefined);

export function UnidadeProvider({ children }: { children: ReactNode }) {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar unidades
      const { data: unidadesData, error: unidadesError } = await supabase
        .from('unidades')
        .select('*')
        .order('nome');

      if (unidadesError) {
        console.warn('Erro ao buscar unidades:', unidadesError);
        // Dados mockados se não conseguir buscar
        setUnidades([
          { id: '1', nome: 'Unidade Central', ativo: true },
          { id: '2', nome: 'Unidade Norte', ativo: true },
          { id: '3', nome: 'Unidade Sul', ativo: true },
        ]);
      } else {
        setUnidades(unidadesData || []);
      }

      // Buscar convenios
      const { data: conveniosData, error: conveniosError } = await supabase
        .from('convenios')
        .select('*')
        .order('nome');

      if (conveniosError) {
        console.warn('Erro ao buscar convenios:', conveniosError);
        // Dados mockados se não conseguir buscar
        setConvenios([
          { id: '1', nome: 'Particular', codigo: 'PART', tipo: 'Particular', ativo: true },
          { id: '2', nome: 'SUS', codigo: 'SUS', tipo: 'Público', ativo: true },
          { id: '3', nome: 'Unimed', codigo: 'UNIMED', tipo: 'Plano de Saúde', ativo: true },
          { id: '4', nome: 'Bradesco Saúde', codigo: 'BRADESCO', tipo: 'Plano de Saúde', ativo: true },
          { id: '5', nome: 'Amil', codigo: 'AMIL', tipo: 'Plano de Saúde', ativo: true },
        ]);
      } else {
        setConvenios(conveniosData || []);
      }

    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message);
      
      // Dados mockados em caso de erro
      setUnidades([
        { id: '1', nome: 'Unidade Central', ativo: true },
        { id: '2', nome: 'Unidade Norte', ativo: true },
        { id: '3', nome: 'Unidade Sul', ativo: true },
      ]);
      setConvenios([
        { id: '1', nome: 'Particular', codigo: 'PART', tipo: 'Particular', ativo: true },
        { id: '2', nome: 'SUS', codigo: 'SUS', tipo: 'Público', ativo: true },
        { id: '3', nome: 'Unimed', codigo: 'UNIMED', tipo: 'Plano de Saúde', ativo: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  return (
    <UnidadeContext.Provider value={{ 
      unidadeSelecionada, 
      setUnidadeSelecionada, 
      unidades, 
      convenios, 
      loading, 
      error, 
      refreshData 
    }}>
      {children}
    </UnidadeContext.Provider>
  );
}

export function useUnidade() {
  const context = useContext(UnidadeContext);
  if (!context) throw new Error("useUnidade deve ser usado dentro do UnidadeProvider");
  return context;
}
