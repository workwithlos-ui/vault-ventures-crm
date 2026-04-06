import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../src/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Vault Ventures CRM</title>
        <meta name="description" content="Self Storage Acquisition CRM for Vault Ventures" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
