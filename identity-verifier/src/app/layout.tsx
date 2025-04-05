import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zhat's Me | ETHGlobal Hackathon Ticket Verification",
  description: "Securely verify your identity to claim your ETHGlobal Hackathon ticket without revealing your ID document. Powered by Self Protocol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="w-full border-b p-4 flex justify-center">
          <div className="max-w-5xl w-full flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Zhat's Me
              </span>
              <span className="ml-2 text-xs py-1 px-2 bg-blue-100 text-blue-800 rounded-full">
                by Self Protocol
              </span>
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-medium">ETHGlobal Hackathon Ticket Verification</span>
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-5rem)]">
          {children}
        </div>
        <footer className="w-full border-t p-4 text-center text-sm text-gray-500">
          <p>ETHGlobal Hackathon Ticket Verification • Powered by Self Protocol • Privacy-Preserving Identity Verification</p>
        </footer>
      </body>
    </html>
  );
}
