import type { Metadata } from 'next';
import { Inter, Jost } from 'next/font/google';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SITE_NAME, SITE_URL } from '../data/siteConfig';
import './globals.css';

const FloatingBrainGames = dynamic(() => import('../components/FloatingBrainGames'));
const FloatingChatbot = dynamic(() => import('../components/FloatingChatbot'));
const ScrollToTop = dynamic(() => import('../components/ScrollToTop'));

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jost = Jost({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Free Online Calculators, PDF Tools & Utility Tools`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Explore Tuitility for free online calculators, converters, finance tools, health calculators, PDF tools, science tools, and productivity utilities.',
  keywords: [
    'free online calculators',
    'utility tools',
    'pdf tools',
    'finance calculator',
    'math calculator',
    'health calculator',
    'science calculator',
    'converter tools',
  ],
  icons: {
    icon: '/images/favicon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Free Online Calculators, PDF Tools & Utility Tools`,
    description: 'Explore Tuitility for free online calculators, utility tools, PDF tools, and conversion tools.',
    type: 'website',
    url: SITE_URL,
    images: [
      {
        url: '/images/logo.png',
        width: 800,
        height: 600,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Free Online Calculators, PDF Tools & Utility Tools`,
    description: 'Explore Tuitility for free online calculators, utility tools, PDF tools, and conversion tools.',
    images: ['/images/logo.png'],
  },
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtagId = process.env.GTAG_ID || 'G-J5D6X4QFD9';

  return (
    <html lang="en" className={`${inter.variable} ${jost.variable} h-full scroll-smooth`}>
      <head>
        {/* Google Analytics (gtag.js) — loaded after page is interactive */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtagId}');
          `}
        </Script>

        {/* Font Awesome — loaded after page is interactive (not render-blocking) */}
        <Script id="font-awesome-loader" strategy="afterInteractive">
          {`
            (function() {
              var link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
              document.head.appendChild(link);
            })();
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col pt-24 relative">

        <ScrollToTop />
        <Header />
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <FloatingBrainGames />
          <FloatingChatbot />
        </div>
      </body>
    </html>
  );
}
