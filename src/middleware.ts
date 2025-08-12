import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// No se puede usar 'jsonwebtoken' en Edge Runtime. Validamos JWT manualmente (estructura y expiración).

// Rutas protegidas
const protectedRoutes = [
  '/admin',
  '/dashboard',
  '/produccion',
  '/proyectos',
  '/registros',
  '/reportes',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica si la ruta es protegida
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Ejemplo: verifica si existe una cookie de autenticación
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Validar JWT: estructura y expiración
    const parts = token.split('.');
    if (parts.length !== 3) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    try {
      // Decodificar payload
      const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = JSON.parse(decodeURIComponent(escape(atob(payloadB64))));
      // Verificar expiración
      if (!payloadJson.exp || Date.now() / 1000 > payloadJson.exp) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (err) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/produccion/:path*',
    '/proyectos/:path*',
    '/registros/:path*',
    '/reportes/:path*',
  ],
};
