import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/lib/wallet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WalletModal } from '@/components/WalletModal';

export const metadata: Metadata = {
  title: 'Chaupal • A Seal of Belonging for Every Chaupal',
  description: 'Sovereign Zero-Knowledge Civic Membership Platform connecting 12 autonomous Indian communities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface font-body text-on-surface antialiased">
        <WalletProvider>
          <Navbar />
          <main className="w-full pt-24 min-h-screen">
            {children}
          </main>
          <Footer />
          <WalletModal />
        </WalletProvider>
      </body>
    </html>
  );
}
