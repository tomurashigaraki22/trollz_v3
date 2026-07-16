import AdminSellersManager from "../../../components/admin/AdminSellersManager";
import { getAllSellers } from "@/lib/queries/sellers";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const sellers = await getAllSellers();

  return <AdminSellersManager sellers={sellers} />;
}
