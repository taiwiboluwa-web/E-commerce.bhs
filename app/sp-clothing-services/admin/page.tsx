import SPAdminClient from "./sp-admin-client";
import "../sp-clothing.css";

export const metadata = { title: "SP Clothing Services | Store Admin" };
export const dynamic = "force-dynamic";

export default function SPAdminPage() {
  return <main className="sp-admin-shell"><SPAdminClient/></main>;
}
