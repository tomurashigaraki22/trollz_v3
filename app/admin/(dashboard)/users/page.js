import { getAllCustomers } from "@/lib/queries/users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const customers = await getAllCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Customers</h1>
        <p className="mt-1 text-sm text-ink-500">{customers.length} registered accounts.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Addresses</th>
              <th className="px-4 py-3">Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {customers.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{user.name}</td>
                <td className="px-4 py-3 text-ink-600">{user.email}</td>
                <td className="px-4 py-3 text-ink-500">{user.phone}</td>
                <td className="px-4 py-3 text-ink-500">{user.address_count}</td>
                <td className="px-4 py-3 text-ink-500">{user.order_count}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-500">
                  No registered customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
