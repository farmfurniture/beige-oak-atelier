"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getCustomerInsights,
  type CustomerRetentionMetric,
  type CustomerSegment,
  type SupportTicket,
  type TrendDirection,
} from "@/services/admin.service";
import { cn } from "@/lib/utils";

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const trendStyles: Record<
  TrendDirection,
  {
    icon: typeof ArrowUpRight;
    tone: string;
    badgeTone: string;
  }
> = {
  up: {
    icon: ArrowUpRight,
    tone: "text-emerald-600",
    badgeTone: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  down: {
    icon: ArrowDownRight,
    tone: "text-rose-600",
    badgeTone: "bg-rose-100 text-rose-700 border-rose-200",
  },
  steady: {
    icon: Minus,
    tone: "text-slate-500",
    badgeTone: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

function RetentionMetricCard({ metric }: { metric: CustomerRetentionMetric }) {
  const trend = trendStyles[metric.trend];
  const TrendIcon = trend.icon;

  return (
    <Card className="rounded-3xl border-none bg-white/80 shadow-lg shadow-primary/10 backdrop-blur">
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">{metric.label}</p>
          <Badge className={cn("gap-1.5 text-[10px] font-semibold", trend.badgeTone)}>
            <TrendIcon className="size-3" />
            {metric.change.toFixed(1)}%
          </Badge>
        </div>
        <p className="text-4xl font-semibold text-foreground">{percent.format(metric.value / 100)}</p>
      </CardContent>
    </Card>
  );
}

function SegmentTile({ segment }: { segment: CustomerSegment }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-inner shadow-primary/10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">{segment.title}</p>
        <p className="text-sm text-muted-foreground">{segment.narrative}</p>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold text-foreground">{segment.customers}</p>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Members</p>
        </div>
        <Badge className="rounded-full border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
          {segment.revenueShare}% revenue
        </Badge>
      </div>
    </div>
  );
}

function SupportTicketItem({ ticket }: { ticket: SupportTicket }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm shadow-primary/10">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <MessageCircle className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{ticket.customer}</p>
          <Badge
            className={cn(
              "rounded-full border text-[10px] font-semibold uppercase tracking-widest",
              ticket.priority === "Urgent"
                ? "border-rose-200 bg-rose-100 text-rose-700"
                : ticket.priority === "High"
                  ? "border-amber-200 bg-amber-100 text-amber-700"
                  : ticket.priority === "Medium"
                    ? "border-sky-200 bg-sky-100 text-sky-700"
                    : "border-slate-200 bg-slate-100 text-slate-600",
            )}
          >
            {ticket.priority}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{ticket.topic}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground/80">
          <span>{ticket.status}</span>
          <span>
            {new Date(ticket.submittedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CustomersSection() {
  const { retention, segments, supportQueue, tickets } = useMemo(() => getCustomerInsights(), []);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {retention.map((metric) => (
          <RetentionMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Segmentation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Discover the energy of each audience cohort across the Beige Oak sanctuary.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {segments.map((segment) => (
                <SegmentTile key={segment.id} segment={segment} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Support queue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dedicated sleep guides resolving premium concierge requests.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {supportQueue.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-inner shadow-primary/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">
                      SLA {entry.slaMinutes}
                      m
                    </p>
                  </div>
                  <Badge className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {entry.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Support tickets</CardTitle>
              <p className="text-sm text-muted-foreground">
                Active dialogues from wellness suites and design ateliers.
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px] pr-4">
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <SupportTicketItem key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
