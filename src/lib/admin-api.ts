import { api } from "@/lib/api";

export interface AdminPipelineItem {
  site_id: string;
  publish_status: string;
  attempt: number | null;
  updated_at: string | null;
  error_message: string | null;
}

export interface AdminPipelineList {
  items: AdminPipelineItem[];
  total: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

export interface AdminUserList {
  items: AdminUserItem[];
  total: number;
}

export async function fetchAdminPipeline(): Promise<AdminPipelineList> {
  return api.get("api/v1/admin/pipeline").json<AdminPipelineList>();
}

export async function fetchAdminPipelineItem(siteId: string): Promise<AdminPipelineItem> {
  return api.get(`api/v1/admin/pipeline/${siteId}`).json<AdminPipelineItem>();
}

export async function fetchAdminUsers(): Promise<AdminUserList> {
  return api.get("api/v1/admin/users").json<AdminUserList>();
}
