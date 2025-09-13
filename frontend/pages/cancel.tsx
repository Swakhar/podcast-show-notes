import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Success() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Payment Successful – CastLumen</title>
        <meta name="description" content="Your payment was successful. Welcome aboard!" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-8">
              <img src="/castlumen-wordmark.svg" alt="CastLumen" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 px-8 py-12 text-center border-b border-gray-200">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.178 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-black text-gray-900 mb-4">
                Payment Successful
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Welcome aboard! Your payment was successful, and your subscription is now active.
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-8">
                {/* Getting Started */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Getting Started
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Here are some quick links to help you get started with your new subscription:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">•</span>
                      <span>Explore our AI content generation features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">•</span>
                      <span>Visit our help center for tutorials and guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">•</span>
                      <span>Contact support if you have any questions</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      href="/generate" 
                      className="px-6 py-3 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center"
                    >
                      Start Generating Content
                    </Link>
                    <Link 
                      href="/#pricing" 
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      View Pricing Plans
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Questions about your subscription?{" "}
                <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                  Contact our support team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
