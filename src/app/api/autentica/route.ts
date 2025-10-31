import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    // Controle de tentativas por IP/sessão (bloqueio simples)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const attemptsCookieName = `login-attempts-${ip}`;
    const attemptsRaw = request.cookies.get(attemptsCookieName)?.value;
    const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;
    const MAX_ATTEMPTS = 5;
    const LOCK_MINUTES = 15; // bloquear por 15 minutos

    if (attempts >= MAX_ATTEMPTS) {
      const res = NextResponse.json(
        { message: 'Muitas tentativas falhas. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
      // renova a janela de bloqueio
      res.cookies.set(attemptsCookieName, String(attempts), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: LOCK_MINUTES * 60,
        path: '/',
      });
      return res;
    }

    // Validar dados de entrada
    if (!email || !senha) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar credenciais
    const user = await verifyCredentials({ email, senha });

    if (!user) {
      const res = NextResponse.json(
        { message: 'Email ou senha inválidos' },
        { status: 401 }
      );
      const nextAttempts = attempts + 1;
      res.cookies.set(attemptsCookieName, String(nextAttempts), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: LOCK_MINUTES * 60,
        path: '/',
      });
      return res;
    }

    // Gerar token JWT
    const token = generateToken(user);

    // Retornar JSON para chamadas via fetch; o client fará o redirect
    const response = NextResponse.json(
      {
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          perfil: user.perfil
        }
      },
      { status: 200 }
    );

    // Resetar tentativas e configurar cookie HTTP-only para segurança
    response.cookies.set(attemptsCookieName, '0', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas (em segundos)
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
