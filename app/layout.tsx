import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KNN Concept Check',
  description: 'An interactive formative quiz about K-nearest neighbours, model performance, consistency, and predictor variance.',
  openGraph: {
    title: 'KNN Concept Check',
    description: 'Explore accuracy, precision, consistency and predictor variance.',
    url: 'https://alexbernardino.github.io/knn-quiz/',
    type: 'website',
    images: [{ url: 'https://alexbernardino.github.io/knn-quiz/og.png', width: 1536, height: 1024 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KNN Concept Check',
    description: 'Explore accuracy, precision, consistency and predictor variance.',
    images: ['https://alexbernardino.github.io/knn-quiz/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
