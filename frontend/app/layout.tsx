import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "../components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Provena - AI-Verified Supply Chain",
  description: "Blockchain-powered supply chain verification with AI agents on NeuroWeb",
  keywords: ["blockchain", "supply chain", "AI", "NeuroWeb", "OriginTrail", "DKG"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="border-t border-slate-800 mt-20">
              <div className="container mx-auto px-4 py-8">
                <div className="text-center text-slate-400 text-sm">
                  <p>Built with ❤️ using NeuroWeb & OriginTrail DKG</p>
                  <p className="mt-2">© 2024 Provena. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}