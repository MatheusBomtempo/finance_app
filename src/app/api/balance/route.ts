import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { getSessionUser } from '@/lib/session';
import { Balance, CreateBalanceRequest, UpdateBalanceRequest } from '@/lib/models/Balance';

// GET /api/balance - Obter saldo do usuário
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM balances WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
      [user.userId]
    ) as any[];

    if (rows.length === 0) {
      // Se não existe saldo, criar um com valor 0
      const [result] = await pool.execute(
        'INSERT INTO balances (user_id, amount) VALUES (?, 0.00)',
        [user.userId]
      ) as any[];

      const balance: Balance = {
        id: result.insertId,
        user_id: user.userId,
        amount: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json(balance);
    }

    const balance: Balance = {
      id: rows[0].id,
      user_id: rows[0].user_id,
      amount: parseFloat(rows[0].amount),
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at
    };

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/balance - Criar novo saldo
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body: CreateBalanceRequest = await request.json();
    const { amount } = body;

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { message: 'Valor deve ser um número positivo' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO balances (user_id, amount) VALUES (?, ?)',
      [user.userId, amount]
    ) as any[];

    const balance: Balance = {
      id: result.insertId,
      user_id: user.userId,
      amount: amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(balance, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar saldo:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/balance - Atualizar saldo do usuário
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body: UpdateBalanceRequest = await request.json();
    const { amount } = body;

    if (typeof amount !== 'number') {
      return NextResponse.json(
        { message: 'Valor deve ser um número' },
        { status: 400 }
      );
    }

    // Verificar se já existe um saldo para o usuário
    const [existingRows] = await pool.execute(
      'SELECT id FROM balances WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
      [user.userId]
    ) as any[];

    if (existingRows.length === 0) {
      // Se não existe, criar um novo
      const [result] = await pool.execute(
        'INSERT INTO balances (user_id, amount) VALUES (?, ?)',
        [user.userId, amount]
      ) as any[];

      const balance: Balance = {
        id: result.insertId,
        user_id: user.userId,
        amount: amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json(balance);
    }

    // Atualizar o saldo existente
    await pool.execute(
      'UPDATE balances SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [amount, user.userId]
    );

    // Buscar o saldo atualizado
    const [updatedRows] = await pool.execute(
      'SELECT * FROM balances WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
      [user.userId]
    ) as any[];

    const balance: Balance = {
      id: updatedRows[0].id,
      user_id: updatedRows[0].user_id,
      amount: parseFloat(updatedRows[0].amount),
      created_at: updatedRows[0].created_at,
      updated_at: updatedRows[0].updated_at
    };

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}