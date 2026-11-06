import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BHS Commerce — Storefront Control",
  description: "A multi-store commerce platform by BlueHaven Studios."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}