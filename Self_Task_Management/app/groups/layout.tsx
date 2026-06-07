import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/feature/auth/actions'

export default async function GroupsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  return <div className="container py-8">{children}</div>
}
