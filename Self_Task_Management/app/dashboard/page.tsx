import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/feature/auth/actions'
import { DashboardView } from '@/feature/charts/components/DashboardView'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  return <DashboardView />
}
