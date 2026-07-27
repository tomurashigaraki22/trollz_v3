import AdminCouponsManager from "../../../components/admin/AdminCouponsManager";
import { getAllCoupons } from "@/lib/queries/coupons";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getAllCoupons();

  return <AdminCouponsManager coupons={coupons} />;
}
