import AdminNewsletterList from "../../../components/admin/AdminNewsletterList";
import { getAllNewsletterSubscribers } from "@/lib/queries/newsletter";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await getAllNewsletterSubscribers();

  return <AdminNewsletterList subscribers={subscribers} />;
}
