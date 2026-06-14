'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { env } from '@/config/env'
import { siteConfig } from '@/config/site'
import { signAdminToken } from '@/lib/admin/auth'

export type LoginState = { error: string } | null

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const submitted = formData.get('password')

  if (typeof submitted !== 'string' || submitted !== env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password.' }
  }

  const token = await signAdminToken(env.ADMIN_PASSWORD)
  const cookieStore = await cookies()

  cookieStore.set(siteConfig.admin.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: siteConfig.admin.sessionMaxAgeSeconds,
    path: '/',
  })

  redirect('/admin')
}
