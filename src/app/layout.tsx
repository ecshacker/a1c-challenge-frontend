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
  description: "A Study in Endocannabinoid Nutritional Biology",
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