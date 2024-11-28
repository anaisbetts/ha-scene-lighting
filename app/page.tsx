import type { NextPage } from 'next'
import Head from 'next/head'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Scene-based Lighting for Home Assistant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div>
          <h1 className="text-2xl">Hello world</h1>
        </div>
      </main>

      <footer>
        <p className="text-sm">its a footer</p>
      </footer>
    </>
  )
}
