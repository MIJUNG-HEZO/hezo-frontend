"use client";

import { useEffect, useState } from "react";
import { fetchAdminUsers, type AdminUserItem } from "@/lib/admin-api";

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminUsers()
      .then((res) => setItems(res.items))
      .catch(() => setError("사용자 데이터를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">사용자 목록</h1>

      {loading && <p className="text-sm text-gray-400">불러오는 중...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">이메일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">이름</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">권한</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">이메일 인증</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">가입일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">{u.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === "admin"
                          ? "rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
                          : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email_verified ? "✓" : "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{u.created_at.slice(0, 10)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    사용자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
