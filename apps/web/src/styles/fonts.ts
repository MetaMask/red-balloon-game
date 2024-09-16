import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-mono",
});

export const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const fontEuclid = localFont({
  src: [
    {
      path: "./font/euclidcircularb-bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./font/euclidcircularb-bolditalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./font/euclidcircularb-semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./font/euclidcircularb-semibolditalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "./font/euclidcircularb-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./font/euclidcircularb-regularitalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./font/euclidcircularb-medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./font/euclidcircularb-mediumitalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./font/euclidcircularb-light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./font/euclidcircularb-lightitalic.ttf",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--font-euclid",
});
