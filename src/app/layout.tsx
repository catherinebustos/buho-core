import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-heading' });

export const viewport: Viewport = {
  themeColor: '#854d0e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export const metadata: Metadata = {
  title: 'Búho Core',
  description: 'Gestión Inteligente de Propiedades por Buho Property',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Búho Core'
  },
  formatDetection: { telephone: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased selection:bg-primary/20">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
