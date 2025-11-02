import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 pb-16">
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">System settings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage atelier preferences, authentication policies, and integration handshakes.
            </p>
          </div>
          <Button className="rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
            Save updates
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Configuration forms will appear here shortly. Expect controls for concierge escalation SLAs, brand tone
            presets, and wellness membership tiers.
          </p>
          <p>
            Reach out to your implementation partner if you need immediate adjustments prior to this module&apos;s
            release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
