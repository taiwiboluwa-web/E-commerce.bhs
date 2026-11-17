import type { Metadata } from "next";
import BigBStorefront from "./big-b-client";
import "./big-b.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "BIG B'S — Ideas. People. Evolution.",
  description: "A student-led brand bringing people, ideas and opportunities closer together. Founded by Lukan Boluwatife Rita.",
  alternates: { canonical: "https://e-commerce-bhs.vercel.app/big-bs" },
  openGraph: { title: "BIG B'S — Ideas. People. Evolution.", description: "A student-led brand for connection, creativity and opportunity.", type: "website" }
};

export default function BigBStorefrontPage() {
  return <BigBStorefront />;
}
