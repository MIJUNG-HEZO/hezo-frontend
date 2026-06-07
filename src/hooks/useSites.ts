"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface SiteListItem {
  id: string;
  name: string;
  status: string;
  site_type?: string;
  is_published?: boolean;
}

export function useSites() {
  return useQuery<SiteListItem[]>({
    queryKey: ["sites"],
    queryFn: () => api.get("api/v1/sites").json<SiteListItem[]>(),
    retry: false,
  });
}

export function useHasPublishedSite() {
  const { data: sites, isLoading } = useSites();
  const hasPublished = sites?.some((s) => s.status === "published") ?? false;
  return { hasPublished, isLoading };
}
