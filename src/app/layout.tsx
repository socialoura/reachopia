import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/components/layout/ConditionalHeader";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { TranslationProvider } from "@/context/TranslationContext";
import { PostHogProvider } from "@/components/PostHogProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reachopia — AI-Powered Organic Growth for Instagram & TikTok",
  description:
    "Accelerate your social media presence with Reachopia's proprietary AI audience-targeting engine. Real reach, algorithmic amplification, and measurable momentum for Instagram & TikTok creators and brands.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white overflow-x-hidden">
        <GoogleAnalytics />
        <PostHogProvider>
          <Suspense fallback={null}>
            <CurrencyProvider>
              <TranslationProvider>
                <ConditionalHeader />
                {children}
              </TranslationProvider>
            </CurrencyProvider>
          </Suspense>
        </PostHogProvider>
      </body>
    </html>
  );
}
