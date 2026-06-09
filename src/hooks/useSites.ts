"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface SiteListItem {
  id: string;
  name: string;
  status: string;
  site_type?: string;
  module_key?: string;
  is_published?: boolean;
}

export function useSites() {
  return useQuery<SiteListItem[]>({
    queryKey: ["sites"],
    queryFn: async () => {
      // 백엔드는 { items, total } 형태로 응답한다.
      const res = await api
        .get("api/v1/sites")
        .json<{ items: SiteListItem[]; total: number }>();
      return res.items ?? [];
    },
    retry: false,
  });
}

export function useHasPublishedSite() {
  const { data: sites, isLoading } = useSites();
  const hasPublished = sites?.some((s) => s.is_published) ?? false;
  return { hasPublished, isLoading };
}
