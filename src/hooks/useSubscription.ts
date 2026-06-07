"use client";
import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "@/lib/api";
import type { SubscriptionStatus } from "@/types";

export function useSubscription() {
  return useQuery<SubscriptionStatus>({
    queryKey: ["subscription"],
    queryFn: getSubscriptionStatus,
    retry: false,
  });
}
