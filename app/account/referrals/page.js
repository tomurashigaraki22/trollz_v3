import { Gift, Users, Coins } from "lucide-react";
import Card from "../../components/ui/Card";
import InviteLinkCard from "../../components/account/InviteLinkCard";
import { formatNaira } from "@/lib/mock/data";
import { getCurrentUser } from "@/lib/session";
import {
  ensureReferralCode,
  getReferralSettings,
  getUserCredits,
  getReferralStats,
} from "@/lib/queries/referrals";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const user = await getCurrentUser();
  const [code, settings, credits, stats] = await Promise.all([
    ensureReferralCode(user.id),
    getReferralSettings(),
    getUserCredits(user.id),
    getReferralStats(user.id),
  ]);

  const creditValueNgn = Number(settings.credit_value_ngn);
  const inviteLink = `${SITE_URL}/register?ref=${code}`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Invite & Earn</h2>
        <p className="mt-1 text-sm text-ink-500">
          Share your invite link. When a friend you invite spends{" "}
          {formatNaira(settings.qualifying_spend_ngn)} or more, you earn{" "}
          {Number(settings.credits_awarded).toLocaleString()} store credits.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Gift className="h-4 w-4 text-brand-500" /> Your Invite Link
        </h3>
        <InviteLinkCard link={inviteLink} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <Coins className="h-5 w-5 text-brand-500" />
          <p className="mt-3 text-2xl font-bold text-ink-900">{credits.toLocaleString()}</p>
          <p className="text-sm text-ink-500">
            Credits available ({formatNaira(credits * creditValueNgn)})
          </p>
        </Card>
        <Card className="p-5">
          <Users className="h-5 w-5 text-brand-500" />
          <p className="mt-3 text-2xl font-bold text-ink-900">{stats.referralCount}</p>
          <p className="text-sm text-ink-500">Successful referrals</p>
        </Card>
        <Card className="p-5">
          <Gift className="h-5 w-5 text-brand-500" />
          <p className="mt-3 text-2xl font-bold text-ink-900">{stats.creditsEarned.toLocaleString()}</p>
          <p className="text-sm text-ink-500">Lifetime credits earned</p>
        </Card>
      </div>

      <p className="text-xs text-ink-400">
        1 credit = {formatNaira(creditValueNgn)}. Credits can be applied at checkout to reduce your
        order total.
      </p>
    </div>
  );
}
