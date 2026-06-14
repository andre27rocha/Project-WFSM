import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/admin/auth'
import { siteConfig } from '@/config/site'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const cookie = request.cookies.get(siteConfig.admin.cookieName)
  const password = process.env.ADMIN_PASSWORD

  if (!cookie?.value || !password) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const isValid = await verifyAdminToken(
    cookie.value,
    password,
    siteConfig.admin.sessionMaxAgeSeconds * 1000
  )

  if (!isValid) {
    const res = NextResponse.redirect(new URL('/admin/login', request.url))
    res.cookies.delete(siteConfig.admin.cookieName)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
