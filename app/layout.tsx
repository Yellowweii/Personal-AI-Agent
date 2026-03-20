import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chat - 智能对话助手",
  description: "基于 GPT-4o 的智能对话助手，支持流式输出和多轮对话",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
