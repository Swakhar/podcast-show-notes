import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useToast } from "../contexts/ToastContext";
import { s } from "framer-motion/dist/types.d-Cjd591yU";

interface WordPressCred {
  siteUrl: string;
  username: string;
  appPass?: string;
}

interface RssFeed {
  id: string;
  url: string;
  title: string | null;
  active: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPass, setAppPass] = useState("");
  const [rssUrl, setRssUrl] = useState("");
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [rssLoading, setRssLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  async function loadData() {
    try {
      setIsLoadingData(true);
      // Load WordPress credentials
      const wpRes = await fetch("/api/wp/save");
      if (wpRes.ok) {
        const wpData = await wpRes.json();
        if (wpData.cred) {
          setSiteUrl(wpData.cred.siteUrl || "");
          setUsername(wpData.cred.username || "");
        }
      }

      // Load RSS feeds
      const rssRes = await fetch("/api/rss/list");
      if (rssRes.ok) {
        const rssData = await rssRes.json();
        setRssFeeds(rssData.feeds || []);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoadingData(false);
    }
  }

  async function handleSaveWp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/wp/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, username, appPass }),
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast("WordPress credentials saved successfully!", "success");
        setAppPass(""); // Clear password after save
      } else {
        showToast(data.error || "Failed to save WordPress credentials", "error");
      }
    } catch (error) {
      console.error("Error saving WordPress credentials:", error);
      showToast("Failed to save WordPress credentials", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleTestConnection() {
    if (!siteUrl || !username) {
      showToast("Please fill in Site URL and Username first", "error");
      return;
    }

    setTestingConnection(true);
    try {
      const res = await fetch("/api/wp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, username, appPass: appPass || undefined }),
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast("Connection successful! ✅", "success");
      } else {
        showToast(`Connection failed: ${data.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      showToast("Connection test failed", "error");
    } finally {
      setTestingConnection(false);
    }
  }

  async function handleAddRss(e: React.FormEvent) {
    e.preventDefault();
    if (!rssUrl.trim()) return;

    setRssLoading(true);
    try {
      const res = await fetch("/api/rss/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rssUrl.trim() }),
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast("RSS feed added successfully!", "success");
        setRssUrl("");
        await loadData(); // Refresh the list
      } else {
        showToast(data.error || "Failed to add RSS feed", "error");
      }
    } catch (error) {
      console.error("Error adding RSS feed:", error);
      showToast("Failed to add RSS feed", "error");
    } finally {
      setRssLoading(false);
    }
  }

  async function handleRemoveRss(feedId: string, feedUrl: string) {
    if (!confirm(`Remove RSS feed: ${feedUrl}?`)) return;

    try {
      const res = await fetch("/api/rss/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedId }),
      });
      
      if (res.ok) {
        showToast("RSS feed removed successfully!", "success");
        await loadData(); // Refresh the list
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to remove RSS feed", "error");
      }
    } catch (error) {
      console.error("Error removing RSS feed:", error);
      showToast("Failed to remove RSS feed", "error");
    }
  }

  async function handleToggleRss(feedId: string, active: boolean) {
    try {
      const res = await fetch("/api/rss/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedId, active: !active }),
      });
      
      if (res.ok) {
        await loadData(); // Refresh the list
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update RSS feed", "error");
      }
    } catch (error) {
      console.error("Error updating RSS feed:", error);
      showToast("Failed to update RSS feed", "error");
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Head><title>Settings - Sign in required</title></Head>
        <SiteHeader />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-gray-600">Please sign in to access your settings.</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Head><title>Settings - AI Podcast Show Notes</title></Head>
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600 mt-1">Configure your integrations and preferences</p>
          </div>
          <Link 
            href="/generate" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Generate
          </Link>
        </div>

        {isLoadingData ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading settings...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* WordPress Integration */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">WordPress Integration</h2>
                  <p className="text-sm text-gray-600">Connect your WordPress site to publish content directly</p>
                </div>
              </div>

              <form onSubmit={handleSaveWp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yoursite.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Your WordPress username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Password
                  </label>
                  <input
                    type="password"
                    placeholder="WordPress App Password"
                    value={appPass}
                    onChange={(e) => setAppPass(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Generate this in WordPress → Users → Your Profile → Application Passwords
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !siteUrl || !username}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save Credentials"}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection || !siteUrl || !username}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingConnection ? "Testing..." : "Test"}
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>How to set up:</strong>
                </p>
                <ol className="text-xs text-blue-700 mt-1 space-y-1 list-decimal list-inside">
                  <li>Go to your WordPress admin → Users → Your Profile</li>
                  <li>Scroll to "Application Passwords"</li>
                  <li>Create a new app password for "CastLumen"</li>
                  <li>Copy the generated password and paste it above</li>
                </ol>
              </div>
            </div>

            {/* RSS Feed Management */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.429 2.571A2.571 2.571 0 001 5.143V14.857a2.571 2.571 0 002.429 2.572L19.714 17.429A2.571 2.571 0 0017.857 20H8.143a2.571 2.571 0 01-2.572-2.429L5.571 1.286A2.571 2.571 0 008 3.714h9.714a2.571 2.571 0 012.572 2.429z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">RSS Feed Management</h2>
                  <p className="text-sm text-gray-600">Monitor podcast feeds for automatic processing</p>
                </div>
              </div>

              <form onSubmit={handleAddRss} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RSS Feed URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://feeds.example.com/podcast.xml"
                    value={rssUrl}
                    onChange={(e) => setRssUrl(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={rssLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={rssLoading || !rssUrl.trim()}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rssLoading ? "Adding..." : "Add RSS Feed"}
                </button>
              </form>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Your RSS Feeds</h3>
                {rssFeeds.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No RSS feeds configured yet.</p>
                    <p className="text-sm mt-1">Add your first feed to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {rssFeeds.map((feed) => (
                      <div key={feed.id} className="border rounded-md p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {feed.title || "Untitled Feed"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{feed.url}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                feed.active 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {feed.active ? "Active" : "Inactive"}
                              </span>
                              {feed.lastCheckedAt && (
                                <span className="text-xs text-gray-400">
                                  Last checked: {new Date(feed.lastCheckedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleToggleRss(feed.id, feed.active)}
                              className={`px-2 py-1 text-xs rounded ${
                                feed.active 
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" 
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {feed.active ? "Pause" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleRemoveRss(feed.id, feed.url)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Integration Benefits</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">WordPress Integration</h3>
              <p className="text-sm text-gray-600">Automatically publish your generated show notes, newsletters, and content directly to your WordPress site with one click.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m-5 0v18a1 1 0 001 1h4a1 1 0 001-1V4m-5 0H5a2 2 0 00-2 2v14a2 2 0 002 2h2M9 4h6m0 0h2a2 2 0 012 2v14a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">RSS Monitoring</h3>
              <p className="text-sm text-gray-600">Monitor your podcast RSS feeds and automatically process new episodes as they're published to your feed.</p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
