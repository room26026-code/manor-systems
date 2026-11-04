import AppLayout from "@/components/app/AppLayout";
import { Separator } from "@/components/ui/separator";
import AppSubscriptionList from "@/components/app/AppSubscriptionList";
import AppPricingList from "@/components/app/AppPricingList";
import AppPremiumRedeem from "@/components/app/AppPremiumRedeem";

const breadcrumbs = [
  {
    label: "Premium",
  },
];

export default function AppPremiumPage() {
  return (
    <AppLayout title="Premium" breadcrumbs={breadcrumbs}>
      <div>
        <h1 className="text-lg font-semibold md:text-2xl mb-1">MaNor Hosing Premium</h1>
        <p className="text-muted-foreground text-sm">
          Manage your app&apos;s access to premium features and subscriptions.
        </p>
      </div>
      <Separator className="my-8" />

      <AppPremiumRedeem />

      <Separator className="my-8 xl:mb-20" />

      <AppPricingList />

      <AppSubscriptionList />
    </AppLayout>
  );
}
