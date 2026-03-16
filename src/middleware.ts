import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/api/leads',
  '/api/proposals',
  '/api/jobs',
  '/api/generate-proposal',
  '/api/reprice',
];

// Public exceptions within protected prefixes
function isPublicRoute(req: NextRequest): boolean {
  const { pathname } = req.nextUrl;

  // POST /api/leads is public (chatbot lead intake)
  if (pathname === '/api/leads' && req.method === 'POST') return true;

  // /api/chat is public (chatbot photo analysis)
  if (pathname === '/api/chat') return true;

  // /p/[id] is public (customer proposal view)
  if (pathname.startsWith('/p/')) return true;

  // /widget/chat is public
  if (pathname.startsWith('/widget/')) return true;

  // /login is public
  if (pathname === '/login') return true;

  return false;
}

export async function middleware(req: NextRequest) {
  // Skip if not a protected route
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected || isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Create a response we can modify (to set cookies from token refresh)
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set on the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          // Recreate response with updated request
          response = NextResponse.next({ request: req });
          // Set on the response (for the browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Verify the user — this contacts Supabase Auth server
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // API routes get 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Page routes redirect to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/leads/:path*',
    '/api/proposals/:path*',
    '/api/jobs/:path*',
    '/api/generate-proposal',
    '/api/reprice',
  ],
};
