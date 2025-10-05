import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { ToastProvider } from "../contexts/ToastContext";
import ToastContainer from "../components/ToastContainer";
import NotificationSystem from '../components/NotificationSystem';
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <div className={inter.className}>
          <Component {...pageProps} />
          <ToastContainer />
          <NotificationSystem />
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
