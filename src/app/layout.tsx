import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import TopAnnouncementBar from "@/components/ui/TopAnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import { CurrencyProvider } from "@/context/CurrencyContext";
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
      <body className="min-h-full flex flex-col bg-black text-white">
        <GoogleAnalytics />
        <PostHogProvider>
          <CurrencyProvider>
            <TopAnnouncementBar />
            <Navbar />
            {children}
          </CurrencyProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
