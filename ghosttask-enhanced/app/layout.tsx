import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GhostTask AI — Smart Schedule & Task Manager",
  description: "Experience premium, AI-optimized productivity. GhostTask analyzes behavioral habits to auto-reschedule workloads, prevent burnout, and streamline daily targets.",
  metadataBase: new URL("https://ghosttask.ai"),
  openGraph: {
    title: "GhostTask AI — Smart Schedule & Task Manager",
    description: "Experience premium, AI-optimized productivity. GhostTask analyzes behavioral habits to auto-reschedule workloads, prevent burnout, and streamline daily targets.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#110e2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
