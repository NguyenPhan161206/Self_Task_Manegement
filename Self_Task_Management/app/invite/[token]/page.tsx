import { redirect } from 'next/navigation'
import { verifyInvitation } from '@/feature/groups/actions'
import { createClient } from '@/lib/supabase/server'
import { AcceptInviteClient } from './AcceptInviteClient'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const result = await verifyInvitation(token)

  if (result.success && result.groupId) {
    redirect(`/groups/${result.groupId}`)
  }

  if (result.redirect) {
    redirect(result.redirect)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6 text-center">
        <h1 className="text-xl font-semibold">Lời mời tham gia nhóm</h1>
        <p className="text-muted-foreground">{result.error || 'Lời mời không hợp lệ.'}</p>
        <AcceptInviteClient token={token} user={user} />
      </div>
    </div>
  )
}
