import type { Metadata } from 'next';
import './globals.css';
import { PitchProvider } from '@/context/PitchContext';

export const metadata: Metadata = {
  title: 'Behind The Build',
  description: 'Behind The Build Voting App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <PitchProvider>{children}</PitchProvider>
      </body>
    </html>
  );
}
