import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from 'next-i18next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { ToastProvider } from "../contexts/ToastContext";
import ToastContainer from "../components/ToastContainer";
import NotificationSystem from '../components/NotificationSystem';
import type { AppProps } from "next/app";
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <ToastContainer />
        <NotificationSystem />
        <div className={inter.className}>
          <Component {...pageProps} />
          <SpeedInsights />
          <Analytics />
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
