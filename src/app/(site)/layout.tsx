import Footer from "@/components/layout/Footer";
import StickyBottomCTA from "@/components/ui/StickyBottomCTA";
import LiveActivityToast from "@/components/ui/LiveActivityToast";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyBottomCTA />
      <LiveActivityToast />
    </>
  );
}
