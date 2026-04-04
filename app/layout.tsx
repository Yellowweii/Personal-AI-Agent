import type { Metadata, Viewport } from "next";
import "@/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://ai.yellowwei.cn",
  ),
  title: {
    default: "AI Chat - 智能对话助手",
    template: "%s | AI Chat",
  },
  description:
    "基于 LLM 的智能对话助手，支持流式输出和多轮对话。随时随地与 AI 交流，获取专业解答和创意灵感。",
  keywords: [
    "AI对话",
    "人工智能",
    "LLM",
    "智能助手",
    "聊天机器人",
    "AI Chat",
    "流式输出",
    "多轮对话",
    "文生文",
    "文生图",
    "多模态对话",
  ],
  authors: [{ name: "Yellowwei" }],
  creator: "Yellowwei",
  publisher: "Yellowwei",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AI Chat",
  description: "基于 LLM 的智能对话助手，支持流式输出和多轮对话",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://ai.yellowwei.cn",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CNY",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1024",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
