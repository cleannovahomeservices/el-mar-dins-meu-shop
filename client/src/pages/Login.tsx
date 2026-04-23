import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: () => {
      window.location.href = "/admin/comandes";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email: email.trim().toLowerCase(), password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.72 0.08 200)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-xl"
        style={{ background: "white" }}
      >
        <div className="flex flex-col items-center gap-2 mb-8">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/logoELMARDINSMEU_5d9b7206.png"
            alt="Logo"
            className="h-16 w-auto"
          />
          <h1
            className="text-xl font-black text-center"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.45 0.1 200)" }}
          >
            Panell d'administració
          </h1>
          <p className="text-sm text-gray-500 text-center">El Mar dins Meu</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Correu electrònic</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ borderColor: "oklch(0.7 0.08 200)", focusRingColor: "oklch(0.55 0.1 200)" }}
              placeholder="correu@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Contrasenya</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ borderColor: "oklch(0.7 0.08 200)" }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-2.5 rounded-lg font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "oklch(0.55 0.1 200)", fontFamily: "'Nunito', sans-serif" }}
          >
            {loginMutation.isPending ? "Accedint..." : "Accedir"}
          </button>

          <a
            href="/"
            className="text-center text-xs text-gray-400 hover:text-gray-600"
          >
            ← Tornar a la botiga
          </a>
        </form>
      </div>
    </div>
  );
}
