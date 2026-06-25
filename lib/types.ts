export type RoomStatus = "draft" | "live" | "ended";

export type AccountType = "organizer" | "attendee";

export type Profile = {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
  company?: string;
  interests: string[];
  lookingFor?: string;
  canHelpWith?: string;
  accountType: AccountType;
  createdAt: string;
  updatedAt: string;
};

export type Room = {
  id: string;
  slug: string;
  name: string;
  organizerName?: string;
  organizerId?: string;
  description?: string;
  createdAt: string;
  status: RoomStatus;
  isPublic: boolean;
};

export type Attendee = {
  id: string;
  roomId: string;
  profileId?: string;
  username?: string;
  claimedBy?: string;
  sessionToken?: string;
  name: string;
  email?: string;
  role?: string;
  company?: string;
  interests: string[];
  lookingFor?: string;
  canHelpWith?: string;
  cluster?: string;
  avatarUrl?: string;
  createdAt: string;
  isGuest?: boolean;
};

export type Connection = {
  id: string;
  roomId: string;
  fromAttendeeId: string;
  toAttendeeId: string;
  note?: string;
  tags: string[];
  followUp: boolean;
  createdAt: string;
};

export type SavedPerson = {
  id: string;
  roomId: string;
  fromAttendeeId: string;
  savedAttendeeId: string;
  createdAt: string;
};

export type GraphNode = {
  id: string;
  name: string;
  role?: string;
  company?: string;
  cluster?: string;
  avatarUrl?: string;
  val: number;
  color: string;
  isCurrentUser?: boolean;
  isMet?: boolean;
  isSaved?: boolean;
  isSearchResult?: boolean;
  connectionCount?: number;
};

export type GraphLink = {
  source: string;
  target: string;
  type: "similarity" | "met" | "saved";
  strength: number;
};

export type RoomData = {
  room: Room;
  attendees: Attendee[];
  connections: Connection[];
  saved: SavedPerson[];
};

export type RoomMetrics = {
  attendeeCount: number;
  conversationCount: number;
  activeAttendeePercentage: number;
  averageConnectionsPerActiveAttendee: number;
  followUpIntentCount: number;
  strongestBridge: { from: string; to: string; count: number } | null;
  mostActiveCluster: { name: string; count: number } | null;
  highestFollowUpTag: { tag: string; count: number } | null;
  clusterActivity: { name: string; count: number }[];
  tagDistribution: { tag: string; count: number }[];
  conversationsOverTime: { hour: string; count: number }[];
  topBridges: { from: string; to: string; count: number }[];
};

export type DashboardData = {
  organizing: Room[];
  attending: (Room & { attendeeId: string })[];
  organizerMetrics?: {
    totalRooms: number;
    totalAttendees: number;
    totalConnections: number;
  };
};

export const QUICK_TAGS = [
  "Follow up",
  "Send resume",
  "Coffee chat",
  "Project idea",
  "Hiring",
  "Mentor",
  "Investor",
  "Friend",
  "Research",
  "Design feedback",
] as const;

export type CreateAttendeeInput = Omit<Attendee, "id" | "roomId" | "createdAt" | "sessionToken">;
