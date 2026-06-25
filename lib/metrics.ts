import type { Attendee, Connection, RoomMetrics } from "./types";

export function computeMetrics(
  attendees: Attendee[],
  connections: Connection[]
): RoomMetrics {
  const attendeeCount = attendees.length;
  const conversationCount = connections.length;

  const activeIds = new Set<string>();
  connections.forEach((connection) => {
    activeIds.add(connection.fromAttendeeId);
    activeIds.add(connection.toAttendeeId);
  });

  const activeAttendeePercentage =
    attendeeCount === 0 ? 0 : activeIds.size / attendeeCount;

  const averageConnectionsPerActiveAttendee =
    activeIds.size === 0 ? 0 : connections.length / activeIds.size;

  const followUpIntentCount = connections.filter((c) => c.followUp).length;

  const attendeeMap = new Map(attendees.map((a) => [a.id, a]));

  const clusterPairCounts = new Map<string, number>();
  connections.forEach((connection) => {
    const from = attendeeMap.get(connection.fromAttendeeId);
    const to = attendeeMap.get(connection.toAttendeeId);
    if (!from?.cluster || !to?.cluster) return;

    const pair =
      from.cluster < to.cluster
        ? `${from.cluster}|${to.cluster}`
        : `${to.cluster}|${from.cluster}`;

    clusterPairCounts.set(pair, (clusterPairCounts.get(pair) ?? 0) + 1);
  });

  let strongestBridge: RoomMetrics["strongestBridge"] = null;
  let maxBridgeCount = 0;
  clusterPairCounts.forEach((count, pair) => {
    if (count > maxBridgeCount) {
      maxBridgeCount = count;
      const [from, to] = pair.split("|");
      strongestBridge = { from, to, count };
    }
  });

  const clusterActivity = new Map<string, number>();
  connections.forEach((connection) => {
    const from = attendeeMap.get(connection.fromAttendeeId);
    const to = attendeeMap.get(connection.toAttendeeId);
    if (from?.cluster) {
      clusterActivity.set(from.cluster, (clusterActivity.get(from.cluster) ?? 0) + 1);
    }
    if (to?.cluster) {
      clusterActivity.set(to.cluster, (clusterActivity.get(to.cluster) ?? 0) + 1);
    }
  });

  let mostActiveCluster: RoomMetrics["mostActiveCluster"] = null;
  let maxClusterCount = 0;
  clusterActivity.forEach((count, name) => {
    if (count > maxClusterCount) {
      maxClusterCount = count;
      mostActiveCluster = { name, count };
    }
  });

  const tagCounts = new Map<string, number>();
  connections.forEach((connection) => {
    connection.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  });

  let highestFollowUpTag: RoomMetrics["highestFollowUpTag"] = null;
  let maxTagCount = 0;
  tagCounts.forEach((count, tag) => {
    if (count > maxTagCount) {
      maxTagCount = count;
      highestFollowUpTag = { tag, count };
    }
  });

  return {
    attendeeCount,
    conversationCount,
    activeAttendeePercentage,
    averageConnectionsPerActiveAttendee,
    followUpIntentCount,
    strongestBridge,
    mostActiveCluster,
    highestFollowUpTag,
    clusterActivity: [],
    tagDistribution: [],
    conversationsOverTime: [],
    topBridges: [],
  };
}
