'use client'

import Link from 'next/link'
import { CheckSquare, LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/feature/auth/hooks/useAuth'
import { signOut } from '@/feature/auth/actions'

export function AppHeader() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CheckSquare className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">Self Task</span>
          </Link>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium flex-1">
          <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <Link href="/tasks" className="text-foreground/60 hover:text-foreground transition-colors">
            Nhiệm vụ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(user.user_metadata?.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.username || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">Bảng điều khiển</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tasks">Nhiệm vụ của tôi</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button asChild variant="ghost" size="sm" className="px-2 text-xs sm:px-2.5 sm:text-sm">
                <Link href="/sign-in">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm" className="px-2 text-xs sm:px-2.5 sm:text-sm">
                <Link href="/sign-up">Bắt đầu</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
