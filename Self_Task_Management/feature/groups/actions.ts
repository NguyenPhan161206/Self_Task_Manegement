'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getUserIdFromAuth } from '@/feature/auth/lib/getUserId'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  const creatorId = await getUserIdFromAuth()
  if (!creatorId) return { success: false, error: 'Chưa đăng nhập.' }

  const name = (formData.get('name') as string || '').trim()
  if (!name) return { success: false, error: 'Tên nhóm không được để trống.' }
  if (name.length > 100) return { success: false, error: 'Tên nhóm tối đa 100 ký tự.' }

  const description = (formData.get('description') as string || '').trim() || null
  const avatar = (formData.get('avatar') as string || '').trim() || null

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      name,
      description,
      avatar,
      created_by: creatorId,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Add creator as admin
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: creatorId, role_id: 1 })

  if (memberError) {
    await supabase.from('groups').delete().eq('id', group.id)
    return { success: false, error: memberError.message }
  }

  // Enable all modules by default
  const { data: modules } = await supabase.from('modules').select('id')
  if (modules && modules.length > 0) {
    await supabase.from('group_modules').insert(
      modules.map(m => ({ group_id: group.id, module_id: m.id, enabled: true }))
    )
  }

  revalidatePath('/groups')
  return { success: true, group }
}

