import AdminBannerManager from "../../../components/admin/AdminBannerManager";
import { getBanner } from "@/lib/queries/banner";

export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
  const banner = await getBanner();

  return <AdminBannerManager banner={banner} />;
}
