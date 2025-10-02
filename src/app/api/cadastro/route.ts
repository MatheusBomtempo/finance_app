import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, senha, perfil } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const perfilFinal = perfil === 'admin' ? 'admin' : 'user';

    // Verificar se já existe usuário com este email
    const [rows] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    ) as any[];

    if (rows.length > 0) {
      return NextResponse.json(
        { message: 'Já existe um usuário com este email' },
        { status: 409 }
      );
    }

    const senhaHash = await hashPassword(senha);

    const [result] = await pool.execute(
      'INSERT INTO usuarios (email, senha_hash, perfil) VALUES (?, ?, ?)',
      [email, senhaHash, perfilFinal]
    ) as any[];

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


