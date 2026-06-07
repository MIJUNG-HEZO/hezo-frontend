import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/layout/AuthGuard";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "HEZO Studio",
  description: "AI 검색 친화 홈페이지 자동 생성 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 antialiased">
        <QueryProvider>
          <AuthGuard>
            <Sidebar />
            <main className="min-h-screen p-8 pl-16">{children}</main>
          </AuthGuard>
        </QueryProvider>
      </body>
    </html>
  );
}
