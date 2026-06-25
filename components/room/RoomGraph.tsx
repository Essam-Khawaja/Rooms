"use client";

import { buildGraphData, createClusterForce, getClusterCenters, getClusterColor } from "@/lib/graph";
import type { Attendee, Connection, GraphNode, SavedPerson } from "@/lib/types";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods } from "react-force-graph-2d";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const imageCache = new Map<string, HTMLImageElement | null>();

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function loadAvatar(url: string): HTMLImageElement | null {
  if (imageCache.has(url)) return imageCache.get(url) ?? null;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  img.onload = () => imageCache.set(url, img);
  img.onerror = () => imageCache.set(url, null);
  imageCache.set(url, null);
  return null;
}

interface RoomGraphProps {
  attendees: Attendee[];
  connections: Connection[];
  saved: SavedPerson[];
  currentAttendeeId?: string;
  searchResultId?: string;
  onNodeClick?: (nodeId: string) => void;
  height?: number;
  interactive?: boolean;
  className?: string;
}

export function RoomGraph({
  attendees,
  connections,
  saved,
  currentAttendeeId,
  searchResultId,
  onNodeClick,
  height,
  interactive = true,
  className,
}: RoomGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [, setTick] = useState(0);

  useEffect(() => {
    attendees.forEach((a) => {
      if (a.avatarUrl) loadAvatar(a.avatarUrl);
    });
    const interval = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(interval);
  }, [attendees]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setDimensions({ width: el.clientWidth, height: height ?? el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [height]);

  const graphData = useMemo(
    () =>
      buildGraphData(attendees, connections, saved, currentAttendeeId, searchResultId),
    [attendees, connections, saved, currentAttendeeId, searchResultId]
  );

  const clusterCenters = useMemo(() => {
    const clusters = [
      ...new Set(graphData.nodes.map((n) => n.cluster || "Other")),
    ];
    return getClusterCenters(clusters, attendees.length > 12 ? 180 : 140);
  }, [graphData.nodes, attendees.length]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    graph.d3Force("charge")?.strength(-140);
    graph.d3Force("cluster", createClusterForce(clusterCenters, 0.12));
    graph.d3ReheatSimulation();
  }, [graphData, clusterCenters]);

  const graphDataRef = useRef(graphData);
  useEffect(() => {
    graphDataRef.current = graphData;
  }, [graphData]);

  const paintClusterLabels = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number) => {
      const liveNodes = graphDataRef.current.nodes as (GraphNode & {
        x?: number;
        y?: number;
      })[];
      if (!liveNodes.length) return;

      const groups = new Map<
        string,
        { xs: number[]; ys: number[]; color: string }
      >();

      liveNodes.forEach((node) => {
        if (node.x == null || node.y == null) return;
        const cluster = node.cluster || "Other";
        const existing = groups.get(cluster);
        const color = getClusterColor(cluster);
        if (existing) {
          existing.xs.push(node.x);
          existing.ys.push(node.y);
        } else {
          groups.set(cluster, { xs: [node.x], ys: [node.y], color });
        }
      });

      groups.forEach((group, clusterName) => {
        const cx =
          group.xs.reduce((sum, x) => sum + x, 0) / group.xs.length;
        const minY = Math.min(...group.ys);
        const maxRadius = Math.sqrt(
          Math.max(...graphData.nodes.map((n) => n.val))
        ) * 3.5;
        const labelY = minY - maxRadius - 18 / globalScale;

        const fontSize = Math.max(11 / globalScale, 5);
        ctx.font = `600 ${fontSize}px Geist, sans-serif`;
        const text = clusterName.toUpperCase();
        const textWidth = ctx.measureText(text).width;
        const padX = 10 / globalScale;
        const padY = 5 / globalScale;
        const boxW = textWidth + padX * 2;
        const boxH = fontSize + padY * 2;
        const boxX = cx - boxW / 2;
        const boxY = labelY - boxH / 2;
        const radius = 6 / globalScale;

        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, radius);
        ctx.fillStyle = "rgba(8, 10, 15, 0.82)";
        ctx.fill();
        ctx.strokeStyle = `${group.color}66`;
        ctx.lineWidth = 1 / globalScale;
        ctx.stroke();

        ctx.fillStyle = group.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, cx, labelY);
      });
    },
    [graphData.nodes]
  );

  const focusNode = useCallback(
    (nodeId: string) => {
      const node = graphData.nodes.find((n) => n.id === nodeId) as GraphNode & {
        x?: number;
        y?: number;
      };
      if (node?.x !== undefined && node?.y !== undefined && graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 400);
        graphRef.current.zoom(2.5, 400);
      }
    },
    [graphData.nodes]
  );

  useEffect(() => {
    if (searchResultId) {
      const timer = setTimeout(() => focusNode(searchResultId), 300);
      return () => clearTimeout(timer);
    }
  }, [searchResultId, focusNode]);

  const paintNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GraphNode & { x: number; y: number };
      const radius = Math.sqrt(n.val) * 3.5;

      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);

      if (n.isCurrentUser) {
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.strokeStyle = "#D6FF6B";
        ctx.lineWidth = 2.5 / globalScale;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 4 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(214, 255, 107, 0.4)";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      } else if (n.isMet) {
        ctx.fillStyle = n.color.replace("99", "") || n.color;
        ctx.fill();
      } else if (n.isSaved) {
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.setLineDash([3 / globalScale, 3 / globalScale]);
        ctx.strokeStyle = "#D6FF6B";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = n.color;
        ctx.fill();
      }

      if (n.isSearchResult) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 6 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(214, 255, 107, 0.8)";
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      const avatarImg = n.avatarUrl ? imageCache.get(n.avatarUrl) : null;
      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius - 1 / globalScale, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(
          avatarImg,
          n.x - radius,
          n.y - radius,
          radius * 2,
          radius * 2
        );
        ctx.restore();
      } else {
        const initials = getInitials(n.name);
        const fontSize = Math.max(radius * 0.9, 4);
        ctx.font = `600 ${fontSize}px Geist, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(244, 239, 231, 0.85)";
        ctx.fillText(initials, n.x, n.y);
      }

      const showLabel =
        n.isCurrentUser || n.isSearchResult || n.isMet || globalScale > 1.8;
      if (showLabel && globalScale > 0.5) {
        const fontSize = Math.max(10 / globalScale, 3);
        ctx.font = `${fontSize}px Geist, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(244, 239, 231, 0.9)";
        ctx.fillText(n.name.split(" ")[0], n.x, n.y + radius + 2 / globalScale);
      }
    },
    []
  );

  const paintLink = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const source = link.source;
      const target = link.target;
      if (!source?.x || !target?.x) return;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      if (link.type === "met") {
        ctx.strokeStyle = "rgba(214, 255, 107, 0.85)";
        ctx.lineWidth = 2 / globalScale;
      } else if (link.type === "saved") {
        ctx.strokeStyle = "rgba(214, 255, 107, 0.4)";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.setLineDash([4 / globalScale, 4 / globalScale]);
      } else {
        ctx.strokeStyle = "rgba(111, 114, 128, 0.25)";
        ctx.lineWidth = 0.8 / globalScale;
      }
      ctx.stroke();
      ctx.setLineDash([]);
    },
    []
  );

  if (attendees.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        No attendees in this room yet.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: height ?? "100%", width: "100%" }}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        onRenderFramePost={paintClusterLabels}
        nodePointerAreaPaint={(node, color, ctx) => {
          const n = node as GraphNode & { x: number; y: number };
          const radius = Math.sqrt(n.val) * 3.5 + 4;
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={(node) => {
          if (interactive && onNodeClick) {
            onNodeClick((node as GraphNode).id);
            focusNode((node as GraphNode).id);
          }
        }}
        enableNodeDrag={interactive}
        enableZoomInteraction={interactive}
        enablePanInteraction={interactive}
        cooldownTicks={80}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
}
