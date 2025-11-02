"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getSalesOverview, type SalesMetric, type TrendDirection } from "@/services/admin.service";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const trendStyles: Record<
  TrendDirection,
  {
    icon: typeof ArrowUpRight;
    badgeClassName: string;
    toneClassName: string;
  }
> = {
  up: {
    icon: ArrowUpRight,
    badgeClassName: "bg-emerald-100 text-emerald-700 border-emerald-200",
    toneClassName: "text-emerald-600",
  },
  down: {
    icon: ArrowDownRight,
    badgeClassName: "bg-rose-100 text-rose-700 border-rose-200",
    toneClassName: "text-rose-600",
  },
  steady: {
    icon: Minus,
    badgeClassName: "bg-slate-100 text-slate-600 border-slate-200",
    toneClassName: "text-slate-500",
  },
};

function buildSparkline(metric: SalesMetric) {
  return metric.sparkline.map((value, index) => ({
    label: index + 1,
    value,
  }));
}

export function SalesOverviewSection() {
  const { metrics, revenueSeries } = useMemo(() => getSalesOverview(), []);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {metrics.map((metric) => {
          const trend = trendStyles[metric.trend];
          const SparkIcon = trend.icon;
          const sparklineData = buildSparkline(metric);

          return (
            <Card
              key={metric.id}
              className="overflow-hidden rounded-3xl border-none bg-white/70 shadow-lg shadow-primary/10 backdrop-blur"
            >
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    {metric.label}
                  </CardTitle>
                  <Badge className={cn("gap-1.5 text-[10px]", trend.badgeClassName)}>
                    <SparkIcon className="size-3" />
                    {percent.format(metric.change / 100)}
                  </Badge>
                </div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {currency.format(metric.value)}
                </p>
              </CardHeader>
              <CardContent className="pb-6 pl-6 pr-2">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`metric-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" stroke="rgba(148, 163, 184, 0.25)" />
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ stroke: "rgba(30, 58, 138, 0.35)", strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) {
                        return null;
                      }
                      const [{ value }] = payload;
                      return (
                        <div className="rounded-xl bg-white/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg shadow-primary/10 backdrop-blur">
                          {currency.format(Number(value))}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill={`url(#metric-${metric.id})`}
                  />
                </AreaChart>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-3xl border-none bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Revenue vs Orders</CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily pace for restorative sleep systems and wellness companions.
            </p>
          </div>
          <Badge className="rounded-full bg-primary/10 text-primary shadow-sm">Last 7 days</Badge>
        </CardHeader>
        <CardContent className="h-[360px] space-y-6">
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--primary))",
              },
              orders: {
                label: "Orders",
                color: "hsl(var(--accent))",
              },
            }}
          >
            <LineChart data={revenueSeries}>
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
                tickFormatter={(value) => currency.format(Number(value)).replace("$", "$ ")}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelClassName="text-sm font-semibold text-foreground"
                    formatter={(value, name) => [
                      name === "orders" ? `${value} orders` : currency.format(Number(value)),
                      name === "orders" ? "Orders" : "Revenue",
                    ]}
                  />
                }
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "var(--color-revenue)" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="var(--color-orders)"
                strokeDasharray="6 4"
                strokeWidth={2.4}
                dot={{ r: 3 }}
                activeDot={{ r: 5, fill: "var(--color-orders)" }}
              />
              <ChartLegend content={<ChartLegendContent className="pt-2 text-sm" />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
