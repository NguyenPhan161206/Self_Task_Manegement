'use client'

import { useState, useCallback, useRef } from 'react'
import { Search, UserPlus, Mail, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { inviteMember, inviteByEmail } from '../actions'
import { searchUsers as searchUsersAction } from '../lib/queries'

interface InviteMemberDialogProps {
  groupId: number
  onSuccess: () => void
}

export function InviteMemberDialog({ groupId, onSuccess }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ id: number; username: string; email: string | null; avatar: string | null }>>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviting, setInviting] = useState<number | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (value.length < 2) {
      setResults([])
      return
    }

    setSearching(true)
    timerRef.current = setTimeout(async () => {
      const users = await searchUsersAction(value)
      setResults(users)
      setSearching(false)
    }, 300)
  }, [])

  const handleInvite = async (userId: number) => {
    setInviting(userId)
    setError(null)
    const result = await inviteMember(groupId, userId)
    setInviting(null)
    if (result.success) {
      setQuery('')
      setResults([])
      onSuccess()
    } else {
      setError(result.error ?? 'Mời thất bại')
    }
  }

  const handleEmailInvite = async () => {
    if (!inviteEmail.trim()) return
    setSendingEmail(true)
    setError(null)
    const result = await inviteByEmail(groupId, inviteEmail.trim())
    setSendingEmail(false)
    if (result.success) {
      setInviteEmail('')
      onSuccess()
    } else {
      setError(result.error ?? 'Gửi lời mời thất bại')
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-1.5 h-4 w-4" />
          Mời thành viên
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mời thành viên</DialogTitle>
          <DialogDescription>
            Tìm kiếm người dùng bằng tên hoặc email.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Mời qua email..."
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleEmailInvite() }}
              className="pl-9"
            />
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={handleEmailInvite}
            disabled={sendingEmail || !inviteEmail.trim()}
          >
            {sendingEmail ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-1.5 h-4 w-4" />
            )}
            Gửi lời mời
          </Button>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Hoặc tìm kiếm</span>
          </div>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {searching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 && query.length >= 2 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Không tìm thấy người dùng nào.
            </p>
          ) : (
            results.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar>
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleInvite(user.id)}
                  disabled={inviting === user.id}
                >
                  {inviting === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Mời'
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
