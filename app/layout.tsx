import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/store'
import { AdminProvider } from '@/lib/admin-store'
import { EditableDemoProvider } from '@/lib/editable-demo-store'
import AppFrame from '@/components/AppFrame'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-kr',
})

export const metadata: Metadata = {
  title: 'DU WAY — 대구대학교 캠퍼스 길찾기',
  description: '이동조건에 맞춘 대구대학교 캠퍼스 맞춤형 길찾기 웹앱',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1b3a6b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`light ${notoSansKr.variable} bg-background`}>
      <body className="font-sans antialiased">
        <AppProvider>
          <EditableDemoProvider>
            <AdminProvider>
              <AppFrame>{children}</AppFrame>
            </AdminProvider>
          </EditableDemoProvider>
        </AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
