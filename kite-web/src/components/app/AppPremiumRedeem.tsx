import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppRedeemCodeMutation } from "@/lib/api/mutations";
import { useAppEntitlements, useBillingPlans } from "@/lib/hooks/api";
import { useAppId } from "@/lib/hooks/params";
import { CheckIcon, LockIcon } from "lucide-react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const PERK_PLANS = ["premium", "investor"];

export default function AppPremiumRedeem() {
  const appId = useAppId();
  const plans = useBillingPlans();
  const entitlements = useAppEntitlements();
  const redeemMutation = useAppRedeemCodeMutation(appId);

  const [code, setCode] = useState("");

  const unlockedPlanIDs = useMemo(
    () =>
      new Set(
        (entitlements ?? [])
          .map((entitlement) => entitlement?.plan_id)
          .filter(Boolean)
      ),
    [entitlements]
  );

  const perkPlans = useMemo(
    () =>
      (plans ?? []).filter((plan) => !!plan && PERK_PLANS.includes(plan.id)),
    [plans]
  );

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (!code.trim()) {
        return;
      }

      redeemMutation.mutate(
        { code },
        {
          onSuccess(res) {
            if (res.success) {
              toast.success(`${res.data.plan_title} unlocked for this app!`);
              setCode("");
            } else {
              toast.error(res.error.message);
            }
          },
        }
      );
    },
    [code, redeemMutation]
  );

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8 xl:mx-16">
        {perkPlans.map((plan) => {
          const unlocked = plan ? unlockedPlanIDs.has(plan.id) : false;

          return (
            <Card key={plan!.id} className={unlocked ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan!.title}
                  {unlocked ? (
                    <Badge variant="secondary" className="text-sm text-primary">
                      Unlocked
                    </Badge>
                  ) : (
                    <LockIcon className="size-4 text-muted-foreground" />
                  )}
                </CardTitle>
                <CardDescription>{plan!.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex">
                <div className="space-y-4">
                  <span className="flex">
                    <CheckIcon className="text-green-500" />{" "}
                    <h3 className="ml-2">
                      {plan!.feature_max_commands_per_app} Commands
                    </h3>
                  </span>
                  <span className="flex">
                    <CheckIcon className="text-green-500" />{" "}
                    <h3 className="ml-2">
                      {plan!.feature_max_messages_per_app} Messages
                    </h3>
                  </span>
                  <span className="flex">
                    <CheckIcon className="text-green-500" />{" "}
                    <h3 className="ml-2">
                      {plan!.feature_max_event_listeners_per_app} Event
                      Listeners
                    </h3>
                  </span>
                  {plan!.feature_custom_status ? (
                    <span className="flex">
                      <CheckIcon className="text-green-500" />{" "}
                      <h3 className="ml-2">Custom bot status</h3>
                    </span>
                  ) : null}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="xl:mx-16">
        <CardHeader>
          <CardTitle>Unlock with a purchase code</CardTitle>
          <CardDescription>
            Enter your Premium or Investor purchase code to unlock the perks for
            this app. Each code can only be used once.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Enter purchase code"
                className="max-w-sm font-mono uppercase"
              />
              <Button
                type="submit"
                disabled={redeemMutation.isPending || !code.trim()}
              >
                Redeem code
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
