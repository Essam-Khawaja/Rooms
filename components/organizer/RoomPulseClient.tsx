"use client";

import { useRoomData } from "@/lib/hooks/use-room-data";
import { useRoomMetrics } from "@/lib/hooks/use-room-metrics";
import { RoomGraph } from "@/components/room/RoomGraph";
import { RoomHeader } from "@/components/room/RoomHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#D6FF6B", "#7AA2FF", "#FF7AB6", "#72E6AC", "#FFB86B", "#B892FF"];

interface RoomPulseClientProps {
  slug: string;
}

export function RoomPulseClient({ slug }: RoomPulseClientProps) {
  const { data, isLoading: roomLoading } = useRoomData(slug);
  const { data: metrics, isLoading: metricsLoading } = useRoomMetrics(slug);

  if (roomLoading || metricsLoading || !data || !metrics) {
    return (
      <div className="flex h-dvh items-center justify-center text-text-muted">
        Loading pulse...
      </div>
    );
  }

  const activePercent = Math.round(metrics.activeAttendeePercentage * 100);
  const radialData = [{ name: "Active", value: activePercent, fill: "#D6FF6B" }];

  const clusterData = metrics.clusterActivity?.length
    ? metrics.clusterActivity
    : [{ name: "No data", count: 0 }];

  const tagData = metrics.tagDistribution?.length
    ? metrics.tagDistribution
    : [{ tag: "None", count: 0 }];

  const timeData = (metrics.conversationsOverTime ?? []).map((d) => ({
    label: new Date(d.hour).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    count: d.count,
  }));

  const bridgeData = metrics.topBridges?.length
    ? metrics.topBridges.map((b) => ({
        name: `${b.from} ↔ ${b.to}`,
        count: b.count,
      }))
    : [];

  return (
    <div className="min-h-dvh bg-background pb-8">
      <RoomHeader slug={slug} title="Room Pulse" backHref="/dashboard" />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-2">
        <div className="flex justify-end">
          <Link href={`/r/${slug}/map`}>
            <Button variant="secondary" size="sm">
              View live map
            </Button>
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface-soft p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,255,107,0.08),transparent_60%)]" />
          <p className="relative text-5xl font-bold tabular-nums text-accent">
            {metrics.conversationCount}
          </p>
          <h2 className="relative mt-2 text-xl font-semibold text-text-main">
            conversations happened in this room
          </h2>
          <p className="relative mt-2 text-sm text-text-muted">
            {metrics.attendeeCount} attendees · {metrics.followUpIntentCount} follow-up intents
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChartCard title="Active attendees" subtitle="% who made a connection">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                barSize={14}
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar background={{ fill: "#2A3040" }} dataKey="value" cornerRadius={8} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-text-main text-2xl font-bold"
                >
                  {activePercent}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Avg connections"
            subtitle="Per active attendee"
          >
            <div className="flex h-[180px] flex-col items-center justify-center">
              <p className="text-5xl font-bold text-accent">
                {metrics.averageConnectionsPerActiveAttendee.toFixed(1)}
              </p>
              <p className="mt-2 text-sm text-text-muted">connections per person</p>
            </div>
          </ChartCard>
        </div>

        <ChartCard title="Connections by group" subtitle="Cluster activity">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clusterData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#A6A199", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6F7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#11141C",
                  border: "1px solid #2A3040",
                  borderRadius: 12,
                  color: "#F4EFE7",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {clusterData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {timeData.length > 0 && (
          <ChartCard title="Conversations over time" subtitle="Hourly activity">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D6FF6B" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#D6FF6B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: "#A6A199", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6F7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#11141C",
                    border: "1px solid #2A3040",
                    borderRadius: 12,
                    color: "#F4EFE7",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#D6FF6B"
                  fill="url(#pulseGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ChartCard title="Follow-up tags" subtitle="Intent breakdown">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={tagData}
                  dataKey="count"
                  nameKey="tag"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {tagData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#11141C",
                    border: "1px solid #2A3040",
                    borderRadius: 12,
                    color: "#F4EFE7",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {bridgeData.length > 0 && (
            <ChartCard title="Top bridges" subtitle="Cross-group connections">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  layout="vertical"
                  data={bridgeData}
                  margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fill: "#A6A199", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="count" fill="#7AA2FF" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>

        {(metrics.strongestBridge || metrics.mostActiveCluster) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.strongestBridge && (
              <InsightCard
                label="Strongest bridge"
                value={`${metrics.strongestBridge.from} ↔ ${metrics.strongestBridge.to}`}
                hint={`${metrics.strongestBridge.count} connections`}
              />
            )}
            {metrics.mostActiveCluster && (
              <InsightCard
                label="Most active group"
                value={metrics.mostActiveCluster.name}
                hint={`${metrics.mostActiveCluster.count} events`}
              />
            )}
          </div>
        )}

        <section>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-faint">
            Room connection map
          </h3>
          <Card className="h-[280px] overflow-hidden p-0 lg:h-[420px]">
            <RoomGraph
              attendees={data.attendees}
              connections={data.connections}
              saved={[]}
              interactive={false}
            />
          </Card>
          <p className="mt-2 text-center text-xs text-text-faint">
            Aggregate view — private notes are not shown
          </p>
        </section>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="soft" className="p-4">
      <p className="text-sm font-medium text-text-main">{title}</p>
      {subtitle && <p className="text-xs text-text-faint mb-2">{subtitle}</p>}
      {children}
    </Card>
  );
}

function InsightCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card variant="glass" className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-faint">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-main">{value}</p>
      <p className="text-sm text-text-muted">{hint}</p>
    </Card>
  );
}
