import type { Metadata } from "next";
import "./globals.css";
import { inter, interDisplay } from "./fonts";
import QueryProvider from "@/components/providers/QueryProvider";
import AppShell from "@/components/layout/AppShell";

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
    <html lang="ko" className={`${inter.variable} ${interDisplay.variable}`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
