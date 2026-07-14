import { redirect } from "next/navigation";
import Section from "../components/ui/Section";
import PageHero from "../components/ui/PageHero";
import AccountSidebar from "../components/account/AccountSidebar";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <PageHero eyebrow="Account" title="My Account" />
      <Section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <AccountSidebar />
          <div>{children}</div>
        </div>
      </Section>
    </>
  );
}
