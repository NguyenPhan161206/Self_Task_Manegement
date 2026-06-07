'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Props {
  token: string
  user: { id: string } | null
}

export function AcceptInviteClient({ token, user }: Props) {
  const router = useRouter()

  const handleLogin = () => {
    router.push(`/sign-in?invite=${token}`)
  }

  const handleSignup = () => {
    router.push(`/sign-up?invite=${token}`)
  }

  if (!user) {
    return (
      <div className="flex gap-2 justify-center">
        <Button onClick={handleLogin}>Đăng nhập</Button>
        <Button variant="outline" onClick={handleSignup}>Tạo tài khoản</Button>
      </div>
    )
  }

  return null
}
