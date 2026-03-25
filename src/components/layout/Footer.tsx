import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  product: [
    { label: "Instagram Growth", href: "/instagram" },
    { label: "TikTok Growth", href: "/tiktok" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <Image
                src="/images/common/logo-white.png"
                alt="Views4You"
                width={24}
                height={24}
                className="rounded-md"
              />
              <span className="text-[15px] font-semibold text-white tracking-tight">
                Views4You
              </span>
            </Link>
            <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[260px]">
              Proprietary AI audience-targeting engine for Instagram &amp; TikTok.
              Trusted by 50,000+ creators worldwide.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-5">
              Product
            </h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.product.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-5">
              Company
            </h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-5">
              Legal
            </h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-600">
            &copy; {new Date().getFullYear()} Views4You. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-glow" />
            <span className="text-[11px] text-zinc-600">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
