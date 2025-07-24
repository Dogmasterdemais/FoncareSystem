"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PacienteForm({ onSuccess }: { onSuccess?: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('pacientes').insert([
      {
        nome,
        email,
        telefone,
        data_nascimento: dataNascimento,
        documento,
      },
    ]);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setNome('');
      setEmail('');
      setTelefone('');
      setDataNascimento('');
      setDocumento('');
      if (onSuccess) onSuccess();
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block font-medium">Nome</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Telefone</label>
        <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Data de Nascimento</label>
        <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Documento</label>
        <input type="text" value={documento} onChange={e => setDocumento(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Salvando...' : 'Cadastrar'}
      </button>
      {error && <div className="text-red-600">Erro: {error}</div>}
      {success && <div className="text-green-600">Paciente cadastrado com sucesso!</div>}
    </form>
  );
}
