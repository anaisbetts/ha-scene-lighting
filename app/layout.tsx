import { PropsWithChildren } from 'react'
import { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Scene-based Lighting for Home Assistant',
  description: 'Control your Home Assistant lighting scenes',
  icons: {
    icon: '/favicon.ico',
  },
}

export interface ShellProps {
  title?: string | JSX.Element
}

export default function Shell({
  children,
  title,
}: PropsWithChildren<ShellProps>) {
  const titleContent = title ?? 'Scene-based Lighting for Home Assistant'

  return (
    <html lang="en">
      <body
        className="min-h-screen grid"
        style={{ gridTemplateRows: 'auto minmax(300px, 1fr) auto' }}
      >
        <header className="bg-yellow-400 text-gray-700 py-4">
          <div className="px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight">{titleContent}</h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
        </main>

        <footer className="bg-yellow-400">
          <p>its an app</p>
        </footer>
      </body>
    </html>
  )
}
