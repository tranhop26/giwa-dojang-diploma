import type { Metadata } from "next";
import { Exo_2, Orbitron } from "next/font/google";
import "../globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dojang Diploma — On-chain Verifiable Certificates on GIWA",
  description: "Dojang Diploma issues academically rigorous and tamper-proof certificates using Ethereum Attestation Service (EAS) directly on GIWA Sepolia Testnet.",
  openGraph: {
    title: "Dojang Diploma — On-chain Verifiable Certificates on GIWA",
    description: "Tamper-proof academic achievements minted as on-chain EAS attestations on GIWA Sepolia Testnet.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dojang Diploma",
      }
    ],
  },
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={cn("dark", exo2.variable, orbitron.variable)}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen selection:bg-primary selection:text-primary-foreground">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster position="top-right" richColors />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
