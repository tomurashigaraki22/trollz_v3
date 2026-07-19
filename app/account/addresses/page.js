import AddressesManager from "../../components/account/AddressesManager";
import { requireUser } from "@/lib/session";
import { getAddressesForUser } from "@/lib/queries/addresses";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await getAddressesForUser(user.id);

  return <AddressesManager addresses={addresses} />;
}
