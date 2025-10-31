'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Expense, ExpenseCategories } from '@/lib/models/Expense';

interface ExpensesPageProps {
  user: {
    email: string;
    perfil: string;
  };
}

export default function ExpensesPageComponent({ user }: ExpensesPageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar despesas
  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, startDate, endDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = '/api/expenses?limit=50';
      
      if (categoryFilter) {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        setError('Erro ao carregar despesas');
      }
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      setError('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta despesa?')) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== id));
      } else {
        setError('Erro ao deletar despesa');
      }
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      setError('Erro ao deletar despesa');
    }
  };

  // Filtrar despesas pelo termo de busca
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular total
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando despesas...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
              <p className="text-sm text-gray-600">Gerencie suas despesas</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">← Dashboard</Button>
              </Link>
              <Link href="/expenses/new">
                <Button variant="primary">+ Nova Despesa</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
              <button onClick={() => setError(null)} className="float-right font-bold">×</button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6 mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nome da despesa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  id="category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {ExpenseCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 px-4 sm:px-0">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500">Total de Despesas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
                <p className="text-sm text-gray-500">Despesas Encontradas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  R$ {filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </p>
                <p className="text-sm text-gray-500">Média por Despesa</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Despesas */}
        <Card className="mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle>Lista de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{expense.description}</h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                          {expense.category}
                        </span>
                        <span>{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-lg font-bold text-red-600">
                        R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">Nenhuma despesa encontrada</p>
                <Link href="/expenses/new">
                  <Button variant="primary">Adicionar primeira despesa</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}