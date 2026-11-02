import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storageService';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Por favor ingrese su usuario o número de documento.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Por favor ingrese su contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const authUser = StorageService.authenticate(username, password);
      setIsLoading(false);

      if (authUser) {
        onLoginSuccess(authUser);
      } else {
        setErrorMsg('Credenciales incorrectas. Verifique el usuario y la contraseña ingresados.');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#0D472C]/20 overflow-hidden">
          {/* Institutional Top Band */}
          <div className="bg-[#0D472C] text-[#F9F6EC] px-6 py-5 text-center relative">
            <div className="mx-auto w-16 h-16 rounded-xl bg-white p-1 shadow-md mb-2 flex items-center justify-center">
              <img
                src="/assets/aistudio/7b7d3321-35c1-4d47-9d2f-28cfcd4eb5e9_72fa0376.jpg"
                alt="Centro de Medios y Archivos - Puerto Esperanza"
                className="w-full h-full object-contain rounded"
              />
            </div>
            <h1 className="font-archival text-lg font-bold tracking-wide uppercase">
              Centro de Medios y Archivos
            </h1>
            <p className="text-xs text-emerald-200 mt-0.5">
              Puerto Esperanza • Sistema de Gestión y Resguardo
            </p>
          </div>

          {/* Form container */}
          <div className="p-6 sm:p-8">
            <div className="mb-5 text-center">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Control de Acceso de Personal
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Ingrese sus credenciales para acceder a la oficina digital
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  D.N.I.
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="D.N.I."
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D472C] focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D472C] focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#0D472C] py-2.5 px-4 text-xs font-bold text-[#F9F6EC] hover:bg-[#165B3A] active:scale-[0.99] transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#0D472C]" />
                <span>Acceso Oficial Protegido y Auditado</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Uso exclusivo para personal acreditado y autoridades del Centro.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <span>Centro de Medios y Archivos • Puerto Esperanza</span>
        </div>
      </div>
    </div>
  );
};
