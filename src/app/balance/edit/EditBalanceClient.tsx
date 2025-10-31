'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Balance, UpdateBalanceRequest } from '@/lib/models/Balance';

interface EditBalanceClientProps {
  user: {
    email: string;
    perfil: string;
  };
}

export function EditBalanceClient({ user }: EditBalanceClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  
  const [newAmount, setNewAmount] = useState<number>(0);

  // Carregar saldo atual
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoadingBalance(true);
        const response = await fetch('/api/balance');
        if (response.ok) {
          const data = await response.json();
          setBalance(data);
          setNewAmount(data.amount);
        } else {
          setError('Erro ao carregar saldo atual');
        }
      } catch (error) {
        console.error('Erro ao carregar saldo:', error);
        setError('Erro ao carregar saldo atual');
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (typeof newAmount !== 'number') {
        setError('Valor deve ser um número válido');
        return;
      }

      const requestBody: UpdateBalanceRequest = {
        amount: newAmount
      };

      const response = await fetch('/api/balance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao atualizar saldo');
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingBalance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando saldo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Atualizar Saldo</h1>
              <p className="text-sm text-gray-600">Edite seu saldo atual</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">← Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
              <button onClick={() => setError(null)} className="float-right font-bold">×</button>
            </div>
          </div>
        )}

        {/* Saldo Atual */}
        {balance && (
          <Card className="mb-6 mx-4 sm:mx-0">
            <CardHeader>
              <CardTitle>Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">
                  R$ {balance.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Última atualização: {new Date(balance.updated_at).toLocaleDateString('pt-BR')} às {new Date(balance.updated_at).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle>Novo Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="amount">Novo Valor do Saldo (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newAmount || ''}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Informe o novo valor total do seu saldo
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Atenção
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Esta ação irá substituir completamente seu saldo atual. Certifique-se de que o valor informado está correto.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/dashboard">
                  <Button type="button" variant="ghost">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Atualizar Saldo'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}