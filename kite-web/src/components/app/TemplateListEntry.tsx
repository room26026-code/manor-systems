import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Template, TemplateTier } from "@/lib/flow/templates";
import { useAppId } from "@/lib/hooks/params";
import { LockIcon } from "lucide-react";
import Link from "next/link";
import { TemplateImportDialog } from "./TemplateImportDialog";

const tierLabels: Record<TemplateTier, string> = {
  premium: "Premium",
  investor: "Investor",
};

export function TemplateListEntry({
  template,
  tier,
  locked,
}: {
  template: Template;
  tier?: TemplateTier;
  locked?: boolean;
}) {
  const appId = useAppId();

  return (
    <Card className={locked ? "bg-muted/30" : undefined}>
      <CardHeader className="flex flex-row gap-4 p-4">
        <div className="h-10 w-10 bg-primary/40 flex-none rounded-md flex items-center justify-center">
          <template.icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <CardTitle className="mb-2 flex items-center gap-2">
            {template.name}
            {tier ? (
              <Badge variant="secondary" className="text-xs">
                {locked ? <LockIcon className="w-3 h-3 mr-1" /> : null}
                {tierLabels[tier]}
              </Badge>
            ) : null}
          </CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-1 flex justify-end">
        {locked && tier ? (
          <Button variant="outline" asChild>
            <Link href={`/apps/${appId}/premium`}>
              <LockIcon className="w-4 h-4 mr-2" />
              Unlock {tierLabels[tier]}
            </Link>
          </Button>
        ) : (
          <TemplateImportDialog template={template}>
            <Button variant="outline">View details</Button>
          </TemplateImportDialog>
        )}
      </CardFooter>
    </Card>
  );
}
