import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import AutoAnimate from "../common/AutoAnimate";
import { useEventListeners } from "@/lib/hooks/api";
import EventListenerListEntry from "./EventListenerListEntry";
import AppEmptyPlaceholder from "./AppEmptyPlaceholder";
import EventListenerCreateDialog from "./EventListenerCreateDialog";
import { useAppFeature } from "@/lib/hooks/api";
import { useAppId } from "@/lib/hooks/params";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function EventListenerList() {
  const listeners = useEventListeners();
  const appId = useAppId();
  const eventListenerLimit = useAppFeature(
    (features) => features.max_event_listeners_per_app
  );

  if (eventListenerLimit === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event listeners are a Premium feature</CardTitle>
          <CardDescription>
            This app is on the Basic plan, which includes commands and message
            templates only. Redeem a Premium or Investor purchase code on the
            premium page to add event listeners.
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-t px-6 py-4">
          <Button asChild variant="outline">
            <Link href={`/apps/${appId}/premium`}>Go to premium</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const listenerCreateButton = (
    <EventListenerCreateDialog>
      <Button>Create event listener</Button>
    </EventListenerCreateDialog>
  );

  return (
    <AutoAnimate className="flex flex-col md:flex-1 space-y-5">
      {!listeners ? (
        <>
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </>
      ) : listeners.length === 0 ? (
        <AppEmptyPlaceholder
          title="There are no event listeners"
          description="You can start now by creating the first event listener!"
          action={listenerCreateButton}
        />
      ) : (
        <>
          {listeners.map((listener, i) => (
            <EventListenerListEntry listener={listener!} key={i} />
          ))}
          <div className="flex">{listenerCreateButton}</div>
        </>
      )}
    </AutoAnimate>
  );
}
