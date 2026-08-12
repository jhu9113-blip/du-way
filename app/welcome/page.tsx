'use client'

import { useEffect, useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import { useRouter } from 'next/navigation'
import firstPage from '../../photo/1페이지.png'
import secondPage from '../../photo/2페이지.png'
import thirdPage from '../../photo/3페이지.png'

const pages: StaticImageData[] = [firstPage, secondPage, thirdPage]

export default function WelcomePage() {
  const [page, setPage] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (page !== 2) return

    const timer = window.setTimeout(() => {
      router.replace('/onboarding')
    }, 5500)

    return () => window.clearTimeout(timer)
  }, [page, router])

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-[#eaffee]">
      <Image
        key={page}
        src={pages[page]}
        alt={page === 2 ? 'DU WAY 로딩 중' : `DU WAY 소개 ${page + 1}페이지`}
        fill
        sizes="(max-width: 430px) 100vw, 430px"
        className="object-fill"
        loading="eager"
      />

      {page < 2 && (
        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          className="absolute inset-x-[7.6%] bottom-[7.15%] z-10 flex min-h-[45px] items-center justify-center rounded-[14px] bg-[#55b974] text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#45aa65] active:bg-[#399758] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087d24] focus-visible:ring-offset-2"
          aria-label={`${page + 2}페이지로 넘어가기`}
        >
          넘어가기
        </button>
      )}

      {page === 2 && <span className="sr-only" role="status">다음 화면을 준비하고 있습니다.</span>}
    </main>
  )
}
