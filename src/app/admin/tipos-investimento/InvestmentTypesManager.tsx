'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InvestmentType, CreateInvestmentTypeData, RISK_LEVELS } from '@/lib/models/InvestmentType';

interface InvestmentTypesManagerProps {}

export default function InvestmentTypesManager({}: InvestmentTypesManagerProps) {
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<InvestmentType | null>(null);
  const [formData, setFormData] = useState<CreateInvestmentTypeData>({
    name: '',
    description: '',
    expected_return_percent: 0,
    risk_level: 'Médio'
  });

  useEffect(() => {
    loadInvestmentTypes();
  }, []);

  const loadInvestmentTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/investment-types');
      const data = await response.json();
      
      if (response.ok) {
        setInvestmentTypes(data.investment_types);
      } else {
        setError(data.error || 'Erro ao carregar tipos de investimento');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingType ? '/api/investment-types' : '/api/investment-types';
      const method = editingType ? 'PUT' : 'POST';
      const body = editingType ? { id: editingType.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        await loadInvestmentTypes();
        setShowForm(false);
        setEditingType(null);
        setFormData({
          name: '',
          description: '',
          expected_return_percent: 0,
          risk_level: 'Médio'
        });
      } else {
        setError(data.error || 'Erro ao salvar tipo de investimento');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleEdit = (type: InvestmentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      expected_return_percent: type.expected_return_percent,
      risk_level: type.risk_level
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o tipo \"${name}\"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/investment-types', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadInvestmentTypes();
      } else {
        setError(data.error || 'Erro ao excluir tipo de investimento');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Baixo': return 'text-green-600 bg-green-100';
      case 'Médio': return 'text-yellow-600 bg-yellow-100';
      case 'Alto': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tipos de investimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tipos de Investimento Disponíveis</h2>
        <Button 
          variant="primary" 
          onClick={() => {
            setShowForm(true);
            setEditingType(null);
            setFormData({
              name: '',
              description: '',
              expected_return_percent: 0,
              risk_level: 'Médio'
            });
          }}
        >
          + Novo Tipo
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingType ? 'Editar Tipo de Investimento' : 'Novo Tipo de Investimento'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: CDB, Ações, Fundos..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Descrição do tipo de investimento..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retorno Esperado (% ao ano) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.expected_return_percent}
                  onChange={(e) => setFormData({...formData, expected_return_percent: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: 12.50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Risco *
                </label>
                <select
                  value={formData.risk_level}
                  onChange={(e) => setFormData({...formData, risk_level: e.target.value as 'Baixo' | 'Médio' | 'Alto'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {RISK_LEVELS.map(risk => (
                    <option key={risk.value} value={risk.value}>
                      {risk.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingType ? 'Atualizar' : 'Criar'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Investment Types List */}
      <div className="grid gap-4">
        {investmentTypes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhum tipo de investimento cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          investmentTypes.map((type) => (
            <Card key={type.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    {type.description && (
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(type)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(type.id, type.name)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {type.expected_return_percent.toFixed(2)}%
                      </p>
                      <p className="text-xs text-gray-500">Retorno esperado</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(type.risk_level)}`}>
                        Risco {type.risk_level}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Criado: {new Date(type.created_at).toLocaleDateString('pt-BR')}</p>
                    {type.updated_at !== type.created_at && (
                      <p>Atualizado: {new Date(type.updated_at).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}