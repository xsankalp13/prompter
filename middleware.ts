import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/admin']
// Admin-only routes
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
    const { supabaseResponse, user, supabase } = await updateSession(request)

    const pathname = request.nextUrl.pathname

    // Check if route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !user) {
        // Redirect to login if not authenticated
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    if (isAdminRoute && user) {
        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            // Redirect non-admins to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Redirect authenticated users away from auth pages
    const isAuthRoute = pathname === '/login' || pathname === '/signup'
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
