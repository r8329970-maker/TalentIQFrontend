import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TalentIQ — AI-powered recruitment intelligence',
  description:
    'TalentIQ helps recruiters upload resumes, parse candidate data, create jobs, and evaluate candidates with explainable matching insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
