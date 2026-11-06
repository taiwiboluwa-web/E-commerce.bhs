import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BLUEHAVEN STUDIOS — Commerce Control Centre",
  description: "The BlueHaven Studios commerce platform control centre."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}