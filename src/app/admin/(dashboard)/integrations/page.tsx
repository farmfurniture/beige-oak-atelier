import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminIntegrationsPage() {
  return (
    <div className="space-y-8 pb-16">
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-semibold">Integrations</CardTitle>
            <Badge className="rounded-full bg-primary/10 text-primary">Coming soon</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect CRM, wellness concierge, shipping carriers, and atelier IoT experiences in one view.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The integrations hub is being composed to orchestrate marketing automation, loyalty signals, and craft
            supply networks.
          </p>
          <p>
            Drop a note to your Beige Oak implementation strategist to prioritize your connectors ahead of launch.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
