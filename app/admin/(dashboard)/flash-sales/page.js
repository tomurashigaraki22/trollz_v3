import AdminFlashSalesManager from "../../../components/admin/AdminFlashSalesManager";
import { getFlashSaleProductsForAdmin } from "@/lib/queries/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminFlashSalesPage() {
  const flashSaleProducts = await getFlashSaleProductsForAdmin();

  return <AdminFlashSalesManager flashSaleProducts={flashSaleProducts} />;
}
