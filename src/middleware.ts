import { NextRequest, NextResponse } from 'next/server';

// Páginas que requerem autenticação
const protectedRoutes = ['/dashboard'];

// Páginas que não devem ser acessadas por usuários logados
const publicRoutes = ['/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se a rota está protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Verificar se é uma rota pública (que não deve ser acessada por usuários logados)
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Obter token do cookie
  const token = request.cookies.get('auth-token')?.value;

  // Decodificar levemente o JWT (sem verificar assinatura) pois middleware roda no Edge
  const decodedToken = (() => {
    if (!token) return null as any;
    const parts = token.split('.');
    if (parts.length !== 3) return null as any;
    try {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
      return payload as any;
    } catch {
      return null as any;
    }
  })();
  
  if (isProtectedRoute && !decodedToken) {
    // Redirecionar para login se não estiver autenticado
    const url = new URL('/', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  if (isPublicRoute && decodedToken) {
    // Redirecionar para dashboard se já estiver logado
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  // Se o token estiver expirado, redirecionar para login
  if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
