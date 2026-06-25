import type { Attendee, Connection, SavedPerson } from "./types";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function sharedInterestCount(a: Attendee, b: Attendee): number {
  const aSet = new Set(a.interests.map(normalize));
  return b.interests.filter((interest) => aSet.has(normalize(interest))).length;
}

const CLUSTER_COLORS: Record<string, string> = {
  Students: "#7AA2FF",
  Founders: "#FFB86B",
  Recruiters: "#FF7AB6",
  Engineers: "#72E6AC",
  Designers: "#B892FF",
  Researchers: "#D6FF6B",
};

export function getClusterColor(cluster?: string): string {
  if (!cluster) return "#6F7280";
  return CLUSTER_COLORS[cluster] ?? "#A6A199";
}

export function getClusterCenters(
  clusters: string[],
  spread = 160
): Map<string, { x: number; y: number }> {
  const centers = new Map<string, { x: number; y: number }>();
  clusters.forEach((cluster, i) => {
    const angle = (i / clusters.length) * 2 * Math.PI - Math.PI / 2;
    centers.set(cluster, {
      x: Math.cos(angle) * spread,
      y: Math.sin(angle) * spread,
    });
  });
  return centers;
}

export function assignClusterPositions<T extends { cluster?: string }>(
  nodes: T[],
  spread = 160
): (T & { x: number; y: number })[] {
  const clusters = [...new Set(nodes.map((n) => n.cluster || "Other"))];
  const centers = getClusterCenters(clusters, spread);
  const perCluster = new Map<string, number>();

  return nodes.map((node) => {
    const cluster = node.cluster || "Other";
    const center = centers.get(cluster) ?? { x: 0, y: 0 };
    const count = perCluster.get(cluster) ?? 0;
    perCluster.set(cluster, count + 1);

    const ring = Math.floor(count / 8);
    const slot = count % 8;
    const angle = (slot / 8) * 2 * Math.PI;
    const radius = 28 + ring * 22;
    const jitter = () => (Math.random() - 0.5) * 12;

    return {
      ...node,
      x: center.x + Math.cos(angle) * radius + jitter(),
      y: center.y + Math.sin(angle) * radius + jitter(),
    };
  });
}

export function createClusterForce(
  centers: Map<string, { x: number; y: number }>,
  strength = 0.1
) {
  let nodes: Array<{
    cluster?: string;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
  }> = [];

  const force = function (alpha: number) {
    for (const node of nodes) {
      const center = centers.get(node.cluster || "Other");
      if (!center || node.x == null || node.y == null) continue;
      node.vx = (node.vx ?? 0) + (center.x - node.x) * strength * alpha;
      node.vy = (node.vy ?? 0) + (center.y - node.y) * strength * alpha;
    }
  } as ((alpha: number) => void) & {
    initialize?: (n: typeof nodes) => void;
  };

  force.initialize = (n) => {
    nodes = n;
  };

  return force;
}

export function buildGraphData(
  attendees: Attendee[],
  connections: Connection[],
  saved: SavedPerson[],
  currentAttendeeId?: string,
  searchResultId?: string
) {
  const metIds = new Set<string>();
  const savedIds = new Set<string>();

  if (currentAttendeeId) {
    connections
      .filter((c) => c.fromAttendeeId === currentAttendeeId)
      .forEach((c) => metIds.add(c.toAttendeeId));

    saved
      .filter((s) => s.fromAttendeeId === currentAttendeeId)
      .forEach((s) => savedIds.add(s.savedAttendeeId));
  }

  const degreeMap = new Map<string, number>();
  connections.forEach((c) => {
    degreeMap.set(c.fromAttendeeId, (degreeMap.get(c.fromAttendeeId) ?? 0) + 1);
    degreeMap.set(c.toAttendeeId, (degreeMap.get(c.toAttendeeId) ?? 0) + 1);
  });

  const nodes = attendees.map((attendee) => {
    const connectionCount = degreeMap.get(attendee.id) ?? 0;
    const isCurrentUser = attendee.id === currentAttendeeId;
    const isMet = metIds.has(attendee.id);
    const isSaved = savedIds.has(attendee.id);
    const isHighlyConnected = connectionCount >= 3;

    let val = 4;
    if (isCurrentUser) val = 10;
    else if (isHighlyConnected) val = 6;
    else if (isMet) val = 5;

    let color = getClusterColor(attendee.cluster);
    if (!isCurrentUser && !isMet && !isSaved) {
      color = `${color}99`;
    }

    return {
      id: attendee.id,
      name: attendee.name,
      role: attendee.role,
      company: attendee.company,
      cluster: attendee.cluster,
      avatarUrl: attendee.avatarUrl,
      val,
      color,
      isCurrentUser,
      isMet,
      isSaved,
      isSearchResult: attendee.id === searchResultId,
      connectionCount,
    };
  });

  const similarityLinks: { source: string; target: string; type: "similarity"; strength: number }[] = [];
  const minShared = attendees.length > 15 ? 2 : 1;
  const maxLinksPerNode = 4;

  for (let i = 0; i < attendees.length; i++) {
    let linkCount = 0;
    for (let j = i + 1; j < attendees.length && linkCount < maxLinksPerNode; j++) {
      if (sharedInterestCount(attendees[i], attendees[j]) >= minShared) {
        similarityLinks.push({
          source: attendees[i].id,
          target: attendees[j].id,
          type: "similarity",
          strength: 1,
        });
        linkCount++;
      }
    }
  }

  const metLinks = connections
    .filter((c) => !currentAttendeeId || c.fromAttendeeId === currentAttendeeId)
    .map((c) => ({
      source: c.fromAttendeeId,
      target: c.toAttendeeId,
      type: "met" as const,
      strength: 3,
    }));

  const savedLinks = saved
    .filter((s) => !currentAttendeeId || s.fromAttendeeId === currentAttendeeId)
    .map((s) => ({
      source: s.fromAttendeeId,
      target: s.savedAttendeeId,
      type: "saved" as const,
      strength: 2,
    }));

  const metPairs = new Set(metLinks.map((l) => `${l.source}-${l.target}`));
  const filteredSimilarity = similarityLinks.filter(
    (l) => !metPairs.has(`${l.source}-${l.target}`) && !metPairs.has(`${l.target}-${l.source}`)
  );

  const links = [...filteredSimilarity, ...savedLinks, ...metLinks];

  return {
    nodes: assignClusterPositions(nodes, attendees.length > 12 ? 180 : 140),
    links,
  };
}

export function buildPersonalGraphData(
  attendees: Attendee[],
  connections: Connection[],
  currentAttendeeId: string
) {
  const myConnections = connections.filter(
    (c) => c.fromAttendeeId === currentAttendeeId || c.toAttendeeId === currentAttendeeId
  );

  const connectedIds = new Set<string>([currentAttendeeId]);
  myConnections.forEach((c) => {
    connectedIds.add(c.fromAttendeeId);
    connectedIds.add(c.toAttendeeId);
  });

  const filteredAttendees = attendees.filter((a) => connectedIds.has(a.id));

  return buildGraphData(filteredAttendees, myConnections, [], currentAttendeeId);
}

export function buildAggregateGraphData(
  attendees: Attendee[],
  connections: Connection[]
) {
  return buildGraphData(attendees, connections, []);
}
