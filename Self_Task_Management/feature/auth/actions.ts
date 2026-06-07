'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient, clearAuthCookies } from '@/lib/supabase/server'

/**
 * Server Action: Sign in with email + password.
 * Uses the SSR Supabase client so cookies are set correctly.
 */
export async function signInWithPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: error.message || 'Thông tin đăng nhập không hợp lệ',
    }
  }

  // Revalidate the layout so any server components / layout can see the new session
  revalidatePath('/', 'layout')

  return { success: true }
}

/**
 * Server Action: Sign up new user (username + email + password).
 *
 * Flow (Auth-first, then DB):
 *  1. Validate inputs
 *  2. Hash password (scrypt — Node.js built-in, no extra deps)
 *  3. Create Supabase Auth user via admin API
 *  4. Only if ③ succeeds → INSERT into public.users (username, email, auth_user_id, password_hash)
 *  5. If DB insert fails → rollback the Auth user
 *
 * Auth-first flow because public.users.id is auto-increment bigint,
 * not a UUID we can pre-generate. auth_user_id bridges the two systems.
 */
export async function signUp(formData: FormData) {
  const username = (formData.get('username') as string || '').trim()
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string

  // ── Validation ──────────────────────────────────────────────
  if (!username || username.length < 3 || username.length > 20) {
    return {
      success: false,
      error: 'Tên người dùng phải từ 3 đến 20 ký tự.',
    }
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: 'Địa chỉ email không hợp lệ.',
    }
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: 'Mật khẩu phải có ít nhất 6 ký tự.',
    }
  }

  // ── Step 1: Hash password ───────────────────────────────────
  const { hashPassword } = await import('./lib/password')
  const passwordHash = await hashPassword(password)

  const { supabaseAdmin } = await import('@/lib/supabase/server')

  // ── Step 2: Create Auth user first (Auth-first) ────────────
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  })

  if (authError) {
    if (authError.message?.includes('already registered')) {
      return { success: false, error: 'Email này đã được sử dụng.' }
    }
    return {
      success: false,
      error: authError.message || 'Không thể tạo tài khoản xác thực.',
    }
  }

  const authUserId = authData.user.id

  // ── Step 3: INSERT into public.users ──────────────────────────
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      username,
      email,
      password_hash: passwordHash,
      auth_user_id: authUserId,
    })

  if (dbError) {
    // ── Rollback: remove the Auth user ────────────────────────
    await supabaseAdmin.auth.admin.deleteUser(authUserId)

    if (dbError.code === '23505') {
      if (dbError.message?.includes('email')) {
        return { success: false, error: 'Email này đã được sử dụng.' }
      }
      if (dbError.message?.includes('username')) {
        return { success: false, error: 'Tên người dùng này đã được sử dụng.' }
      }
      return { success: false, error: 'Email hoặc tên người dùng đã tồn tại.' }
    }
    return {
      success: false,
      error: dbError.message || 'Không thể tạo hồ sơ người dùng trong database.',
    }
  }

  // ── Step 4: Auto sign-in (so user doesn't need to login again) ──
  const supabase = await createClient()
  await supabase.auth.signInWithPassword({ email, password })

  revalidatePath('/', 'layout')

  // ── Step 5: Process invite token if present ──
  const inviteToken = (formData.get('invite_token') as string) || ''
  if (inviteToken) {
    const { verifyInvitation } = await import('@/feature/groups/actions')
    const invResult = await verifyInvitation(inviteToken)
    if (invResult.success && invResult.groupId) {
      redirect(`/groups/${invResult.groupId}`)
    }
  }

  return {
    success: true,
    message: 'Tài khoản đã được tạo thành công!',
  }
}

/**
 * Server Action: Sign out current user.
 */
export async function signOut() {
  const supabase = await createClient()

  await supabase.auth.signOut()
  await clearAuthCookies()

  revalidatePath('/', 'layout')
  redirect('/sign-in')
}

/**
 * Server-only helper to get the current authenticated user.
 * Returns null if not logged in.
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// =============================================================================
// DEV / TESTING UTILITIES (only for development - use supabaseAdmin)
// These make it convenient for devs to create as many test accounts as needed
// without going through email confirmation or manual sign-up.
// =============================================================================

/**
 * Creates multiple test accounts for development/testing.
 * Uses admin API so no email confirmation is required.
 * 
 * @param count number of accounts to create
 * @param prefix base for username/email e.g. "devtest"
 * @param password default password for all (for convenience in testing)
 */
export async function createTestAccounts(
  count: number,
  prefix: string = 'devtest',
  password: string = 'testpass123'
): Promise<{
  success: boolean
  results?: Array<{ username: string; email: string; success: boolean; error?: string }>
  passwordUsed?: string
  error?: string
}> {
  if (process.env.NODE_ENV !== 'development') {
    return { success: false, error: 'Only available in development' }
  }

  // Dynamic import so regular auth flows don't pull in the admin client (which requires ws transport in Node)
  const { supabaseAdmin } = await import('@/lib/supabase/server')

  const results: Array<{ username: string; email: string; success: boolean; error?: string }> = []

  for (let i = 1; i <= count; i++) {
    const username = `${prefix}-${i}`
    const email = `${prefix}-${i}@dev.test`

    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username },
      })

      if (authError) {
        results.push({ username, email, success: false, error: authError.message })
      } else {
        // Also insert into public.users so the user record exists
        const { hashPassword } = await import('./lib/password')
        const pwdHash = await hashPassword(password)
        const { error: dbError } = await supabaseAdmin
          .from('users')
          .insert({ username, email, password_hash: pwdHash, auth_user_id: authData.user.id })
        if (dbError) {
          // Rollback auth user
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          results.push({ username, email, success: false, error: dbError.message })
        } else {
          results.push({ username, email, success: true })
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      results.push({ username, email, success: false, error: msg })
    }
  }

  return { success: true, results, passwordUsed: password }
}

/**
 * Lists test accounts (users with emails ending in @dev.test)
 */
export async function listTestAccounts(): Promise<{
  success: boolean
  users?: Array<{ id: string; email: string; username?: string; created_at?: string }>
  error?: string
}> {
  if (process.env.NODE_ENV !== 'development') {
    return { success: false, error: 'Only available in development' }
  }

  const { supabaseAdmin } = await import('@/lib/supabase/server')

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const testUsers = (data.users || []).filter((u): u is typeof u & { email: string } => 
    !!u.email && u.email.endsWith('@dev.test')
  )

  return {
    success: true,
    users: testUsers.map(u => ({
      id: u.id,
      email: u.email,
      username: u.user_metadata?.username,
      created_at: u.created_at,
    })),
  }
}

/**
 * Deletes all test accounts (users with @dev.test emails). Use with caution.
 */
export async function deleteAllTestAccounts(): Promise<{
  success: boolean
  results?: Array<{ email: string; success: boolean; error?: string }>
  error?: string
}> {
  if (process.env.NODE_ENV !== 'development') {
    return { success: false, error: 'Only available in development' }
  }

  const { supabaseAdmin } = await import('@/lib/supabase/server')

  const list = await listTestAccounts()
  if (!list.success || !list.users) {
    return { success: false, error: list.error || 'Failed to list before delete' }
  }

  const deleteResults: Array<{ email: string; success: boolean; error?: string }> = []
  for (const u of list.users) {
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(u.id)
      deleteResults.push({ email: u.email, success: !error, error: error?.message })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      deleteResults.push({ email: u.email, success: false, error: msg })
    }
  }

  return { success: true, results: deleteResults }
}
