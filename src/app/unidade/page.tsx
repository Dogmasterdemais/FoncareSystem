"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UnidadePage() {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>("");

  useEffect(() => {
    async function fetchUnidades() {
      const { data, error } = await supabase.from("unidades").select("id, nome").eq("ativo", "true");
      if (!error && data) setUnidades(data);
    }
    fetchUnidades();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Unidade</h1>
      <p>Selecione a unidade para visualizar e operar funcionalidades específicas. Em breve: integração com permissões de usuário.</p>
      <div className="mt-4">
        <label className="block mb-2 font-semibold">Unidade:</label>
        <select
          className="px-3 py-2 rounded border bg-white"
          value={unidadeSelecionada}
          onChange={e => setUnidadeSelecionada(e.target.value)}
        >
          <option value="">Selecione...</option>
          {unidades.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
