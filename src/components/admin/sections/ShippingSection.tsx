"use client";

import { useMemo, useState } from "react";
import { Warehouse, Settings2, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getShippingData, type DeliveryFeedEntry, type ShippingMethod } from "@/services/admin.service";

const statusTone: Record<DeliveryFeedEntry["status"], string> = {
  "Out for Delivery": "bg-sky-100 text-sky-700 border-sky-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Delayed: "bg-rose-100 text-rose-700 border-rose-200",
  Preparing: "bg-amber-100 text-amber-700 border-amber-200",
};

function ShippingMethodRow({
  method,
  onToggle,
}: {
  method: ShippingMethod;
  onToggle: (id: string, active: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/75 p-4 shadow-inner shadow-primary/10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">{method.name}</p>
        <p className="text-xs text-muted-foreground">
          {method.serviceLevel} • Avg {method.averageDeliveryDays} day delivery
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Badge className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          {method.serviceLevel}
        </Badge>
        <Switch checked={method.active} onCheckedChange={(checked) => onToggle(method.id, checked)} />
      </div>
    </div>
  );
}

function DeliveryFeedItem({ entry }: { entry: DeliveryFeedEntry }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/75 p-4 shadow-sm shadow-primary/10">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{new Date(entry.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
        <Badge className={cn("rounded-full border text-[10px] font-semibold uppercase tracking-widest", statusTone[entry.status])}>
          {entry.status}
        </Badge>
      </div>
      <p className="text-sm font-semibold text-foreground">{entry.orderId}</p>
      <p className="text-sm text-muted-foreground">{entry.summary}</p>
    </div>
  );
}

export function ShippingSection() {
  const { methods: initialMethods, deliveryFeed } = useMemo(() => getShippingData(), []);
  const [methods, setMethods] = useState(initialMethods);

  const handleToggle = (id: string, active: boolean) => {
    setMethods((prev) =>
      prev.map((method) => (method.id === id ? { ...method, active } : method)),
    );
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Shipping methods</CardTitle>
          <p className="text-sm text-muted-foreground">
            Align experiential delivery windows with fulfillment partners.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {methods.map((method) => (
            <ShippingMethodRow key={method.id} method={method} onToggle={handleToggle} />
          ))}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10"
            >
              <Settings2 className="size-4" />
              Adjust rates
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10"
            >
              <Warehouse className="size-4" />
              Assign warehouses
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-primary/20 bg-white/70 px-5 text-sm font-medium text-primary hover:bg-primary/10"
            >
              <Link2 className="size-4" />
              Connect carrier portal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Delivery feed</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time movement of wellness suites from atelier to sanctuary.
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[360px] pr-3">
            <div className="space-y-3">
              {deliveryFeed.map((entry) => (
                <DeliveryFeedItem key={entry.id} entry={entry} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
}
