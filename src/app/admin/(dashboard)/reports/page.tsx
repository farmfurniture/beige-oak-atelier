import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminReportsPage() {
  return (
    <div className="space-y-8 pb-16">
      <Card className="rounded-3xl border-dashed border-primary/30 bg-white/80 shadow-xl shadow-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Reports</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tailored analytics packages for seasonal releases and atelier partnerships will arrive shortly.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Our team is finalizing narrative-driven report templates blending showroom metrics with customer sentiment.
            Expect downloadable scorecards and interactive storyboards soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
