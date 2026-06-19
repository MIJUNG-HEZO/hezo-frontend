"use client";

import { useEffect, useState } from "react";
import { fetchAdminPipeline, type AdminPipelineItem } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  draft:       "bg-gray-100 text-gray-600",
  building:    "bg-blue-100 text-blue-700",
  validating:  "bg-yellow-100 text-yellow-700",
  published:   "bg-green-100 text-green-700",
  failed:      "bg-red-100 text-red-700",
  not_found:   "bg-gray-100 text-gray-400",
  unknown:     "bg-gray-100 text-gray-400",
};

const STATUS_LABEL: Record<string, string> = {
  draft:       "대기",
  building:    "빌드 중",
  validating:  "검증 중",
  published:   "발행 완료",
  failed:      "실패",
  not_found:   "없음",
  unknown:     "알 수 없음",
};

const SUMMARY_STATUSES = ["draft", "building", "validating", "published", "failed"] as const;

export default function AdminPipelinePage() {
  const [items, setItems] = useState<AdminPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminPipeline()
      .then((res) => setItems(res.items))
      .catch(() => setError("파이프라인 데이터를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, []);

  const counts = items.reduce<Record<string, number>>((acc, it) => {
    acc[it.publish_status] = (acc[it.publish_status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">파이프라인 현황</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {SUMMARY_STATUSES.map((s) => (
          <div key={s} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">{STATUS_LABEL[s]}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{counts[s] ?? 0}</div>
          </div>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">불러오는 중...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Site ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">재시도</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">최종 업데이트</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">에러</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((it) => (
                <tr key={it.site_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{it.site_id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_COLOR[it.publish_status] ?? STATUS_COLOR.unknown,
                      )}
                    >
                      {STATUS_LABEL[it.publish_status] ?? it.publish_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{it.attempt ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {it.updated_at?.slice(0, 19).replace("T", " ") ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500">{it.error_message ?? "-"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    파이프라인 데이터가 없습니다.
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
