"use client";

import { useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getAnalyticsInsights, type ConversionMetric, type TrendDirection } from "@/services/admin.service";
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
    badge: string;
  }
> = {
  up: {
    icon: ArrowUpRight,
    tone: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  down: {
    icon: ArrowDownRight,
    tone: "text-rose-600",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
  },
  steady: {
    icon: Minus,
    tone: "text-slate-500",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

function ConversionTile({ metric }: { metric: ConversionMetric }) {
  const trend = trendStyles[metric.trend];
  const TrendIcon = trend.icon;

  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-white/40 bg-white/75 p-4 shadow-inner shadow-primary/10">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">{metric.label}</p>
        <Badge className={cn("gap-1.5 text-[10px] font-semibold", trend.badge)}>
          <TrendIcon className="size-3" />
          {metric.change.toFixed(1)}%
        </Badge>
      </div>
      <p className="text-3xl font-semibold text-foreground">{percent.format(metric.value / 100)}</p>
    </div>
  );
}

export function AnalyticsSection() {
  const { trafficSeries, conversionMetrics } = useMemo(() => getAnalyticsInsights(), []);

  return (
    <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Traffic vs Conversions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Observing serenity seekers moving from inspiration to purchase.
            </p>
          </div>
          <Badge className="rounded-full bg-primary/10 text-primary shadow-sm">Past 7 days</Badge>
        </CardHeader>
        <CardContent className="h-[360px]">
          <ChartContainer
            config={{
              visitors: { label: "Visitors", color: "hsl(var(--primary))" },
              conversions: { label: "Conversions", color: "hsl(var(--accent))" },
            }}
          >
            <LineChart data={trafficSeries}>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(148,163,184,0.25)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelClassName="text-sm font-semibold text-foreground"
                    formatter={(value, name) => [
                      name === "conversions"
                        ? `${value?.toLocaleString()} conversions`
                        : `${value?.toLocaleString()} visitors`,
                      name === "conversions" ? "Conversions" : "Visitors",
                    ]}
                  />
                }
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="visitors"
                stroke="var(--color-visitors)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "var(--color-visitors)" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="conversions"
                stroke="var(--color-conversions)"
                strokeDasharray="6 4"
                strokeWidth={2.4}
                dot={{ r: 3 }}
                activeDot={{ r: 5, fill: "var(--color-conversions)" }}
              />
              <ChartLegend content={<ChartLegendContent className="pt-4 text-sm" />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Conversion momentum</CardTitle>
          <p className="text-sm text-muted-foreground">
            Rituals from curiosity to comfort across the Beige Oak universe.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversionMetrics.map((metric) => (
            <ConversionTile key={metric.id} metric={metric} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
