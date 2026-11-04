import { getTemplates, Template, TemplateTier } from "@/lib/flow/templates";
import {
  useAppEntitlements,
  useAppFeature,
} from "@/lib/hooks/api";
import { useMemo } from "react";
import { TemplateListEntry } from "./TemplateListEntry";

export function TemplateList() {
  const aiUnlocked = useAppFeature((features) => features.ai);
  const eventListenerLimit = useAppFeature(
    (features) => features.max_event_listeners_per_app
  );
  const entitlements = useAppEntitlements();

  const unlockedTiers = useMemo(() => {
    const planIDs = new Set(
      (entitlements ?? [])
        .map((entitlement) => entitlement?.plan_id)
        .filter(Boolean)
    );
    const investor = planIDs.has("investor");
    return {
      premium: investor || planIDs.has("premium"),
      investor,
    };
  }, [entitlements]);

  const templates = useMemo(() => {
    const all = getTemplates();

    const starter = all.filter((t) => {
      if (t.tier) return false;
      if (aiUnlocked === false && t.requiresAI) return false;
      // Templates made only of event listeners need event listeners on the plan.
      if (eventListenerLimit === 0 && t.commands.length === 0) return false;
      return true;
    });

    return {
      starter,
      premium: all.filter((t) => t.tier === "premium"),
      investor: all.filter((t) => t.tier === "investor"),
    };
  }, [aiUnlocked, eventListenerLimit]);

  return (
    <div className="space-y-12">
      <TemplateSection
        title="Starter templates"
        description="Free templates to get your app going."
        templates={templates.starter}
      />
      <TemplateSection
        title="Premium templates"
        description="Included with a Premium purchase code: sticky messages, modmail, auto mod, tickets, Roblox lookup, AI chat and more."
        templates={templates.premium}
        tier="premium"
        locked={!unlockedTiers.premium}
      />
      <TemplateSection
        title="Investor templates"
        description="Everything in Premium, plus advanced tickets, staff applications, suggestions and more."
        templates={templates.investor}
        tier="investor"
        locked={!unlockedTiers.investor}
      />
    </div>
  );
}

function TemplateSection({
  title,
  description,
  templates,
  tier,
  locked,
}: {
  title: string;
  description: string;
  templates: Template[];
  tier?: TemplateTier;
  locked?: boolean;
}) {
  if (templates.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-base font-semibold md:text-lg">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {templates.map((template, i) => (
          <TemplateListEntry
            key={i}
            template={template}
            tier={tier}
            locked={locked}
          />
        ))}
      </div>
    </section>
  );
}
