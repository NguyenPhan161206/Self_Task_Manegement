'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Mail, Lock, User, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { signUp } from '../actions'

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await signUp(formData)

      if (result.success) {
        toast.success('Tài khoản đã được tạo!', {
          description: result.message || 'Bây giờ bạn có thể đăng nhập.',
        })
        router.push('/tasks')
        router.refresh()
      } else {
        setError(result.error || 'Đăng ký thất bại')
      }
    })
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          Tạo tài khoản
        </CardTitle>
        <CardDescription className="text-base">
          Tham gia và bắt đầu quản lý nhiệm vụ của bạn chỉ trong vài giây
        </CardDescription>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Tên người dùng</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                required
                disabled={isPending}
                autoComplete="username"
                className="pl-9 h-11"
                minLength={3}
                maxLength={20}
              />
            </div>
            <p className="text-[11px] text-muted-foreground pl-1">3-20 ký tự, đây sẽ là tên công khai của bạn</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Địa chỉ email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isPending}
                autoComplete="email"
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tạo mật khẩu mạnh"
                required
                minLength={6}
                disabled={isPending}
                autoComplete="new-password"
                className="pl-9 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground pl-1">Phải có ít nhất 6 ký tự</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button 
            type="submit" 
            className="w-full h-11 text-base font-medium shadow-sm" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Tạo tài khoản
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <a href="/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">
              Đăng nhập thay vào đó
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
