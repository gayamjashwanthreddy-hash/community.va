import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://communityva.org"),
  title: "COMMUNITY.VA | Connecting People, Creating Opportunities",
  description:
    "COMMUNITY.VA is a student-led youth community connecting people and creating opportunities through technology, innovation, events, personal development and collaboration.",
  keywords: [
    "COMMUNITY.VA",
    "youth community",
    "student community Hyderabad",
    "student opportunities",
    "hackathons",
    "workshops",
    "personal development",
    "networking",
    "college community",
  ],
  authors: [{ name: "COMMUNITY.VA" }],
  creator: "COMMUNITY.VA",
  publisher: "COMMUNITY.VA",
  formatDetection: {
    email: true,
    telephone: true,
  },
  icons: {
    icon: "/logos/community-va-logo.png",
    shortcut: "/logos/community-va-logo.png",
    apple: "/logos/community-va-logo.png",
  },
  openGraph: {
    title: "COMMUNITY.VA | Connecting People, Creating Opportunities",
    description:
      "A student-led community focused on bringing people together and creating opportunities for students to learn, connect, showcase talents, and develop leadership.",
    url: "https://communityva.org",
    siteName: "COMMUNITY.VA",
    images: [
      {
        url: "/logos/community-va-logo.png",
        width: 1200,
        height: 630,
        alt: "COMMUNITY.VA — Connecting People • Creating Opportunities",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COMMUNITY.VA | Connecting People, Creating Opportunities",
    description:
      "A student-led community focused on bringing people together and creating opportunities for students to learn, connect, and grow.",
    images: ["/logos/community-va-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#151515",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-brand-bg text-brand-dark selection:bg-brand-blue selection:text-white font-body">
        {children}
      </body>
    </html>
  );
}
