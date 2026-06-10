"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserResponse } from "@/types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api.get("api/v1/users/me").json<UserResponse>(),
    retry: false,
  });
}
