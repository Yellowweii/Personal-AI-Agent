import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://ai.yellowwei.cn",
  ),
  title: {
    default: "Personal AI Agent - 个人智能助理",
    template: "%s | Personal AI Agent",
  },
  description:
    "基于 LLM 的个人 AI Agent，理解你的意图并执行任务。支持文字、图片、语音等多模态能力，帮你完成问答、创作与信息处理。",
  keywords: [
    "Personal AI Agent",
    "个人智能助理",
    "AI Agent",
    "人工智能",
    "LLM",
    "意图识别",
    "多模态",
    "文生文",
    "文生图",
    "语音输入",
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
  name: "Personal AI Agent",
  description:
    "基于 LLM 的个人 AI Agent，理解意图并执行任务，支持多模态能力",
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
