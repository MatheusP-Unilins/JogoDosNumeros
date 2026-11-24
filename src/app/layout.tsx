import type { Metadata } from 'next'
import { Fredoka, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['400', '500', '600', '700'],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Jogo dos Números • Desafio dos Palpites',
  description: 'Descubra o número secreto com níveis Iniciante, Intermediário e Avançado. Ranking e pódio em tempo real!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${plusJakartaSans.variable}`}>
      <body className="font-plus bg-cajua-sand text-cajua-charcoal min-h-screen antialiased selection:bg-cajua-yellow selection:text-cajua-charcoal">
        {children}
      </body>
    </html>
  )
}
