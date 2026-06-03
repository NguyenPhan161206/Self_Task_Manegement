import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/feature/auth/actions'
import { TasksDashboard } from './tasks-dashboard'

export default async function TasksPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  return <TasksDashboard />
}
