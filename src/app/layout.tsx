import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans'; // Corrected import
import { GeistMono } from 'geist/font/mono'; // Corrected import
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = GeistSans({ // Corrected usage
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({ // Corrected usage
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FridgeChef',
  description: 'AI-powered recipe suggestions based on your ingredients.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
