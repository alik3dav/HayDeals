import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';

import '@/app/globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl, getSiteUrl } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const analyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        {analyticsId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${analyticsId}');`}
            </Script>
          </>
        ) : null}
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