export async function updateGroup(groupId: number, formData: FormData) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership || membership.role_id !== 1) {
    return { success: false, error: 'Chỉ admin mới có thể chỉnh sửa nhóm.' }
  }

  const name = (formData.get('name') as string || '').trim()
  if (!name) return { success: false, error: 'Tên nhóm không được để trống.' }

  const description = (formData.get('description') as string || '').trim() || null
  const avatar = (formData.get('avatar') as string || '').trim() || null

  const { error } = await supabase
    .from('groups')
    .update({
      name,
      description,
      avatar,
      updated_at: new Date().toISOString(),
    })
    .eq('id', groupId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/groups')
  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function deleteGroup(groupId: number) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership || membership.role_id !== 1) {
    return { success: false, error: 'Chỉ admin mới có thể xoá nhóm.' }
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function inviteByEmail(groupId: number, email: string) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  // 1. Check permission (admin only)
  const { data: membership } = await supabase
    .from('group_members')
    .select('role_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership || membership.role_id !== 1) {
    return { success: false, error: 'Chỉ admin mới có thể mời thành viên.' }
  }

  // 2. Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Email không hợp lệ.' }
  }

  // 3. Check if user already exists with this email
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    // User exists → use existing inviteMember flow
    return inviteMember(groupId, existingUser.id)
  }

  // 4. Create invitation
  const { supabaseAdmin } = await import('@/lib/supabase/server')
  const token = crypto.randomUUID()

  const { error: invError } = await supabaseAdmin
    .from('invitations')
    .insert({
      group_id: groupId,
      invited_by: userId,
      email,
      token,
    })

  if (invError) return { success: false, error: invError.message }

  // 5. Send invitation email via Resend
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${appUrl}/invite/${token}`

    await resend.emails.send({
      from: 'Self Task <onboarding@resend.dev>',
      to: email,
      subject: `Bạn được mời tham gia nhóm trên ${process.env.APP_NAME}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2>Lời mời tham gia nhóm</h2>
          <p>Bạn được mời tham gia một nhóm trên <strong>${process.env.APP_NAME}</strong>.</p>
          <a href="${inviteLink}"
             style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">
            Chấp nhận lời mời
          </a>
          <p style="color:#666;font-size:12px;">Liên kết có hiệu lực trong 7 ngày.</p>
        </div>
      `,
    })
  } catch {
    // Email sending failed but invitation was created
    console.warn(`[inviteByEmail] Failed to send email to ${email}`)
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function verifyInvitation(token: string) {
  const supabase = await createClient()
  const { supabaseAdmin } = await import('@/lib/supabase/server')

  // 1. Find invitation
  const { data: inv } = await supabaseAdmin
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (!inv) return { success: false, error: 'Lời mời không tồn tại.' }
  if (inv.status !== 'pending') return { success: false, error: 'Lời mời đã được xử lý.' }
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
    return { success: false, error: 'Lời mời đã hết hạn.' }
  }

  // 2. Check if user is logged in
  const userId = await getUserIdFromAuth()
  if (!userId) {
    return { success: false, redirect: `/signup?invite=${token}` }
  }

  // 3. Check not already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', inv.group_id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!existing) {
    const { error: mError } = await supabase
      .from('group_members')
      .insert({ group_id: inv.group_id, user_id: userId, role_id: 2 })

    if (mError) return { success: false, error: mError.message }

    // Tạo notification cho người đã mời
    const { createNotification } = await import('@/feature/notifications/actions')
    const [acceptorData, groupData] = await Promise.all([
      supabase.from('users').select('username').eq('id', userId).single(),
      supabase.from('groups').select('name').eq('id', inv.group_id).single(),
    ])

    await createNotification({
      user_id: inv.invited_by,
      type: 'group_invite_accepted',
      title: 'Đã tham gia nhóm',
      message: `${acceptorData.data?.username ?? 'Ai đó'} đã tham gia nhóm "${groupData.data?.name ?? ''}"`,
      data: {
        group_id: inv.group_id,
        group_name: groupData.data?.name ?? '',
        accepted_by: userId,
        accepted_by_name: acceptorData.data?.username ?? '',
      },
    })
  }

  // 4. Mark invitation as accepted
  await supabaseAdmin
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', inv.id)

  revalidatePath(`/groups/${inv.group_id}`)
  return { success: true, groupId: inv.group_id }
}

export async function inviteMember(groupId: number, targetUserId: number) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership) return { success: false, error: 'Bạn không phải thành viên nhóm này.' }

  const isAdmin = membership.role_id === 1

  if (!isAdmin) {
    const { data: moduleEnabled } = await supabase
      .from('group_modules')
      .select('enabled')
      .eq('group_id', groupId)
      .eq('module_id', 4)
      .single()

    if (!moduleEnabled?.enabled) {
      return { success: false, error: 'Bạn không có quyền mời thành viên.' }
    }
  }

  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', targetUserId)
    .single()

  if (existing) return { success: false, error: 'Người dùng đã là thành viên.' }

  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: targetUserId, role_id: 2 })

  if (error) return { success: false, error: error.message }

  // Tạo notification cho người được mời
  const { createNotification } = await import('@/feature/notifications/actions')

  const [inviterData, groupData] = await Promise.all([
    supabase.from('users').select('username').eq('id', userId).single(),
    supabase.from('groups').select('name').eq('id', groupId).single(),
  ])

  await createNotification({
    user_id: targetUserId,
    type: 'group_invite',
    title: 'Lời mời tham gia nhóm',
    message: `Bạn được mời vào nhóm "${groupData.data?.name ?? ''}"`,
    data: {
      group_id: groupId,
      group_name: groupData.data?.name ?? '',
      invited_by: userId,
      invited_by_name: inviterData.data?.username ?? '',
    },
  })

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function removeMember(groupId: number, targetUserId: number) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership || membership.role_id !== 1) {
    return { success: false, error: 'Chỉ admin mới có thể xoá thành viên.' }
  }

  if (targetUserId === userId) {
    return { success: false, error: 'Bạn không thể tự xoá mình. Hãy chuyển quyền admin trước.' }
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', targetUserId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function updateMemberRole(groupId: number, targetUserId: number, newRoleId: number) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership || membership.role_id !== 1) {
    return { success: false, error: 'Chỉ admin mới có thể thay đổi vai trò.' }
  }

  const { error } = await supabase
    .from('group_members')
    .update({ role_id: newRoleId })
    .eq('group_id', groupId)
    .eq('user_id', targetUserId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function toggleModule(groupId: number, moduleId: number, enabled: boolean) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership || membership.role_id !== 1) {
    return { success: false, error: 'Chỉ admin mới có thể thay đổi chức năng.' }
  }

  const { error } = await supabase
    .from('group_modules')
    .update({ enabled })
    .eq('group_id', groupId)
    .eq('module_id', moduleId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}
