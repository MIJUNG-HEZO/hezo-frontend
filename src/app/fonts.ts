import localFont from "next/font/local";

// Self-hosted Inter + Inter Display (from the Claude Design handoff).
// Exposed as CSS variables so globals.css @theme can map them to
// --font-sans / --font-display (and thus font-sans / font-display utilities).

export const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Inter-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Inter-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const interDisplay = localFont({
  src: [
    { path: "./fonts/InterDisplay-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/InterDisplay-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/InterDisplay-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-inter-display",
  display: "swap",
});
