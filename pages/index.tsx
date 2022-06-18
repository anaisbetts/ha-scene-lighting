import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Scene-based Lighting for Home Assistant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-2xl">Hello world</h1>
      </main>

      <footer>
        <p className="text-sm">its a footer</p>
      </footer>
    </>
  )
}

export default Home
