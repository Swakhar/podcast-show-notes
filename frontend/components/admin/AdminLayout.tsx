import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Blog Posts", href: "/admin/blog", icon: "📝" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Analytics", href: "/admin/analytics", icon: "📈" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <Link href="/admin" className="text-xl font-bold text-gray-900">
            CastLumen Admin
          </Link>
        </div>
        
        <nav className="p-6">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    router.pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{session?.user?.email}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {navigation.find(item => item.href === router.pathname)?.name || "Admin"}
            </h1>
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              View Site →
            </Link>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
