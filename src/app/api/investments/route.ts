import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { getSessionUser } from '@/lib/session';
import { Investment, CreateInvestmentRequest, UpdateInvestmentRequest } from '@/lib/models/Investment';

// GET /api/investments - Listar investimentos do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    let query = 'SELECT * FROM investments WHERE user_id = ?';
    const params: any[] = [user.userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY purchase_date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params) as any[];

    const investments: Investment[] = rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      type: row.type,
      amount: parseFloat(row.amount),
      current_value: parseFloat(row.current_value),
      purchase_date: row.purchase_date,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return NextResponse.json(investments);
  } catch (error) {
    console.error('Erro ao buscar investimentos:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/investments - Criar novo investimento
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body: CreateInvestmentRequest = await request.json();
    const { name, type, amount, current_value, purchase_date } = body;

    // Validações
    if (!name || !type || !amount || !current_value || !purchase_date) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { message: 'Valor inicial deve ser um número positivo' },
        { status: 400 }
      );
    }

    if (typeof current_value !== 'number' || current_value < 0) {
      return NextResponse.json(
        { message: 'Valor atual deve ser um número não negativo' },
        { status: 400 }
      );
    }

    // Verificar se a data é válida
    const investmentDate = new Date(purchase_date);
    if (isNaN(investmentDate.getTime())) {
      return NextResponse.json(
        { message: 'Data de compra inválida' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO investments (user_id, name, type, amount, current_value, purchase_date) VALUES (?, ?, ?, ?, ?, ?)',
      [user.userId, name, type, amount, current_value, purchase_date]
    ) as any[];

    const investment: Investment = {
      id: result.insertId,
      user_id: user.userId,
      name,
      type,
      amount,
      current_value,
      purchase_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar investimento:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/investments - Atualizar investimento
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const investmentId = searchParams.get('id');

    if (!investmentId) {
      return NextResponse.json(
        { message: 'ID do investimento é obrigatório' },
        { status: 400 }
      );
    }

    const body: UpdateInvestmentRequest = await request.json();
    const { name, type, amount, current_value, purchase_date } = body;

    // Verificar se o investimento existe e pertence ao usuário
    const [existingRows] = await pool.execute(
      'SELECT id FROM investments WHERE id = ? AND user_id = ?',
      [investmentId, user.userId]
    ) as any[];

    if (existingRows.length === 0) {
      return NextResponse.json(
        { message: 'Investimento não encontrado' },
        { status: 404 }
      );
    }

    // Construir query de update dinâmica
    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { message: 'Valor inicial deve ser um número positivo' },
          { status: 400 }
        );
      }
      updates.push('amount = ?');
      params.push(amount);
    }

    if (current_value !== undefined) {
      if (typeof current_value !== 'number' || current_value < 0) {
        return NextResponse.json(
          { message: 'Valor atual deve ser um número não negativo' },
          { status: 400 }
        );
      }
      updates.push('current_value = ?');
      params.push(current_value);
    }

    if (purchase_date !== undefined) {
      const investmentDate = new Date(purchase_date);
      if (isNaN(investmentDate.getTime())) {
        return NextResponse.json(
          { message: 'Data de compra inválida' },
          { status: 400 }
        );
      }
      updates.push('purchase_date = ?');
      params.push(purchase_date);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(investmentId, user.userId);

    const updateQuery = `UPDATE investments SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    await pool.execute(updateQuery, params);

    // Buscar o investimento atualizado
    const [updatedRows] = await pool.execute(
      'SELECT * FROM investments WHERE id = ? AND user_id = ?',
      [investmentId, user.userId]
    ) as any[];

    const investment: Investment = {
      id: updatedRows[0].id,
      user_id: updatedRows[0].user_id,
      name: updatedRows[0].name,
      type: updatedRows[0].type,
      amount: parseFloat(updatedRows[0].amount),
      current_value: parseFloat(updatedRows[0].current_value),
      purchase_date: updatedRows[0].purchase_date,
      created_at: updatedRows[0].created_at,
      updated_at: updatedRows[0].updated_at
    };

    return NextResponse.json(investment);
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/investments - Deletar investimento
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const investmentId = searchParams.get('id');

    if (!investmentId) {
      return NextResponse.json(
        { message: 'ID do investimento é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o investimento existe e pertence ao usuário
    const [existingRows] = await pool.execute(
      'SELECT id FROM investments WHERE id = ? AND user_id = ?',
      [investmentId, user.userId]
    ) as any[];

    if (existingRows.length === 0) {
      return NextResponse.json(
        { message: 'Investimento não encontrado' },
        { status: 404 }
      );
    }

    await pool.execute(
      'DELETE FROM investments WHERE id = ? AND user_id = ?',
      [investmentId, user.userId]
    );

    return NextResponse.json({ message: 'Investimento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar investimento:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}