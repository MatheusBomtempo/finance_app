'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.debug('[LOGIN] Iniciando requisição /api/autentica');
      const response = await fetch('/api/autentica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        console.info('Login OK:', data);
        // Login bem-sucedido, redirecionar para dashboard
        try {
          console.debug('[LOGIN] Prefetch /dashboard');
          router.prefetch('/dashboard');
        } catch {}

        const confirmAt = (label: string) => {
          setTimeout(() => {
            console.debug(`[LOGIN] Verificando navegação (${label})`, {
              location: typeof window !== 'undefined' ? window.location.pathname : 'no-window'
            });
          }, 150);
        };

        try {
          console.debug('[LOGIN] router.replace(/dashboard)');
          router.replace('/dashboard');
          confirmAt('replace');
        } catch (err) {
          console.warn('[LOGIN] replace falhou', err);
        }

        // Fallback 1: push
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
            try {
              console.debug('[LOGIN] Fallback push(/dashboard)');
              router.push('/dashboard');
              confirmAt('push');
            } catch (err) {
              console.warn('[LOGIN] push falhou', err);
            }
          }
        }, 250);

        // Fallback 2: navegação dura
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
            console.debug('[LOGIN] Fallback window.location.assign(/dashboard)');
            window.location.assign('/dashboard');
            confirmAt('assign');
          }
        }, 500);
      } else {
        console.warn('Falha no login:', data);
        setError(data.message || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro de rede no login:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Finance App
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login em sua conta
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off" noValidate data-lpignore="true" data-1p-ignore="true">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                aria-autocomplete="none"
                data-lpignore="true"
                data-1p-ignore="true"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="senha" className="sr-only">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="off"
                aria-autocomplete="none"
                data-lpignore="true"
                data-1p-ignore="true"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Não foi possível entrar</h3>
                <p className="text-sm text-gray-700 mb-4">{error}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    onClick={() => setError('')}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link href="/cadastro" className="text-sm text-indigo-600 hover:text-indigo-500">Criar uma conta</Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Usuários de teste:
            </p>
            <p className="text-xs text-gray-500">
              Admin: admin@finance.com / Senha: password
            </p>
            <p className="text-xs text-gray-500">
              User: user@finance.com / Senha: password
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
