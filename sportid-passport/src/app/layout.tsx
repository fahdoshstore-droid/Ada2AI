import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";

// ── PWA + SEO Metadata ────────────────────────────────────────────
export const metadata: Metadata = {
  title: "ada2ai · Sport Passport ID — Saudi Athletic Intelligence",
  description:
    "ada2ai — Empowering Athletic Performance Through AI. Vision 2030 aligned unified digital sport passport for Saudi athletes. Sport ID integrated, QR check-in, AI-powered career pathway.",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    title: "ada2ai",
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg", sizes: "any" }],
  },

  other: {
    "mobile-web-app-capable":      "yes",
    "msapplication-TileColor":     "#000A0F",
    "msapplication-tap-highlight": "no",
    "format-detection":            "telephone=no, email=no, address=no",
  },
};

// ── Viewport ────────────────────────────────────────────────────
export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit:  "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#000A0F" },
    { media: "(prefers-color-scheme: light)", color: "#000A0F" },
  ],
};

// ── Root Layout ──────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ada2ai brand fonts: Orbitron (headings) + Cairo (Arabic body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Cairo:wght@300;400;600;700;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#000A0F] ios-scroll-fix">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
