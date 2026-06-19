import type { Metadata } from 'next';
import { Inter, Jost } from 'next/font/google';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingGameButton from '../components/FloatingGameButton';
import ScrollToTop from '../components/ScrollToTop';
import { SITE_NAME, SITE_URL } from '../data/siteConfig';
import './globals.css';

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
  return (
    <html lang="en" className={`${inter.variable} ${jost.variable} h-full scroll-smooth`}>
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KLMXXLLM');`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col pt-24 relative">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KLMXXLLM"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <ScrollToTop />
        <Header />
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
        <FloatingGameButton />
      </body>
    </html>
  );
}
