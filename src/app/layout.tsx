import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { SearchProvider } from '@/context/search-context';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'COFADENA',
  description: 'Sistema SCADA para monitoreo de proyectos y sensores.',
  icons: {
    icon: '/images/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
          <AuthProvider>
              <SearchProvider>
                {children}
              </SearchProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
