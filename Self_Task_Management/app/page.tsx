import Image from 'next/image'
import { 
  CheckSquare, Zap, Shield, Clock, Plus, BarChart3, ArrowRight, Users 
} from 'lucide-react'

import { TaskCard } from '@/feature/tasks/components/TaskCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { createClient } from '@/lib/supabase/server'
import type { HomeContent } from '@/data/home'
import homeContent from '@/data/home.json'

// Small helper to render lucide icons from string names stored in the JSON.
// This keeps the content 100% editable without code changes.
const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Shield,
  CheckSquare,
  Clock,
  Plus,
  BarChart3,
  Users,
  ArrowRight,
}

function DynamicIcon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const Icon = IconMap[name] || CheckSquare
  return <Icon className={className} />
}

export default async function FanpageHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const content = homeContent as HomeContent

  const primaryCtaHref = isAuthenticated ? '/tasks' : content.hero.primaryCta.href
  const finalCtaPrimaryHref = isAuthenticated ? '/tasks' : (content.finalCta?.primaryCta.href ?? '/sign-up')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO — beautiful split like the sign-in branding panels */}
      <section className="relative overflow-hidden border-b">
        <div className="container flex flex-col lg:flex-row items-center gap-8 sm:gap-12 py-12 sm:py-16 lg:py-24">
          <div className="flex-1 space-y-6 text-center lg:text-left max-w-3xl mx-auto lg:mx-0 lg:max-w-none">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Users className="h-4 w-4" />
              Được yêu thích bởi {content.stats[1]?.value || '12k+'} người hâm mộ
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-none">
              {content.hero.title}
            </h1>
            <p className="max-w-xl text-xl sm:text-2xl text-muted-foreground tracking-tight">
              {content.hero.subtitle}
            </p>
            <p className="max-w-md text-lg text-muted-foreground">
              {content.hero.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
              <Button asChild size="lg" className="group h-12 px-8 text-base">
                <a href={primaryCtaHref}>
                  {content.hero.primaryCta.text}
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                </a>
              </Button>
              {content.hero.secondaryCta && (
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                  <a href={content.hero.secondaryCta.href}>{content.hero.secondaryCta.text}</a>
                </Button>
              )}
            </div>
          </div>

          {content.hero.image && (
            <div className="flex-1 relative w-full lg:max-w-[560px] mx-auto">
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-border/50">
                <Image
                  src={content.hero.image}
                  alt="Self Task fanpage hero illustration"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STATS / SOCIAL PROOF */}
      <section className="border-b bg-muted/30 py-10">
        <div className="container grid grid-cols-1 gap-8 md:grid-cols-3">
          {content.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-mono text-4xl font-semibold tracking-tighter text-primary">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES — beautiful grid using existing Card styles */}
      <section className="container py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Tại sao người hâm mộ yêu thích Self Task</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Mọi thứ bạn cần để giữ tổ chức — không có gì thừa.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {content.features.map((feature, index) => (
            <Card key={index} className="group flex flex-col transition hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <DynamicIcon name={feature.icon} className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl tracking-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y bg-muted/30 py-12 sm:py-16 lg:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Cách nó hoạt động</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Ba bước đơn giản. Không phức tạp.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {content.howItWorks.map((step) => (
              <Card key={step.step} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-mono font-semibold">
                      {step.step}
                    </div>
                    <CardTitle className="text-2xl tracking-tight">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground">{step.description}</p>
                </CardContent>
                {step.icon && (
                  <div className="absolute bottom-4 right-4 opacity-10 sm:bottom-6 sm:right-6">
                    <DynamicIcon name={step.icon} className="h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAN TESTIMONIALS */}
      <section className="container py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Người hâm mộ thực thụ. Tình yêu thực thụ.</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Đừng chỉ tin vào lời chúng tôi.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.testimonials.map((t, index) => (
            <Card key={index} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                <blockquote className="text-lg leading-relaxed text-foreground">
                  “{t.quote}”
                </blockquote>
              </CardContent>
              <CardFooter className="flex items-center gap-3 border-t pt-6">
                {t.avatar && (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-border">
                    <Image src={t.avatar} alt={t.author} fill sizes="40px" className="object-cover" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* IN ACTION / DEMO TEASER — reuse existing TaskCard for authenticity */}
      {content.demo && (
        <section id="demo" className="border-t bg-muted/30 py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">{content.demo.title}</h2>
              {content.demo.description && (
                <p className="mt-3 text-lg text-muted-foreground">{content.demo.description}</p>
              )}
            </div>

            <div className="mx-auto mt-10 max-w-3xl space-y-3">
              {content.demo.tasks.map((task, idx) => (
                <TaskCard
                  key={task.id}
                  task={{
                    id: idx + 1,
                    title: task.title,
                    description: task.description ?? null,
                    status: task.status,
                    priority: task.priority,
                    due_date: null,
                    start_date: null,
                    completed_date: null,
                    created_at: null,
                    tags: null,
                    attachments: null,
                    creator_id: null,
                    last_updated_by: null,
                    group_id: null,
                    isOverdue: false,
                    daysUntilDue: null,
                  }}
                />
              ))}
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Đây là một thành phần thực sự từ ứng dụng — chính cái bạn sẽ sử dụng sau khi đăng ký.
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA — big beautiful banner */}
      {content.finalCta && (
        <section className="border-t py-12 sm:py-16 lg:py-20">
          <div className="container text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{content.finalCta.title}</h2>
            <p className="mx-auto mt-4 max-w-md text-lg sm:text-xl text-muted-foreground">
              {content.finalCta.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-10 text-base">
                <a href={finalCtaPrimaryHref}>{content.finalCta.primaryCta.text}</a>
              </Button>
              {content.finalCta.secondaryCta && (
                <Button asChild variant="outline" size="lg" className="h-12 px-10 text-base">
                  <a href={content.finalCta.secondaryCta.href}>{content.finalCta.secondaryCta.text}</a>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
