// app/layout.tsx - Use ConditionalNavbar instead of Navbar
import { Inter } from 'next/font/google';
import { Providers } from './providers';
// import { CartProvider } from '@/contexts/CartContext';
import ConditionalNavbar from '@/components/layout/ConditionalNavbar';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import ParallaxWrapper from '@/components/providers/ParallaxWrapper';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DTU Shop - Student Marketplace',
  description: 'The official marketplace for Delhi Technological University students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {/* <CartProvider> */}
            <ParallaxWrapper>
              <div className="min-h-screen flex flex-col">
                <ConditionalNavbar />
                <main className="flex-1">
                  {children}
                </main>
                <ConditionalFooter />
              </div>
              <Toaster position="top-right" />
            </ParallaxWrapper>
          {/* </CartProvider> */}
        </Providers>
      </body>
    </html>
  );
}
