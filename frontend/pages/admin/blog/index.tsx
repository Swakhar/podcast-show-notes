import { useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";

export default function BlogAdmin() {
  const [posts] = useState([
    {
      id: 1,
      title: "How to Create Engaging Podcast Show Notes",
      status: "published",
      date: "2025-09-15",
      views: 1250
    },
    {
      id: 2,
      title: "10 AI Tools Every Podcaster Should Use",
      status: "draft",
      date: "2025-09-10",
      views: 0
    }
  ]);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <Link
            href="/admin/blog/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ New Post
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Views</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {post.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{post.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{post.views}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700">Edit</button>
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
