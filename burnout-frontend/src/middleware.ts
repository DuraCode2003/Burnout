import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];
const STUDENT_PATHS = ['/dashboard', '/checkin', '/insights', '/breathing', '/consent'];
const COUNSELOR_PATHS = ['/counselor'];
const ADMIN_PATHS = ['/admin'];

// Decode JWT token to get user role (basic implementation)
function decodeToken(token: string): { role?: string; roles?: string; userId?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Check path types
  const isStudentPath = STUDENT_PATHS.some((path) => pathname.startsWith(path));
  const isCounselorPath = COUNSELOR_PATHS.some((path) => pathname.startsWith(path));
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  // Allow public paths without auth
  if (isPublicPath) {
    if (token) {
      // If already authenticated, redirect to appropriate dashboard
      const tokenData = decodeToken(token);
      let userRole = tokenData?.role;
      if (!userRole && tokenData?.roles) {
        userRole = tokenData.roles.replace('ROLE_', '');
      }

      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (userRole === 'COUNSELOR') {
        return NextResponse.redirect(new URL('/counselor', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect all authenticated paths
  if (isStudentPath || isCounselorPath || isAdminPath || pathname === '/') {
    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode token to get roles
    const tokenData = decodeToken(token);
    const rawRoles = tokenData?.role || tokenData?.roles || "";
    const userRoles = rawRoles.split(',').map(r => r.trim().replace('ROLE_', ''));

    // Handle consent check for student paths only
    if (isStudentPath || pathname === '/') {
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

    // Role-based access control
    if (isCounselorPath) {
      // Counselor paths require COUNSELOR role only
      if (!userRoles.includes('COUNSELOR')) {
        // Wrong role, redirect to appropriate dashboard
        if (userRoles.includes('ADMIN')) {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (userRoles.includes('STUDENT')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    if (isAdminPath) {
      // Admin paths require ADMIN role only
      if (!userRoles.includes('ADMIN')) {
        // Wrong role, redirect to appropriate dashboard
        if (userRoles.includes('COUNSELOR')) {
          return NextResponse.redirect(new URL('/counselor', request.url));
        } else if (userRoles.includes('STUDENT')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Student paths - allow STUDENT, COUNSELOR, and ADMIN roles
    // No strict restriction here as counselors/admins may need to see student view features
    if (isStudentPath) {
       return NextResponse.next();
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
