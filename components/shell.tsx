import { PropsWithChildren } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'

export interface ShellProps {}

export default function Shell({ children }: PropsWithChildren<ShellProps>) {
  return (
    <>
      <div
        className="min-h-screen grid gap-5"
        style={{ gridTemplateRows: 'auto minmax(300px, 1fr) auto' }}
      >
        <header className="bg-yellow-400 text-gray-700 py-4">
          <div className="px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight">
              Scene-based Lighting for Home Assistant
            </h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
        </main>

        <footer className="bg-yellow-400">
          <p>it's an app</p>
        </footer>
      </div>
    </>
  )
}
