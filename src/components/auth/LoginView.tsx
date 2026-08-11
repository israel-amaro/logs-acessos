import React, { useState } from 'react';
import { User, KeyRound, AlertTriangle, ArrowRight } from 'lucide-react';
import { loginWithFirebase, AppUserProfile } from '../../lib/firebase';

interface LoginViewProps {
  onLoginSuccess: (user: { username: string; role: 'admin' | 'operator'; name: string; uid?: string; email?: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin@senai.br');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const profile: AppUserProfile = await loginWithFirebase(username, password);
      setIsLoading(false);
      onLoginSuccess({
        username: profile.email,
        role: profile.role,
        name: profile.name,
        uid: profile.uid,
        email: profile.email,
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Erro ao realizar login no Firebase.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center p-4 relative font-sans">
      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 z-10 space-y-6 text-slate-900">
        
        {/* Header with Logo and Title */}
        <div className="text-center space-y-3">
          <img
            src="https://res.cloudinary.com/donpjw2ed/image/upload/v1786030563/favicon_pqmpl8.png"
            alt="Logo Checklist SENAI"
            className="w-24 h-24 object-contain mx-auto"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Checklist SENAI
          </h1>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Usuário / E-mail
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin@senai.br"
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Senha
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Entrando...</span>
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};


