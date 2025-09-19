import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
    // Add admin check here - maybe check if user.email === "your-email@domain.com"
    if (session?.user?.email !== "admin@castlumen.com") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">1,234</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-gray-600">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-green-600">892</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-blue-600">€15,230</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-gray-600">Blog Posts</h3>
            <p className="text-3xl font-bold text-purple-600">12</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/admin/blog/new" className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl transition-colors">
            <h3 className="text-lg font-semibold mb-2">📝 New Blog Post</h3>
            <p className="text-blue-100">Create a new blog article</p>
          </Link>
          <Link href="/admin/users" className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl transition-colors">
            <h3 className="text-lg font-semibold mb-2">👥 Manage Users</h3>
            <p className="text-green-100">View and manage users</p>
          </Link>
          <Link href="/admin/analytics" className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl transition-colors">
            <h3 className="text-lg font-semibold mb-2">📊 Analytics</h3>
            <p className="text-purple-100">View detailed analytics</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
