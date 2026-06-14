import type { Metadata, Viewport } from "next";
import { AppToaster } from "@/views/Agent/components/AppToaster";
import "./css/globals.css";
import "sonner/dist/styles.css";
import "./css/sonnerOverrides.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ai.yellowwei.cn";
const siteDescription =
  "基于 LLM 的个人 AI Agent：意图识别、任务规划与多模态执行。支持文字、图片、语音输入与流式播报，具备会话记忆与上下文管理。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Personal AI Agent - 个人智能助理",
    template: "%s | Personal AI Agent",
  },
  description: siteDescription,
  keywords: [
    "Personal AI Agent",
    "个人智能助理",
    "AI Agent",
    "人工智能",
    "LLM",
    "意图识别",
    "任务规划",
    "多模态",
    "文生文",
    "文生图",
    "文生视频",
    "语音输入",
    "语音播报",
    "图片上传",
    "会话记忆",
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
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "Personal AI Agent",
    title: "Personal AI Agent - 个人智能助理",
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: "Personal AI Agent - 个人智能助理",
    description: siteDescription,
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
  "@type": "WebApplication",
  name: "Personal AI Agent",
  description: siteDescription,
  url: siteUrl,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser",
  inLanguage: "zh-CN",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CNY",
  },
  featureList: [
    "意图识别与任务规划",
    "文生文 / 文生图 / 文生视频",
    "语音输入与流式语音播报",
    "图片上传与视觉理解",
    "会话记忆与上下文管理",
  ],
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
