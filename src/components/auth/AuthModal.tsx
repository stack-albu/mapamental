"use client";

import { Loader2, Lock, Mail, X } from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase não configurado. Adicione as variáveis de ambiente.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        // In some configurations, signup requires email confirmation.
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-enter">
      <div className="relative w-full max-w-md bg-[var(--panel)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--line)]">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--muted)] hover:text-[var(--foreground)] transition"
        >
          <X size={20} />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2">
              Sincronize seus mapas mentais na nuvem.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[var(--foreground)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-[var(--foreground)]">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 py-3 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? "Entrar" : "Cadastrar")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--muted)]">
              {isLogin ? "Não tem uma conta?" : "Já possui uma conta?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-blue-600 hover:underline"
            >
              {isLogin ? "Cadastre-se" : "Faça login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
