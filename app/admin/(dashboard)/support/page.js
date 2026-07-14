import AdminSupportInbox from "../../../components/admin/AdminSupportInbox";
import { getAllSupportMessages } from "@/lib/queries/support";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const messages = await getAllSupportMessages();

  return <AdminSupportInbox messages={messages} />;
}
