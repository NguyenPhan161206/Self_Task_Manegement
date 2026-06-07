'use client'

import { useGroups } from '@/feature/groups/hooks/useGroups'
import { GroupList } from '@/feature/groups/components/GroupList'

export default function GroupsPage() {
  const { groups, isLoading, refetch } = useGroups()

  return (
    <GroupList
      groups={groups}
      isLoading={isLoading}
      onGroupCreated={refetch}
    />
  )
}
