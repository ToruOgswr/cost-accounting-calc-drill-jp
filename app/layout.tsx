import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.jpg`;
  return {
    title: "原価計算｜計算論点ドリル",
    description: "WEEK1〜8の主要な計算論点を3分で確認する小テスト",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "原価計算 計算論点ドリル", description: "WEEK1〜8の主要論点を3分で確認", images: [{ url: imageUrl, width: 1536, height: 1024 }] },
    twitter: { card: "summary_large_image", title: "原価計算 計算論点ドリル", description: "WEEK1〜8の主要論点を3分で確認", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
