import { MessageCircle, Mail, ExternalLink } from "lucide-react";

const footerLinks = [
  { label: "المشكلة", href: "#problem" },
  { label: "الحل", href: "#solution" },
  { label: "كيف يعمل", href: "#how-it-works" },
  { label: "السوق", href: "#market" },
  { label: "الأسعار", href: "#pricing" },
  { label: "التقنية", href: "#tech" },
  { label: "رؤية 2030", href: "#vision" },
  { label: "تواصل معنا", href: "#contact" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/5 py-12 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, oklch(0.06 0.02 240), oklch(0.08 0.02 240))"
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[oklch(0.65_0.2_145/0.15)] border border-[oklch(0.65_0.2_145/0.4)] flex items-center justify-center">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/scout-ai-brain-logo-CtBLNrDPCVHeGSTYrQgYk9.webp"
                  alt="Scout AI"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span
                className="font-bold text-xl text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
              >
                SCOUT <span className="neon-text">AI</span>
              </span>
            </div>
            <p
              className="text-white/45 text-sm leading-relaxed mb-4"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              منصة اكتشاف وتحليل المواهب الرياضية في المنطقة الشرقية بالسعودية — مدعومة بالذكاء الاصطناعي
            </p>
            <div className="flex items-center gap-2">
              <span className="tag-green text-xs">🇸🇦 صُنع في السعودية</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-white font-bold mb-4"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              روابط سريعة
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-white/45 hover:text-[oklch(0.65_0.2_145)] text-sm text-right transition-colors"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white font-bold mb-4"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              تواصل معنا
            </h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/45 hover:text-[oklch(0.65_0.2_145)] transition-colors text-sm"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                <MessageCircle size={16} />
                واتساب
              </a>
              <a
                href="mailto:hello@scoutai.sa"
                className="flex items-center gap-3 text-white/45 hover:text-[oklch(0.65_0.2_145)] transition-colors text-sm"
                style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
              >
                <Mail size={16} />
                hello@scoutai.sa
              </a>
              <div
                className="flex items-center gap-3 text-white/45 text-sm"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                <ExternalLink size={16} />
                المنطقة الشرقية، السعودية
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-6" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-white/30 text-sm"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            © 2026 Scout AI — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_145)] animate-pulse" />
            <span
              className="text-white/30 text-xs"
              style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
            >
              Powered by Anthropic Claude AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
