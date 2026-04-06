import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vault Ventures CRM',
  description: 'Self-Storage Acquisition Pipeline Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-dark text-white">{children}</body>
    </html>
  );
}
