import { Database, Info, LayoutDashboard } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <main className="p-5 sm:p-8">
      <header>
        <p className="inline-flex items-center gap-2 text-base font-semibold text-primary">
          <LayoutDashboard className="size-5" aria-hidden="true" />
          관리자 대시보드
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">DU WAY 데이터 관리</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          캠퍼스 목업 데이터와 시연 상태를 관리하는 내부 화면입니다.
        </p>
      </header>

      <section aria-labelledby="sprint-status" className="mt-8 rounded-2xl border border-border bg-card p-5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Database className="size-6" aria-hidden="true" />
        </span>
        <h2 id="sprint-status" className="mt-4 text-xl font-bold text-foreground">관리자 셸 준비 완료</h2>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          다음 스프린트에서 건물·시설·경로·수업 현황과 편집용 목업 상태를 이 대시보드에 연결합니다.
        </p>
      </section>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-base leading-relaxed text-foreground">
        <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>관리자 로그인 상태와 이후 편집 데이터는 브라우저 메모리에만 유지되며 새로고침하면 초기화됩니다.</p>
      </div>
    </main>
  )
}
