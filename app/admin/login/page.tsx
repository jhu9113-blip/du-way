'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, LockKeyhole, LogIn, ShieldCheck, UserRound } from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-store'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdminAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!username.trim() || !password) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.')
      return
    }

    if (!login(username.trim(), password)) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }

    setError('')
    router.replace('/admin')
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-secondary/50 px-5 py-10">
      <section aria-labelledby="admin-login-title" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <header className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-8" aria-hidden="true" />
          </span>
          <p className="mt-4 text-base font-semibold text-primary">DU WAY</p>
          <h1 id="admin-login-title" className="mt-1 text-2xl font-bold text-foreground">관리자 로그인</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">시연용 관리자 계정으로 접속하세요.</p>
        </header>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="admin-username" className="text-base font-semibold text-foreground">아이디</label>
            <div className="relative mt-2">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'admin-login-error' : undefined}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="text-base font-semibold text-foreground">비밀번호</label>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'admin-login-error' : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {error && (
            <div id="admin-login-error" role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-base text-destructive">
              <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LogIn className="size-5" aria-hidden="true" />
            로그인
          </button>
        </form>

        <p className="mt-5 rounded-xl bg-secondary px-4 py-3 text-center text-sm leading-relaxed text-muted-foreground">
          이 로그인은 발표용 프로토타입이며 실제 보안 기능을 제공하지 않습니다.
        </p>
      </section>
    </main>
  )
}
