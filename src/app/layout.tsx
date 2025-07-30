import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';

const APP_NAME = 'Tandai PDF';
const APP_DESCRIPTION = 'Your personal PDF reader with smart bookmarking.';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_NAME,
      template: `%s - ${APP_NAME}`
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: 'https://placehold.co/1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Tandai PDF Cover Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: APP_NAME,
      template: `%s - ${APP_NAME}`
    },
    description: APP_DESCRIPTION,
    images: ['https://placehold.co/1200x630.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400;1,7..72,700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
