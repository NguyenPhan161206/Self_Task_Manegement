import { CheckSquare, Shield, Zap } from 'lucide-react'

import { SignUpForm } from '@/feature/auth/components/SignUpForm'

interface Props {
  searchParams: Promise<{ invite?: string }>
}

export default async function SignUpPage({ searchParams }: Props) {
  const { invite } = await searchParams
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-muted/50 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="font-semibold text-2xl tracking-tight">Self Task</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight mb-4">
              Bắt đầu tổ chức.<br />Kiểm soát mọi thứ.
            </h1>
            <p className="text-lg text-muted-foreground">
              Tạo tài khoản miễn phí và nắm quyền kiểm soát nhiệm vụ của bạn ngay hôm nay.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-1.5 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <span>Beautiful, fast, and simple interface</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-1.5 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <span>Your data is private and secure</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CheckSquare className="h-4 w-4" />
              </div>
              <span className="font-semibold text-xl">Self Task</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản của bạn</h1>
          </div>

          <SignUpForm inviteToken={invite} />
        </div>
      </div>
    </div>
  )
}
