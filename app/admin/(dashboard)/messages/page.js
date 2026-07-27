import AdminContactMessagesInbox from "../../../components/admin/AdminContactMessagesInbox";
import { getAllContactMessages } from "@/lib/queries/messages";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getAllContactMessages();

  return <AdminContactMessagesInbox messages={messages} />;
}
