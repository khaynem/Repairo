export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  ),
  title: {
    default: "Repairo — Expert Device Repair Services",
    template: "%s | Repairo",
  },
  description:
    "Connect with certified technicians for fast, reliable repairs on all your electronic devices. Eco-friendly solutions that extend your device's lifespan.",
  keywords: [
    "device repair",
    "phone repair",
    "laptop repair",
    "technician",
    "electronic repair",
    "certified repair",
    "eco-friendly repair",
    "repair services",
  ],
  authors: [{ name: "Repairo" }],
  creator: "Repairo",
  publisher: "Repairo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Repairo",
    title: "Repairo — Expert Device Repair Services",
    description:
      "Connect with certified technicians for fast, reliable repairs on all your electronic devices.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Repairo Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repairo — Expert Device Repair Services",
    description:
      "Connect with certified technicians for fast, reliable repairs on all your electronic devices.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import "./globals.css";
import ToasterClient from "../components/ToasterClient";
import QueryProvider from "../components/QueryProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#667eea" />
        <link rel="icon" href="/images/logo.png" />
      </head>
      <body>
        <QueryProvider>
          <ToasterClient />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
