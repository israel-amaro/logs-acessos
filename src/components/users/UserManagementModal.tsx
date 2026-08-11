import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, ShieldCheck, User, Mail, Lock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { createNewUserByAdmin, fetchAllUsers, AppUserProfile, UserRole } from '../../lib/firebase';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserUid: string;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUserUid,
}) => {
  const [usersList, setUsersList] = useState<AppUserProfile[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // New user form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('operator');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoadingList(true);
    const users = await fetchAllUsers();
    setUsersList(users);
    setLoadingList(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setFormError(null);
      setFormSuccess(null);
    }
  }, [isOpen]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      const newUser = await createNewUserByAdmin(
        { email, pass: password, name, role },
        currentUserUid
      );
      setFormLoading(false);
      setFormSuccess(`Usuário ${newUser.email} criado com sucesso no Firebase!`);
      setEmail('');
      setPassword('');
      setName('');
      setRole('operator');
      loadUsers();
    } catch (err: any) {
      setFormLoading(false);
      setFormError(err.message || 'Erro ao criar usuário no Firebase.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Gerenciamento de Usuários (Firebase)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Administre credenciais e crie novos acessos no Firebase Auth & Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-neutral-900">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários Cadastrados ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Criar Novo Usuário</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'list' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Lista de perfis armazenados no Firestore:
                </span>
                <button
                  onClick={loadUsers}
                  disabled={loadingList}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>
              </div>

              {loadingList ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  Carregando lista de usuários do Firebase...
                </div>
              ) : usersList.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  Nenhum usuário cadastrado no Firestore.
                </div>
              ) : (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                  {usersList.map((usr) => (
                    <div
                      key={usr.uid}
                      className="p-3.5 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                            usr.role === 'admin'
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {usr.role === 'admin' ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-neutral-900 dark:text-white">
                              {usr.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                                usr.role === 'admin'
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              {usr.role.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
                            {usr.email}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-neutral-400 font-mono">
                        UID: {usr.uid.slice(0, 8)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateUser} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    E-mail / Usuário *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@senai.br"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Senha (mínimo 6 caracteres) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ex: João Silva"
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Nível de Perfil (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 px-3 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  >
                    <option value="operator">Operador (Técnico de Suporte)</option>
                    <option value="admin">Administrador TI</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? 'Criando no Firebase...' : 'Criar Usuário no Firebase'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
