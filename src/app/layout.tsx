import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppFrame } from "@/components/shell/AppFrame";
import { BottomNav } from "@/components/shell/BottomNav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "liquid.trade",
  description: "Elite perpetuals trading, up to 1000x leverage across crypto, forex and commodities.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <AppFrame>
          <main className="no-scrollbar flex-1 overflow-y-auto pb-24">{children}</main>
          <BottomNav />
        </AppFrame>
      </body>
    </html>
  );
}
