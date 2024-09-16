import { cn } from "@/lib/utils";
import { BalloonsProvider } from "@/providers/Balloon";
import { fontEuclid, fontMono } from "@/styles/fonts";
import "@/styles/globals.css";

import { TRPCReactProvider } from "@/trpc/react";

import type { Metadata, Viewport } from "next";
import { CustomToast } from "@/components/custom-toast";
import { MobileCheck } from "@/components/mobile-check";
import { BALLOON_COUNT, PRIZE_ETH } from "@/lib/constants";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Red Balloon @ ETHCC",
    description: `Collect ${BALLOON_COUNT} to win ${PRIZE_ETH} ETH`,
    icons: [{ rel: "icon", url: "/favicon.ico" }],
    openGraph: {
      title: "Red Balloon @ ETHCC",
      description: `Collect ${BALLOON_COUNT} to win ${PRIZE_ETH} ETH`,
      images: [
        {
          url: "https://play.redballoon.be/opengraph-image.jpg",
          width: 1200,
          height: 630,
          alt: "Red Balloon @ ETHCC",
        },
      ],
      siteName: "Red Balloon @ ETHCC",
    },
    twitter: {
      card: "summary_large_image",
      title: "Red Balloon @ ETHCC",
      description: `Collect ${BALLOON_COUNT} to win ${PRIZE_ETH} ETH`,
      images: "https://play.redballoon.be/opengraph-image.jpg",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex h-[calc(100dvh)] w-[calc(100dvw)] flex-col font-mono antialiased",
          fontMono.variable,
          fontEuclid.variable,
        )}
      >
        <MobileCheck />
        <CustomToast />
        <BalloonsProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </BalloonsProvider>
      </body>
    </html>
  );
}
