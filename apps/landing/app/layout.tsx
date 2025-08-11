import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'High Quality Moving | OKC Movers',
  description: 'Top-rated, family-owned moving company in Oklahoma City. Transparent pricing, no hidden fees, and award-winning service.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
