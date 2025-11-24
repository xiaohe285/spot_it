import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import StructuredData from "@/components/seo/StructuredData";
import { getWebsiteSchema, getOrganizationSchema } from "@/lib/structuredData";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const siteUrl = "https://spotdiffs.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Spot the Difference - Free Online Puzzle Games",
    template: "%s | Spot the Difference",
  },
  description: "Play the best Spot the Difference games online. Challenge your brain with daily puzzles for adults and kids. Find hidden differences and improve your observation skills!",
  keywords: ["spot the difference", "find the difference", "puzzle games", "brain games", "observation games", "free online games", "daily puzzles"],
  authors: [{ name: "Spot the Difference" }],
  creator: "Spot the Difference",
  publisher: "Spot the Difference",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Spot the Difference",
    title: "Spot the Difference - Free Online Puzzle Games",
    description: "Play the best Spot the Difference games online. Challenge your brain with daily puzzles for adults and kids.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`, // You'll need to add this image to public folder
        width: 1200,
        height: 630,
        alt: "Spot the Difference - Online Puzzle Games",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Spot the Difference - Free Online Puzzle Games",
    description: "Play the best Spot the Difference games online. Challenge your brain with daily puzzles.",
    images: [`${siteUrl}/og-image.jpg`],
  },

  // Verification and Additional
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Alternate and Canonical
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        <StructuredData data={[getWebsiteSchema(), getOrganizationSchema()]} />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-gray-50">
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
