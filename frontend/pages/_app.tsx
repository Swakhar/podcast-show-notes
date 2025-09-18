import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "../contexts/ToastContext";
import ToastContainer from "../components/ToastContainer";
import NotificationSystem from '../components/NotificationSystem';
import "../styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <Component {...pageProps} />
        <ToastContainer />
        <NotificationSystem />
      </ToastProvider>
    </SessionProvider>
  );
}
