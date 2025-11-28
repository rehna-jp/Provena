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
      <body className={`${inter.className} bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 lg:px-6 py-12 space-y-12">
              {children}
            </main>

            <footer className="mt-20 bg-slate-950/50 backdrop-blur border-t border-slate-800">
              <div className="container mx-auto px-4 lg:px-6 py-12 space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-bold text-2xl text-cyan-400 mb-2">Provena</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      AI-powered supply chain verification <br />on blockchain
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Network</h4>
                    <ul className="space-y-1 text-sm text-slate-400">
                      <li>NeuroWeb Testnet</li>
                      <li>OriginTrail DKG</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Status</h4>
                    <p className="text-sm text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      Live on Testnet
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6 text-center text-slate-400 text-sm">
                  <p>© 2024 Provena. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
