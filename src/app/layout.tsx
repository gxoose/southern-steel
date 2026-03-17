import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "808 GXOOSE — Premium Beats & Production",
  description:
    "Dark trap, 808-heavy beats from 808 GXOOSE. Browse, preview, and license exclusive instrumentals for your next project.",
  keywords: [
    "beats",
    "trap beats",
    "808",
    "beat producer",
    "instrumentals",
    "buy beats",
    "hip hop beats",
    "dark trap",
  ],
  openGraph: {
    title: "808 GXOOSE — Premium Beats & Production",
    description:
      "Dark trap, 808-heavy beats. Browse, preview, and license exclusive instrumentals.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "808 GXOOSE",
    description: "Premium dark trap beats & production",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
