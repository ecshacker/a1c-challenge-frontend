import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "The A1C Challenge",
  description: "A shared, open look at whether hemp seed and raw cannabis flower shift blood-sugar control over four weeks. Anonymous, self-reported, and fully public.",
  metadataBase: new URL("https://a1c-challenge.org"),
  openGraph: {
    title: "The A1C Challenge",
    description: "A shared, open look at whether hemp seed and raw cannabis flower shift blood-sugar control over four weeks.",
    url: "https://a1c-challenge.org/read-more",
    siteName: "The A1C Challenge",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "The A1C Challenge" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The A1C Challenge",
    description: "A shared, open look at whether hemp seed and raw cannabis flower shift blood-sugar control over four weeks.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={`${merriweather.variable}`}>
      <body
          style={{
            background: "#E6E5DD", // cool bone background from your spec
            margin: 0,
            padding: 0,
            minHeight: "100vh",
          }}
      >
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        {children}
      </main>
      </body>
      </html>
  );
}