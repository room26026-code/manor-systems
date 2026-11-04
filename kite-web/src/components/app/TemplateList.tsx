import { getTemplates } from "@/lib/flow/templates";
import { useAppFeature } from "@/lib/hooks/api";
import { useMemo } from "react";
import { TemplateListEntry } from "./TemplateListEntry";

export function TemplateList() {
  const aiUnlocked = useAppFeature((features) => features.ai);
  const eventListenerLimit = useAppFeature(
    (features) => features.max_event_listeners_per_app
  );

  const templates = useMemo(
    () =>
      getTemplates().filter((t) => {
        if (aiUnlocked === false && t.requiresAI) return false;
        // Templates made only of event listeners need event listeners on the plan.
        if (eventListenerLimit === 0 && t.commands.length === 0) return false;
        return true;
      }),
    [aiUnlocked, eventListenerLimit]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {templates.map((template, i) => (
        <TemplateListEntry key={i} template={template} />
      ))}
    </div>
  );
}
