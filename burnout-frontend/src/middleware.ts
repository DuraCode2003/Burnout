import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];
const STUDENT_PATHS = ['/dashboard', '/checkin', '/insights', '/breathing', '/consent'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Check if path requires auth
  const isStudentPath = STUDENT_PATHS.some((path) => pathname.startsWith(path));

  // Allow public paths without auth
  if (isPublicPath) {
    if (token) {
      // If already authenticated, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect student paths
  if (isStudentPath || pathname === '/') {
    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check consent status
    const hasConsent = request.cookies.get('consent_given')?.value === 'true';

    // If on /consent page and already has consent, go to dashboard
    if (hasConsent && pathname.startsWith('/consent')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If not on /consent page and needs consent, go to consent page
    if (!hasConsent && !pathname.startsWith('/consent')) {
      return NextResponse.redirect(new URL('/consent', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
