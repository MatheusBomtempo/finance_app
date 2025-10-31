'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Balance } from '@/lib/models/Balance';
import { Expense } from '@/lib/models/Expense';
import { Investment } from '@/lib/models/Investment';
import Link from 'next/link';

interface DashboardClientProps {
  user: {
    email: string;
    perfil: string;
  };
  safeEmail: string;
}

export function DashboardClient({ user, safeEmail }: DashboardClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [balance, setBalance] = useState<Balance | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dados das APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch balance
        const balanceResponse = await fetch('/api/balance');
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalance(balanceData);
        }

        // Fetch recent expenses (últimas 5)
        const expensesResponse = await fetch('/api/expenses?limit=5');
        if (expensesResponse.ok) {
          const expensesData = await expensesResponse.json();
          setExpenses(expensesData);
        }

        // Fetch investments
        const investmentsResponse = await fetch('/api/investments');
        if (investmentsResponse.ok) {
          const investmentsData = await investmentsResponse.json();
          setInvestments(investmentsData);
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular estatísticas
  const totalExpensesThisMonth = expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
      return total + expense.amount;
    }
    return total;
  }, 0);

  const totalInvestments = investments.reduce((total, investment) => total + investment.current_value, 0);
  const totalInvested = investments.reduce((total, investment) => total + investment.amount, 0);
  const investmentReturn = totalInvestments - totalInvested;
  const investmentReturnPercent = totalInvested > 0 ? (investmentReturn / totalInvested) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Finance App</h1>
              <p className="text-sm text-gray-600">Painel de Controle</p>
            </div>
            <div className="flex items-center space-x-4">
              {user.perfil === 'administrador' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/admin/tipos-investimento'}
                >
                  Gerenciar Tipos
                </Button>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: safeEmail }} />
                <p className="text-sm text-gray-500 capitalize">{user.perfil}</p>
              </div>
              <form action="/api/logout" method="post">
                <Button variant="danger" size="sm" type="submit">
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        {/* Central de Finanças Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Central de Finanças</h2>
          <p className="text-lg text-gray-600">Gerencie suas finanças de forma inteligente</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 w-full max-w-4xl">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Large Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {/* Saldo Card */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/saldo'}>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Saldo</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  R$ {balance ? balance.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </p>
                <p className="text-gray-500">Saldo total disponível</p>
              </div>
            </CardContent>
          </Card>

          {/* Despesas Card */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/despesas'}>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Despesas</h3>
                <p className="text-4xl font-bold text-red-600 mb-2">
                  R$ {totalExpensesThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-gray-500">Gastos do mês atual</p>
              </div>
            </CardContent>
          </Card>

          {/* Investimentos Card */}
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/investimentos'}>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Investimentos</h3>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  R$ {totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-gray-500">
                  {investmentReturn >= 0 ? '+' : ''}{investmentReturnPercent.toFixed(1)}% de retorno
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Button variant="primary" onClick={() => window.location.href = '/dashboard/saldo'}>
            Gerenciar Saldo
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/dashboard/despesas'}>
            Adicionar Despesa
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/dashboard/investimentos'}>
            Novo Investimento
          </Button>
        </div>


      </main>
    </div>
  );
}