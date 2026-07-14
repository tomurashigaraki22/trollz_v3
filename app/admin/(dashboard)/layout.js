import { redirect } from "next/navigation";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "Admin") {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      <AdminSidebar admin={user} />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
