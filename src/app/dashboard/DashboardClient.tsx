'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, DollarSign, TrendingUp, CreditCard, LogOut, User, Settings, Users, BarChart3 } from 'lucide-react';
import { Balance } from '@/lib/models/Balance';
import { Expense } from '@/lib/models/Expense';
import { Investment } from '@/lib/models/Investment';

interface DashboardClientProps {
  user: {
    email: string;
    perfil: string;
  };
  safeEmail: string;
}

export function DashboardClient({ user, safeEmail }: DashboardClientProps) {
  // Debug: verificar dados do usuário
  console.log('🔍 Dados do usuário:', user);
  console.log('📧 Email seguro:', safeEmail);
  console.log('👑 Perfil do usuário:', user.perfil);
  console.log('✅ É admin?', user.perfil === 'admin');

  // Estados para dados reais das APIs
  const [balance, setBalance] = useState<Balance | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [submittingInvestment, setSubmittingInvestment] = useState(false);
  
  // Estados para dados administrativos (apenas para admins)
  const [adminStats, setAdminStats] = useState<{
    totalUsers: number;
    totalBalance: number;
    totalExpenses: number;
    totalInvestments: number;
  } | null>(null);
  const [loadingAdminData, setLoadingAdminData] = useState(false);

  // Estados para formulários
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'remove'>('add');
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Alimentação',
    date: new Date().toISOString().split('T')[0]
  });

  const [investmentForm, setInvestmentForm] = useState({
    name: '',
    type: 'CDB',
    amount: '',
    current_value: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  // Fetch dados das APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch em paralelo
        const [balanceRes, expensesRes, investmentsRes] = await Promise.all([
          fetch('/api/balance'),
          fetch('/api/expenses'),
          fetch('/api/investments')
        ]);

        // Balance
        const balanceData = await balanceRes.json();
        if (balanceRes.ok) {
          setBalance(balanceData);
        }

        // Expenses
        const expensesData = await expensesRes.json();
        if (expensesRes.ok) {
          setExpenses(Array.isArray(expensesData) ? expensesData : []);
        }

        // Investments
        const investmentsData = await investmentsRes.json();
        if (investmentsRes.ok) {
          setInvestments(Array.isArray(investmentsData) ? investmentsData : []);
        }

      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para buscar dados administrativos
  const fetchAdminData = async () => {
    if (user.perfil !== 'admin') return;
    
    setLoadingAdminData(true);
    try {
      // Por enquanto, vou simular os dados até criarmos a API
      // TODO: Implementar API /api/admin/stats
      setTimeout(() => {
        setAdminStats({
          totalUsers: 12,
          totalBalance: 125430.75,
          totalExpenses: 45720.30,
          totalInvestments: 856340.00
        });
        setLoadingAdminData(false);
      }, 1000);
    } catch (err) {
      setError('Erro ao carregar dados administrativos');
      setLoadingAdminData(false);
    }
  };

  // Funções para atualização
  const updateBalance = async () => {
    if (!balanceAmount) return;

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Por favor, insira um valor válido');
      return;
    }

    try {
      const currentAmount = balance?.amount || 0;
      let newAmount;

      if (balanceOperation === 'add') {
        newAmount = currentAmount + amount;
      } else {
        newAmount = currentAmount - amount;
        if (newAmount < 0) {
          setError('Saldo não pode ficar negativo');
          return;
        }
      }

      const response = await fetch('/api/balance', {
        method: balance ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: newAmount })
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data);
        setBalanceAmount('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao atualizar saldo');
      }
    } catch (err) {
      setError('Erro ao conectar com servidor');
    }
  };

  const addExpense = async () => {
    console.log('addExpense chamado', expenseForm);
    
    if (!expenseForm.description || !expenseForm.amount) {
      setError('Por favor, preencha a descrição e o valor da despesa');
      return;
    }

    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Por favor, insira um valor válido para a despesa');
      return;
    }

    console.log('Enviando despesa:', { description: expenseForm.description, amount, category: expenseForm.category, date: expenseForm.date });

    setSubmittingExpense(true);
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseForm.description.trim(),
          amount: amount,
          category: expenseForm.category,
          date: expenseForm.date
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses([data, ...(expenses || [])]);
        setExpenseForm({
          description: '',
          amount: '',
          category: 'Alimentação',
          date: new Date().toISOString().split('T')[0]
        });
        setError(null); // Limpar erro em caso de sucesso
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Erro ao adicionar despesa: ${response.status}`);
        console.error('Erro da API expenses:', errorData);
      }
    } catch (err) {
      setError('Erro ao conectar com servidor');
      console.error('Erro catch addExpense:', err);
    } finally {
      setSubmittingExpense(false);
    }
  };

  const removeExpense = async (id: number) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao remover despesa');
      }
    } catch (err) {
      setError('Erro ao conectar com servidor');
    }
  };

  const addInvestment = async () => {
    console.log('addInvestment chamado', investmentForm);
    
    if (!investmentForm.name || !investmentForm.amount) {
      setError('Por favor, preencha o nome e o valor do investimento');
      return;
    }

    const amount = parseFloat(investmentForm.amount);
    const currentValue = parseFloat(investmentForm.current_value || investmentForm.amount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Por favor, insira um valor válido para o investimento');
      return;
    }

    if (isNaN(currentValue) || currentValue < 0) {
      setError('Por favor, insira um valor atual válido para o investimento');
      return;
    }

    console.log('Enviando investimento:', { name: investmentForm.name, type: investmentForm.type, amount, current_value: currentValue, purchase_date: investmentForm.purchase_date });

    setSubmittingInvestment(true);

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: investmentForm.name.trim(),
          type: investmentForm.type,
          amount: amount,
          current_value: currentValue,
          purchase_date: investmentForm.purchase_date
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInvestments([data, ...(investments || [])]);
        setInvestmentForm({
          name: '',
          type: 'CDB',
          amount: '',
          current_value: '',
          purchase_date: new Date().toISOString().split('T')[0]
        });
        setError(null); // Limpar erro em caso de sucesso
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Erro ao adicionar investimento: ${response.status}`);
        console.error('Erro da API investments:', errorData);
      }
    } catch (err) {
      setError('Erro ao conectar com servidor');
      console.error('Erro catch addInvestment:', err);
    } finally {
      setSubmittingInvestment(false);
    }
  };

  // Cálculos
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalExpensesThisMonth = (expenses || []).reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
      return total + expense.amount;
    }
    return total;
  }, 0);

  const totalInvestments = (investments || []).reduce((total, investment) => total + investment.current_value, 0);
  const totalInvested = (investments || []).reduce((total, investment) => total + investment.amount, 0);
  const investmentReturn = totalInvestments - totalInvested;

  // Separar despesas por tipo simulado
  const obrigatorias = (expenses || []).filter(e => 
    ['Moradia', 'Transporte', 'Utilidades', 'Saúde', 'Educação'].includes(e.category)
  );
  const diversao = (expenses || []).filter(e => 
    ['Alimentação', 'Entretenimento', 'Compras', 'Lazer', 'Outros'].includes(e.category)
  );

  const totalObrigatorias = obrigatorias.reduce((sum, e) => sum + e.amount, 0);
  const totalDiversao = diversao.reduce((sum, e) => sum + e.amount, 0);

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Central de Finanças</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Bem-vindo, <span dangerouslySetInnerHTML={{ __html: safeEmail }} />
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <form action="/api/logout" method="post">
                <Button variant="danger" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        <Tabs defaultValue="saldo" className="w-full">
          <TabsList className={`grid w-full ${user.perfil === 'admin' ? 'grid-cols-4' : 'grid-cols-3'} mb-8`}>
            <TabsTrigger value="saldo" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Saldo
            </TabsTrigger>
            <TabsTrigger value="despesas" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Despesas
            </TabsTrigger>
            <TabsTrigger value="investimentos" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Investimentos
            </TabsTrigger>
            {user.perfil === 'admin' && (
              <TabsTrigger value="admin" className="flex items-center gap-2" onClick={fetchAdminData}>
                <Settings className="w-4 h-4" />
                Painel Admin
              </TabsTrigger>
            )}
          </TabsList>

          {/* ABA SALDO */}
          <TabsContent value="saldo" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Saldo Total da Conta
                  </CardTitle>
                  <CardDescription>Seu saldo atual disponível</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600 mb-6">
                    R$ {balance ? balance.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <select 
                        value={balanceOperation} 
                        onChange={(e) => setBalanceOperation(e.target.value as 'add' | 'remove')}
                        className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <option value="add">Adicionar</option>
                        <option value="remove">Remover</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="Valor (R$)"
                        value={balanceAmount}
                        onChange={(e) => setBalanceAmount(e.target.value)}
                        step="0.01"
                        className="flex-1"
                      />
                      <Button 
                        onClick={updateBalance} 
                        disabled={!balanceAmount}
                        variant={balanceOperation === 'add' ? 'primary' : 'danger'}
                      >
                        {balanceOperation === 'add' ? '+ Adicionar' : '- Remover'}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {balanceOperation === 'add' ? 
                        'Adicione dinheiro ao seu saldo (receita, salário, etc.)' : 
                        'Remova dinheiro do seu saldo (saques, transferências, etc.)'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receitas:</span>
                    <span className="font-bold text-green-600">
                      R$ {balance ? balance.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Despesas Totais:</span>
                    <span className="font-bold text-red-600">
                      R$ {totalExpensesThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Investido:</span>
                    <span className="font-bold text-blue-600">
                      R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Saldo Líquido:</span>
                    <span className="font-bold text-lg">
                      R$ {((balance?.amount || 0) - totalExpensesThisMonth).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA DESPESAS */}
          <TabsContent value="despesas" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Despesas Obrigatórias</CardTitle>
                  <CardDescription>Gastos fixos mensais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-4">
                    R$ {totalObrigatorias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(!obrigatorias || obrigatorias.length === 0) ? (
                      <p className="text-gray-500 text-center py-4">Nenhuma despesa obrigatória</p>
                    ) : (
                      obrigatorias.map(expense => (
                        <div key={expense.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                          <div>
                            <div className="font-medium">{expense.description}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(expense.date).toLocaleDateString('pt-BR')} • {expense.category}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600">
                              R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeExpense(expense.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Despesas de Diversão</CardTitle>
                  <CardDescription>Gastos ocasionais do mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600 mb-4">
                    R$ {totalDiversao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(!diversao || diversao.length === 0) ? (
                      <p className="text-gray-500 text-center py-4">Nenhuma despesa de diversão</p>
                    ) : (
                      diversao.map(expense => (
                        <div key={expense.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div>
                            <div className="font-medium">{expense.description}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(expense.date).toLocaleDateString('pt-BR')} • {expense.category}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-orange-600">
                              R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeExpense(expense.id)}
                              className="text-orange-600 hover:text-orange-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Adicionar Nova Despesa</CardTitle>
                <CardDescription>Registre uma nova despesa obrigatória ou de diversão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      placeholder="Ex: Aluguel, Cinema..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <select 
                      value={expenseForm.category} 
                      onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Moradia">Moradia (Obrigatória)</option>
                      <option value="Transporte">Transporte (Obrigatória)</option>
                      <option value="Utilidades">Utilidades (Obrigatória)</option>
                      <option value="Saúde">Saúde (Obrigatória)</option>
                      <option value="Educação">Educação (Obrigatória)</option>
                      <option value="Alimentação">Alimentação (Diversão)</option>
                      <option value="Entretenimento">Entretenimento (Diversão)</option>
                      <option value="Compras">Compras (Diversão)</option>
                      <option value="Lazer">Lazer (Diversão)</option>
                      <option value="Outros">Outros (Diversão)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={addExpense} className="mt-4" disabled={!expenseForm.description || !expenseForm.amount || submittingExpense}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  {submittingExpense ? 'Adicionando...' : 'Adicionar Despesa'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA INVESTIMENTOS */}
          <TabsContent value="investimentos" className="space-y-6">
            <div className="flex justify-end">
              <Link href="/investments">
                <Button>Gerenciar Investimentos</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">Total Investido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">Valor Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">Ganho/Perda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${investmentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {investmentReturn >= 0 ? '+' : ''}R$ {investmentReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-500">
                    {totalInvested > 0 ? `${investmentReturn >= 0 ? '+' : ''}${((investmentReturn / totalInvested) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {(!investments || investments.length === 0) ? (
                <Card className="md:col-span-2">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Nenhum investimento encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                investments.map(investment => {
                  const gainLoss = investment.current_value - investment.amount;
                  const gainLossPercent = totalInvested > 0 ? (gainLoss / investment.amount) * 100 : 0;
                  
                  return (
                    <Card key={investment.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{investment.name}</CardTitle>
                            <CardDescription>{investment.type}</CardDescription>
                          </div>
                          <Badge variant={gainLoss >= 0 ? "default" : "destructive"} className={gainLoss >= 0 ? "bg-green-100 text-green-800" : ""}>
                            {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Valor Investido:</span>
                            <span className="font-bold">
                              R$ {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Valor Atual:</span>
                            <span className="font-bold text-blue-600">
                              R$ {investment.current_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t pt-3">
                            <span className="text-sm font-medium">Ganho/Perda:</span>
                            <span className={`font-bold text-lg ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {gainLoss >= 0 ? '+' : ''}R$ {gainLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Comprado em: {new Date(investment.purchase_date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Novo Investimento</CardTitle>
                <CardDescription>Adicione um novo investimento à sua carteira</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="investmentName">Nome</Label>
                    <Input
                      id="investmentName"
                      value={investmentForm.name}
                      onChange={(e) => setInvestmentForm({...investmentForm, name: e.target.value})}
                      placeholder="Ex: CDB Banco Inter"
                    />
                  </div>
                  <div>
                    <Label htmlFor="investmentType">Tipo</Label>
                    <select 
                      value={investmentForm.type} 
                      onChange={(e) => setInvestmentForm({...investmentForm, type: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="CDB">CDB</option>
                      <option value="Ações">Ações</option>
                      <option value="Fundos">Fundos</option>
                      <option value="Tesouro Direto">Tesouro Direto</option>
                      <option value="LCI">LCI</option>
                      <option value="LCA">LCA</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="investmentAmount">Valor Investido (R$)</Label>
                    <Input
                      id="investmentAmount"
                      type="number"
                      step="0.01"
                      value={investmentForm.amount}
                      onChange={(e) => setInvestmentForm({...investmentForm, amount: e.target.value})}
                      placeholder="1000,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentValue">Valor Atual (R$)</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      step="0.01"
                      value={investmentForm.current_value}
                      onChange={(e) => setInvestmentForm({...investmentForm, current_value: e.target.value})}
                      placeholder="1050,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchaseDate">Data Compra</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={investmentForm.purchase_date}
                      onChange={(e) => setInvestmentForm({...investmentForm, purchase_date: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={addInvestment} className="mt-4" disabled={!investmentForm.name || !investmentForm.amount || submittingInvestment}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  {submittingInvestment ? 'Adicionando...' : 'Adicionar Investimento'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA PAINEL ADMIN - Apenas para Administradores */}
          {user.perfil === 'admin' && (
            <TabsContent value="admin" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-indigo-600" />
                  Painel Administrativo
                </h2>
                <p className="text-gray-600">Visão geral e controle da plataforma</p>
              </div>

              {loadingAdminData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Carregando dados administrativos...</p>
                </div>
              ) : (
                <>
                  {/* Métricas Gerais */}
                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Total de Usuários
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {adminStats?.totalUsers || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Usuários ativos na plataforma</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Patrimônio Total
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          R$ {adminStats?.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Soma de todos os saldos</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Despesas Totais
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          R$ {adminStats?.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Este mês - todos os usuários</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Investimentos Totais
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          R$ {adminStats?.totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Valor atual - todos os usuários</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Ações Administrativas */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                          Relatórios e Análises
                        </CardTitle>
                        <CardDescription>Gere relatórios detalhados da plataforma</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="secondary" className="w-full justify-start">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Relatório de Usuários
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Análise de Investimentos
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Relatório de Despesas
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Gerenciamento de Usuários
                        </CardTitle>
                        <CardDescription>Controle e monitore usuários da plataforma</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="secondary" className="w-full justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Listar Todos os Usuários
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurações do Sistema
                        </Button>
                        <Button 
                          variant="secondary" 
                          className="w-full justify-start"
                          onClick={() => window.location.href = '/admin/tipos-investimento'}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Gerenciar Tipos de Investimento
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alertas e Notificações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-600">⚠️ Alertas do Sistema</CardTitle>
                      <CardDescription>Monitore situações que precisam de atenção</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div>
                            <p className="font-medium text-yellow-800">Usuários com saldo negativo</p>
                            <p className="text-sm text-yellow-600">2 usuários precisam de atenção</p>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">2</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <p className="font-medium text-green-800">Sistema funcionando normalmente</p>
                            <p className="text-sm text-green-600">Todas as APIs respondendo corretamente</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}