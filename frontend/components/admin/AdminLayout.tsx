import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Client-side failsafe (server-side auth should catch this first)
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (!(session.user as any)?.is_admin) {
      router.push("/?error=access_denied");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (server-side should handle this)
  if (!session || !(session.user as any)?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              🎯 CastLumen Admin
            </Link>
          </div>
          
          <nav className="mt-6">
            <div className="px-3">
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/admin" 
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                      router.pathname === '/admin' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    📊 Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/users" 
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                      router.pathname.startsWith('/admin/users') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    👥 Users
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/blog" 
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                      router.pathname.startsWith('/admin/blog') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    📝 Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/landing" 
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                      router.pathname.startsWith('/admin/landing') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    🎨 Landing Page
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/analytics" 
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                      router.pathname.startsWith('/admin/analytics') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    📈 Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-8 px-3">
              <div className="border-t border-gray-200 pt-4">
                <Link 
                  href="/" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  ← Back to Site
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
