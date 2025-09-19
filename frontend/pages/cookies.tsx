import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function CookiePolicy() {
  const lastUpdated = "September 19, 2025";

  return (
    <>
      <Head>
        <title>Cookie Policy – CastLumen</title>
        <meta name="description" content="Learn about how CastLumen uses cookies to improve your experience on our website." />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-gray-600">Last updated: {lastUpdated}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-3 mt-0">What are cookies?</h2>
              <p className="text-blue-800 mb-0">
                Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
                They help us provide you with a better experience and understand how you use our service.
              </p>
            </div>

            <h2>How we use cookies</h2>
            <p>We use cookies for the following purposes:</p>

            <h3>🔧 Essential Cookies</h3>
            <p>These cookies are necessary for the website to function properly:</p>
            <ul>
              <li><strong>Authentication:</strong> Remember that you're logged in</li>
              <li><strong>Security:</strong> Protect against cross-site request forgery</li>
              <li><strong>Preferences:</strong> Remember your language and theme settings</li>
            </ul>

            <h3>📊 Analytics Cookies</h3>
            <p>We use analytics cookies to understand how visitors interact with our website:</p>
            <ul>
              <li><strong>Google Analytics:</strong> Track page views, user behavior, and site performance</li>
              <li><strong>Usage Data:</strong> Understand which features are most popular</li>
              <li><strong>Performance:</strong> Monitor and improve site speed and reliability</li>
            </ul>

            <h3>🎯 Marketing Cookies</h3>
            <p>These cookies help us provide relevant advertisements:</p>
            <ul>
              <li><strong>Conversion Tracking:</strong> Measure the effectiveness of our marketing campaigns</li>
              <li><strong>Retargeting:</strong> Show relevant ads to visitors who have used our service</li>
              <li><strong>Social Media:</strong> Enable social media sharing and integration</li>
            </ul>

            <h2>Third-party cookies</h2>
            <p>We work with trusted third-party services that may set cookies:</p>
            <ul>
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Google Analytics:</strong> For website analytics</li>
              <li><strong>YouTube:</strong> For embedded video content</li>
              <li><strong>Twitter/LinkedIn:</strong> For social media integration</li>
            </ul>

            <h2>Managing your cookies</h2>
            <p>You can control cookies through your browser settings:</p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="mt-0">Browser Controls</h3>
              <ul className="mb-0">
                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>
            </div>

            <h2>Cookie consent</h2>
            <p>When you first visit our website, we'll ask for your consent to use non-essential cookies. You can:</p>
            <ul>
              <li>Accept all cookies</li>
              <li>Accept only essential cookies</li>
              <li>Customize your preferences</li>
              <li>Change your preferences at any time</li>
            </ul>

            <h2>Contact us</h2>
            <p>
              If you have questions about our cookie policy, please contact us at{' '}
              <a href="mailto:privacy@castlumen.com" className="text-blue-600 hover:text-blue-700">
                privacy@castlumen.com
              </a>
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
              <h3 className="text-yellow-900 mt-0">Changes to this policy</h3>
              <p className="text-yellow-800 mb-0">
                We may update this cookie policy from time to time. We'll notify you of any material changes 
                by posting the new policy on this page and updating the "last updated" date.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </>
  );
}
