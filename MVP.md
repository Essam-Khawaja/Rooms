# Rooms MVP Specification

**Product:** Rooms  
**Tagline:** Make sure you're in the right room.  
**Platform:** Phone-first Next.js web app  
**Hackathon prompt:** Build a tool, system, or workflow that solves a real-world problem without relying on a conventional dashboard as the primary interface.

---

## 1. Product Thesis

Rooms is a live social map for networking events.

Networking events are supposed to create valuable connections, but most attendees leave with forgotten names, scattered notes, and vague follow-up intentions. Organizers also struggle to prove that their event created real networking value.

Rooms turns the attendee list into an interactive graph. Every person is a node. Every conversation becomes a connection. At the end of the event, attendees leave with a follow-up plan, and organizers get aggregate proof that meaningful conversations happened.

### Core product promise

At a networking event, an attendee can:

1. Enter a room.
2. See attendees as a live graph.
3. Find someone they met.
4. Mark the conversation.
5. Add a quick note or tag.
6. Leave with a follow-up list.

An organizer can:

1. Create a room.
2. Load attendees.
3. Let attendees build their own connection maps.
4. See aggregate event connection metrics.

---

## 2. One-Liner

Rooms turns networking events into live social maps, helping attendees discover people, remember conversations, and leave with a follow-up plan.

---

## 3. Pitch

Networking events are broken. You meet people, forget names, lose context, and leave with no plan. Rooms gives every event a live social graph where attendees can find people, mark conversations, add quick notes, and leave with a follow-up map.

Every time someone logs a conversation, their personal map grows. At the end, attendees know exactly who to follow up with, and organizers can prove that their event created real connections.

---

## 4. Why This Fits the Hackathon Prompt

The prompt asks for a tool, system, or workflow that solves a real-world problem without relying on a conventional dashboard as the primary interface.

Rooms fits because the primary interface is not a table, chart, or KPI dashboard. The primary interface is the room itself: a living graph of people and relationships.

A dashboard shows data after the fact. Rooms makes the event navigable while it is happening.

---

## 5. Target Users

### 5.1 Attendee

The attendee wants to:

- Know who is in the room.
- Find people worth talking to.
- Remember who they met.
- Remember what they talked about.
- Know who to follow up with after the event.

### 5.2 Organizer

The organizer wants to:

- Create a room for an event.
- Import registration data.
- Give attendees a better networking experience.
- Prove that the event created meaningful connections.
- Share post-event metrics with sponsors, clubs, teams, or stakeholders.

### 5.3 Hackathon Judge / Demo Viewer

The judge should understand the product in under 20 seconds:

1. See the room graph.
2. Search for a person.
3. Tap their node.
4. Mark them as met.
5. See a connection appear.
6. View the follow-up summary.
7. View organizer Room Pulse metrics.

---

## 6. Problem Breakdown

### 6.1 Attendee Problems

Networking events usually fail after the handshake.

Common attendee pain points:

- "I do not know who I should talk to."
- "I forgot that person's name."
- "I forgot what we talked about."
- "I said I would follow up, but I forgot why."
- "The event felt useful, but I left with no concrete plan."

### 6.2 Organizer Problems

Organizers usually know attendance, but not actual networking value.

Common organizer pain points:

- "How do I prove this event worked?"
- "Did people actually meet each other?"
- "Which groups connected?"
- "What should we tell sponsors or stakeholders?"
- "How do we make post-event follow-up easier?"

---

## 7. Product Positioning

### What Rooms is

Rooms is:

- A live social map.
- A networking memory tool.
- A follow-up generator.
- An event connection layer.
- A non-dashboard interface for event networking.

### What Rooms is not

Rooms is not:

- A full event ticketing platform.
- A LinkedIn replacement.
- A generic CRM.
- A conventional analytics dashboard.
- A messaging app.
- A complex conference platform.

---

## 8. MVP Scope

### 8.1 MVP Goal

The MVP should prove this core moment:

> I just met someone. I tap their node. Now I will not forget them.

Everything else supports this moment.

### 8.2 MVP User Flow

#### Organizer flow

1. Organizer opens landing page.
2. Organizer clicks **Create Demo Room**.
3. Organizer enters event name.
4. Organizer uploads a CSV or uses sample data.
5. App generates a room graph.
6. Organizer opens the room link.
7. Attendees join through the link or QR code.
8. Organizer views Room Pulse metrics.

#### Attendee flow

1. Attendee opens room link.
2. Attendee searches for themselves.
3. Attendee claims their profile.
4. Attendee sees the live room graph.
5. Attendee searches for someone they met.
6. Attendee taps that person's node.
7. Attendee taps **Met**.
8. Attendee adds optional tags or a note.
9. A connection line appears.
10. Attendee views their follow-up summary.

---

## 9. Must-Have Features

### 9.1 Landing Page

Purpose: explain the product quickly and route into the demo.

Required content:

- Product name: **Rooms**
- Tagline: **Make sure you're in the right room.**
- One-liner
- Primary CTA: **Create Demo Room**
- Secondary CTA: **Join Room**
- Small visual preview of a graph

Suggested copy:

```text
Make sure you're in the right room.

Rooms turns networking events into live social maps. Find the right people, remember every conversation, and leave with a follow-up plan.
```

---

### 9.2 Create Room

Purpose: let organizers set up a room quickly.

Fields:

- Event name
- Organizer name
- Optional description
- CSV upload
- Demo data button

Required buttons:

- **Use sample data**
- **Generate room map**
- **Open room**

Important MVP requirement:

CSV upload should not be required for the live demo. Always provide sample data.

---

### 9.3 CSV Import

Minimum supported CSV columns:

```csv
name,email,role,company,interests,looking_for,can_help_with
```

Example:

```csv
name,email,role,company,interests,looking_for,can_help_with
Aisha Khan,aisha@example.com,ML Student,UCalgary,"AI, Robotics, Startups","Internship leads","Computer vision"
Marcus Lee,marcus@example.com,Founder,Nova Labs,"Startups, Design, AI","Technical cofounder","Product strategy"
```

MVP CSV behavior:

1. Parse CSV.
2. Normalize column names.
3. Split interests by commas.
4. Generate attendee nodes.
5. Generate similarity links from shared interests.
6. Save attendees to room state or database.

If CSV parsing breaks, use sample data.

---

### 9.4 Room Lobby

Purpose: let attendees claim their profile before entering the graph.

Content:

```text
Welcome to [Event Name]

Find yourself to enter the room.
```

User action:

1. Search name.
2. Select matching profile.
3. Click **This is me**.
4. Store selected attendee ID in localStorage.
5. Navigate to live room graph.

Fallback:

- **Join as guest**

For MVP, guest mode can create a temporary local user.

---

### 9.5 Live Room Graph

Purpose: primary interface.

Each attendee is represented as a circular node.

Graph interactions:

- Pan around room.
- Zoom.
- Tap node.
- Open person sheet.
- Search and center node.
- Mark person as met.
- Draw connection line after meeting.

Node states:

| State | Visual Treatment |
|---|---|
| Current user | Larger node, accent ring |
| Unmet person | Muted node |
| Person met | Brighter node |
| Saved person | Bookmark ring or dashed ring |
| Search result | Pulsing ring |
| Highly connected person | Slightly larger node |

Edge states:

| Edge Type | Meaning | Visual Treatment |
|---|---|---|
| Similarity | Shared interest/profile field | Thin muted line |
| Met | User logged meeting | Bright accent line |
| Saved | User saved person for later | Dashed line |

Important design rule:

The graph must change when the user logs a conversation. Otherwise, it becomes decoration.

---

### 9.6 Search

Purpose: make the graph usable on mobile.

Search should work across:

- Name
- Role
- Company
- Interests
- Looking for
- Can help with

Search behavior:

1. User taps search bar.
2. Search overlay opens.
3. User types query.
4. Matching people appear as cards.
5. User taps result.
6. App centers the graph on that node.
7. Person sheet opens.

Placeholder:

```text
Find someone in the room...
```

---

### 9.7 Person Sheet

Purpose: show who a person is and allow quick meeting actions.

Use a mobile bottom sheet, not a desktop modal.

Content:

```text
Aisha Khan
ML Student · UCalgary

Interested in:
AI, Robotics, Startups

Looking for:
Internship leads

Can help with:
Computer vision

[Met] [Save]
```

Actions:

- **Met**
- **Save for later**
- Optional: **Close**

---

### 9.8 Meeting Form

Purpose: let the attendee record the conversation quickly.

After tapping **Met**, show:

- Quick tags
- Optional note
- Follow-up toggle or inferred follow-up

Quick tags:

- Follow up
- Send resume
- Coffee chat
- Project idea
- Hiring
- Mentor
- Investor
- Friend
- Research
- Design feedback

Note placeholder:

```text
What did you talk about?
```

Save button:

```text
Save connection
```

Important MVP principle:

The flow should work even if the user only taps **Met** and skips the note.

---

### 9.9 My Map / Follow-Up Summary

Purpose: give the attendee their post-event value.

Sections:

1. Summary
2. Top follow-ups
3. People met
4. Notes
5. Mini personal graph

Example copy:

```text
You made 6 connections tonight.

3 are worth following up with this week.
```

Follow-up card structure:

```text
Aisha Khan
ML Student · UCalgary

Tags: Research, Coffee chat
Note: Talked about HECKTOR segmentation and robotics.

Suggested action:
Send her your GitHub and ask to compare ML project notes.
```

For MVP, suggested actions can be rule-based.

Example rules:

- If tag is `Send resume`: "Send your resume and thank them for the conversation."
- If tag is `Coffee chat`: "Ask for a quick coffee chat this week."
- If tag is `Project idea`: "Send a short summary of the project idea."
- If tag is `Research`: "Share your related work or GitHub link."
- If tag is `Hiring`: "Follow up with your resume and availability."

---

### 9.10 Organizer Room Pulse

Purpose: give organizers aggregate proof of event value without making a conventional dashboard the core interface.

Call this page:

```text
Room Pulse
```

Hero stat:

```text
87 conversations happened in this room.
```

Supporting metrics:

- Total attendees
- Total conversations logged
- Average connections per active attendee
- Percentage of attendees who made at least one connection
- Number of follow-up intents
- Most active cluster
- Strongest cross-cluster bridge

Example insight cards:

```text
Strongest bridge:
AI/ML ↔ Founders

Most active group:
Students

Highest follow-up intent:
Hiring conversations
```

Important:

Organizer should not see private notes. Organizer only sees aggregate metrics.

---

## 10. Features to Cut From MVP

Do not build these for the 2-hour hackathon:

- Full authentication
- Complex organizer accounts
- Payment
- Email invites
- Full CSV field-mapping UI
- AI-generated summaries
- Real-time presence
- Private messaging
- Calendar integration
- LinkedIn integration
- Multi-event history
- QR scanner
- Advanced permissions
- Export to PDF
- Native mobile app
- 3D graph

These are not needed to prove the core concept.

---

## 11. Design Direction

### 11.1 Design Keywords

Rooms should feel:

- Sleek
- Spatial
- Night-event coded
- Slightly mysterious
- Premium
- Social
- Calm
- Fast
- Phone-native

Rooms should not feel:

- Vibe-coded
- Generic SaaS
- Corporate dashboard
- Overly playful
- Randomly gradient-heavy
- Like a developer tool
- Like a template

### 11.2 Visual Concept

Recommended aesthetic:

```text
Dark social cartography.
```

The app should feel like a map of the room at night.

Use:

- Dark canvas
- Soft glowing nodes
- Thin relationship lines
- Warm ivory text
- One sharp accent color
- Bottom sheets
- Pills
- Subtle glass panels

---

## 12. Design Inspirations

### 12.1 Obsidian Graph View

Use for:

- Dark graph canvas
- Node-link metaphor
- Relationship-first navigation
- Spatial exploration

Avoid:

- Looking too technical
- Tiny unreadable labels
- Dense graph clutter

Rooms should feel more social and human than Obsidian.

### 12.2 Partiful

Use for:

- Event personality
- Friendly copy
- Social energy
- Human tone

Avoid:

- Too many stickers
- Too much chaos
- Looking unserious

Rooms should borrow the energy, not the whole aesthetic.

### 12.3 Luma

Use for:

- Clean event setup
- Simple organizer flow
- Professional credibility

Avoid:

- Becoming a normal event page
- Letting forms become the primary experience

### 12.4 Linear / Raycast / Arc Style

Use for:

- Crisp spacing
- Command/search-first interaction
- Polished dark UI
- Smooth transitions
- Serious product feel

Avoid:

- Sterile productivity-tool energy

---

## 13. Visual Design System

### 13.1 Color Palette

Recommended palette: **Midnight Room**

```css
:root {
  --background: #080A0F;
  --surface: #11141C;
  --surface-soft: #171B25;
  --border: #2A3040;

  --text-main: #F4EFE7;
  --text-muted: #A6A199;
  --text-faint: #6F7280;

  --accent: #D6FF6B;
  --accent-soft: rgba(214, 255, 107, 0.14);

  --blue-node: #7AA2FF;
  --pink-node: #FF7AB6;
  --green-node: #72E6AC;
  --orange-node: #FFB86B;
  --purple-node: #B892FF;

  --danger: #FF6B6B;
}
```

### 13.2 Typography

Recommended fonts:

- Geist
- Inter
- Satoshi
- Manrope

Use one font family for the MVP. Geist is recommended for Next.js.

Suggested sizes:

| Use | Mobile Size |
|---|---|
| Hero headline | 36px |
| Page heading | 28px |
| Section heading | 20px |
| Body | 15-16px |
| Small label | 12-13px |
| Button | 15px semibold |

### 13.3 Spacing Scale

Use strict spacing:

```text
4, 8, 12, 16, 24, 32, 48, 64
```

Avoid random one-off margins.

### 13.4 Logo Direction

Keep the logo simple.

Options:

```text
rooms
```

or:

```text
r∞ms
```

or a small node-link mark:

```text
○—○
```

Possible lockup:

```text
rooms
make sure you're in the right room
```

---

## 14. Mobile-First Interaction Model

### 14.1 Main Attendee Layout

The attendee screen has three layers:

1. Graph canvas
2. Floating search bar
3. Bottom sheet profile/actions

Sketch:

```text
┌─────────────────────────────┐
│  Find someone in the room... │
├─────────────────────────────┤
│                             │
│        ○     ○              │
│    ○────○         ○         │
│       ╲  ╲                  │
│        ○──○     ○           │
│                             │
│                             │
├─────────────────────────────┤
│  Aisha Khan                 │
│  ML Student · UCalgary      │
│  AI · Robotics · Startups   │
│                             │
│  [Met] [Save for later]     │
└─────────────────────────────┘
```

### 14.2 Search Overlay

Search should feel like a mobile command palette.

Behavior:

1. Tap search.
2. Full-screen or large overlay opens.
3. Keyboard opens.
4. Results appear as cards.
5. Tap result.
6. Overlay closes.
7. Graph centers on selected person.
8. Person sheet opens.

### 14.3 Bottom Sheet

Use bottom sheets instead of modals.

Bottom sheet states:

- Collapsed: basic name/action row.
- Half-open: profile details.
- Full-open: meeting form.

### 14.4 Touch Targets

Minimum tap target:

```text
44px
```

This app is used while standing and talking. Buttons must be easy to hit.

---

## 15. Screens

### 15.1 Landing Page

Route:

```text
/
```

Primary goal:

Explain product and start demo.

Main sections:

1. Hero
2. Mini graph preview
3. Problem
4. How it works
5. CTA

Required CTA:

```text
Create demo room
```

---

### 15.2 Create Room

Route:

```text
/create
```

Primary goal:

Create event and load attendee data.

Required components:

- Room name input
- Organizer name input
- CSV uploader
- Sample data button
- Parsed attendee preview
- Open room button

---

### 15.3 Room Lobby

Route:

```text
/r/[slug]
```

Primary goal:

Let attendee claim identity.

Required components:

- Event name
- Search input
- Attendee result cards
- This is me button
- Guest fallback

---

### 15.4 Live Room Map

Route:

```text
/r/[slug]/map
```

Primary goal:

Let attendees explore the room and log conversations.

Required components:

- Floating search bar
- Graph canvas
- Person bottom sheet
- Met action
- Save action
- My Map button

---

### 15.5 My Map

Route:

```text
/r/[slug]/me
```

Primary goal:

Show attendee follow-up summary.

Required components:

- Connection count
- Top follow-up cards
- People met list
- Conversation notes
- Mini personal graph

---

### 15.6 Room Pulse

Route:

```text
/r/[slug]/pulse
```

Primary goal:

Show organizer aggregate event value.

Required components:

- Hero conversation count
- Aggregate metrics
- Strongest bridge
- Most active group
- Follow-up intent count
- Aggregated graph

---

## 16. Technical Stack

### 16.1 Recommended Stack

```text
Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or custom components
- react-force-graph-2d
- Papa Parse or react-papaparse
- lucide-react

Backend:
- Next.js Route Handlers
- Supabase Postgres

State:
- Server data from Supabase
- Client graph state in React
- Current attendee ID in localStorage

Deployment:
- Vercel
- Supabase hosted database
```

### 16.2 Graph Library Recommendation

Use:

```text
react-force-graph-2d
```

Reasons:

- Fast setup
- Good enough visual quality
- Canvas rendering
- Built-in pan/zoom
- Node click handling
- Force-directed layout

Avoid building the graph from scratch during the hackathon.

### 16.3 CSV Parser

Use:

```text
papaparse
```

Reasons:

- Fast CSV parsing
- Client-side support
- Converts CSV into JSON
- Good enough for MVP

---

## 17. Project Structure

```text
/app
  /page.tsx
    Landing page

  /create/page.tsx
    Create room and CSV upload

  /r/[slug]/page.tsx
    Room lobby / claim identity

  /r/[slug]/map/page.tsx
    Live attendee graph

  /r/[slug]/me/page.tsx
    Personal follow-up summary

  /r/[slug]/pulse/page.tsx
    Organizer Room Pulse

  /api/rooms/route.ts
    Create room

  /api/rooms/[slug]/route.ts
    Get room details

  /api/rooms/[slug]/attendees/route.ts
    Upload/fetch attendees

  /api/rooms/[slug]/connections/route.ts
    Create/fetch connections

  /api/rooms/[slug]/metrics/route.ts
    Organizer metrics

/components
  /brand
    Logo.tsx
    NodeMark.tsx

  /landing
    HeroGraphPreview.tsx
    ProblemSection.tsx
    HowItWorks.tsx

  /room
    RoomGraph.tsx
    SearchBar.tsx
    SearchOverlay.tsx
    PersonSheet.tsx
    MeetingForm.tsx
    MyMapButton.tsx
    RoomHeader.tsx

  /organizer
    CsvUploader.tsx
    AttendeePreviewTable.tsx
    RoomLinkCard.tsx
    RoomPulse.tsx
    MetricCard.tsx

  /ui
    Button.tsx
    Card.tsx
    Pill.tsx
    BottomSheet.tsx
    Input.tsx

/lib
  graph.ts
  search.ts
  metrics.ts
  demo-data.ts
  supabase.ts
  csv.ts
```

---

## 18. Data Model

### 18.1 Room

```ts
type Room = {
  id: string;
  slug: string;
  name: string;
  organizerName: string;
  description?: string;
  createdAt: string;
  status: "draft" | "live" | "ended";
};
```

### 18.2 Attendee

```ts
type Attendee = {
  id: string;
  roomId: string;
  name: string;
  email?: string;
  role?: string;
  company?: string;
  interests: string[];
  lookingFor?: string;
  canHelpWith?: string;
  cluster?: string;
  createdAt: string;
};
```

### 18.3 Connection

```ts
type Connection = {
  id: string;
  roomId: string;
  fromAttendeeId: string;
  toAttendeeId: string;
  note?: string;
  tags: string[];
  followUp: boolean;
  createdAt: string;
};
```

### 18.4 Saved Person

```ts
type SavedPerson = {
  id: string;
  roomId: string;
  fromAttendeeId: string;
  savedAttendeeId: string;
  createdAt: string;
};
```

### 18.5 Graph Node

```ts
type GraphNode = {
  id: string;
  name: string;
  role?: string;
  company?: string;
  cluster?: string;
  val: number;
  color: string;
  isCurrentUser?: boolean;
  isMet?: boolean;
  isSaved?: boolean;
};
```

### 18.6 Graph Link

```ts
type GraphLink = {
  source: string;
  target: string;
  type: "similarity" | "met" | "saved";
  strength: number;
};
```

---

## 19. Database Schema

If using Supabase Postgres:

```sql
create table rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  organizer_name text,
  description text,
  status text not null default 'draft',
  created_at timestamptz default now()
);

create table attendees (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  name text not null,
  email text,
  role text,
  company text,
  interests text[] default '{}',
  looking_for text,
  can_help_with text,
  cluster text,
  created_at timestamptz default now()
);

create table connections (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  from_attendee_id uuid references attendees(id) on delete cascade,
  to_attendee_id uuid references attendees(id) on delete cascade,
  note text,
  tags text[] default '{}',
  follow_up boolean default false,
  created_at timestamptz default now()
);

create table saved_people (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  from_attendee_id uuid references attendees(id) on delete cascade,
  saved_attendee_id uuid references attendees(id) on delete cascade,
  created_at timestamptz default now()
);
```

For the 2-hour MVP, it is acceptable to skip Supabase and store demo state in localStorage. The cleanest approach is to build the UI and graph first, then wire Supabase if time allows.

---

## 20. Privacy Model

Privacy matters because organizer-uploaded attendee data can be sensitive.

### MVP Privacy Rules

1. Attendees only see profile fields imported by the organizer.
2. Private notes are visible only to the person who wrote them.
3. Organizers see aggregate metrics, not private notes.
4. Organizer can delete the room.
5. CSV upload should clearly show which fields will be visible.

### CSV Upload Privacy Copy

```text
Only selected profile fields are visible to attendees. Conversation notes stay private to the attendee who wrote them. Organizers only receive aggregate metrics.
```

---

## 21. API Contracts

### 21.1 Create Room

```text
POST /api/rooms
```

Request:

```json
{
  "name": "Startup Mixer 2026",
  "organizerName": "Essam",
  "description": "A networking night for builders and founders."
}
```

Response:

```json
{
  "room": {
    "id": "uuid",
    "slug": "startup-mixer-2026-a7f3",
    "name": "Startup Mixer 2026"
  }
}
```

---

### 21.2 Add Attendees

```text
POST /api/rooms/[slug]/attendees
```

Request:

```json
{
  "attendees": [
    {
      "name": "Aisha Khan",
      "email": "aisha@example.com",
      "role": "ML Student",
      "company": "UCalgary",
      "interests": ["AI", "Robotics", "Startups"],
      "lookingFor": "Internship leads",
      "canHelpWith": "Computer vision"
    }
  ]
}
```

Response:

```json
{
  "count": 1
}
```

---

### 21.3 Get Room

```text
GET /api/rooms/[slug]
```

Response:

```json
{
  "room": {},
  "attendees": [],
  "connections": []
}
```

---

### 21.4 Create Connection

```text
POST /api/rooms/[slug]/connections
```

Request:

```json
{
  "fromAttendeeId": "uuid",
  "toAttendeeId": "uuid",
  "note": "Talked about ML internships and robotics.",
  "tags": ["Research", "Coffee chat"],
  "followUp": true
}
```

Response:

```json
{
  "connection": {}
}
```

---

### 21.5 Get Metrics

```text
GET /api/rooms/[slug]/metrics
```

Response:

```json
{
  "attendeeCount": 42,
  "conversationCount": 87,
  "activeAttendeePercentage": 0.71,
  "averageConnectionsPerActiveAttendee": 2.1,
  "followUpIntentCount": 19,
  "strongestBridge": {
    "from": "AI/ML",
    "to": "Founders",
    "count": 14
  }
}
```

---

## 22. Graph Generation Logic

### 22.1 Generate Nodes

Each attendee becomes a graph node.

```ts
const nodes = attendees.map((attendee) => ({
  id: attendee.id,
  name: attendee.name,
  role: attendee.role,
  company: attendee.company,
  cluster: attendee.cluster,
  val: attendee.id === currentAttendeeId ? 8 : 4,
  color: getClusterColor(attendee.cluster),
  isCurrentUser: attendee.id === currentAttendeeId,
  isMet: metIds.has(attendee.id),
  isSaved: savedIds.has(attendee.id),
}));
```

### 22.2 Generate Similarity Links

Similarity links make the room graph useful before meetings are logged.

Rule:

- Compare attendees by shared interests.
- If two people share at least one or two interests, create a weak link.
- Cap links to avoid visual clutter.

```ts
function normalize(value: string) {
  return value.toLowerCase().trim();
}

function sharedInterestCount(a: Attendee, b: Attendee) {
  const aSet = new Set(a.interests.map(normalize));
  return b.interests.filter((interest) => aSet.has(normalize(interest))).length;
}
```

MVP rule:

```ts
if (sharedInterestCount(a, b) >= 1) {
  createSimilarityLink(a.id, b.id);
}
```

For larger datasets, require at least two shared interests.

### 22.3 Generate Met Links

Logged meetings should be visually stronger than similarity links.

```ts
const metLinks = connections
  .filter((c) => c.fromAttendeeId === currentAttendeeId)
  .map((c) => ({
    source: c.fromAttendeeId,
    target: c.toAttendeeId,
    type: "met",
    strength: 3,
  }));
```

---

## 23. Search Logic

Search across:

- Name
- Role
- Company
- Interests
- Looking for
- Can help with

Example implementation:

```ts
function searchAttendees(query: string, attendees: Attendee[]) {
  const q = query.toLowerCase().trim();

  if (!q) return [];

  return attendees
    .map((attendee) => {
      const haystack = [
        attendee.name,
        attendee.role,
        attendee.company,
        attendee.lookingFor,
        attendee.canHelpWith,
        ...attendee.interests,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const score =
        attendee.name.toLowerCase().includes(q) ? 10 :
        haystack.includes(q) ? 5 :
        0;

      return { attendee, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.attendee);
}
```

---

## 24. Metrics Logic

### 24.1 Total Attendees

```ts
const attendeeCount = attendees.length;
```

### 24.2 Total Conversations

```ts
const conversationCount = connections.length;
```

### 24.3 Active Attendees

An attendee is active if they logged a connection or were logged by someone else.

```ts
const activeIds = new Set<string>();

connections.forEach((connection) => {
  activeIds.add(connection.fromAttendeeId);
  activeIds.add(connection.toAttendeeId);
});
```

### 24.4 Active Percentage

```ts
const activeAttendeePercentage = activeIds.size / attendees.length;
```

### 24.5 Average Connections Per Active Attendee

```ts
const averageConnectionsPerActiveAttendee =
  activeIds.size === 0 ? 0 : connections.length / activeIds.size;
```

### 24.6 Follow-Up Intent Count

```ts
const followUpIntentCount = connections.filter((c) => c.followUp).length;
```

### 24.7 Most Connected Attendee

```ts
const degreeMap = new Map<string, number>();

connections.forEach((connection) => {
  degreeMap.set(
    connection.fromAttendeeId,
    (degreeMap.get(connection.fromAttendeeId) ?? 0) + 1
  );

  degreeMap.set(
    connection.toAttendeeId,
    (degreeMap.get(connection.toAttendeeId) ?? 0) + 1
  );
});
```

### 24.8 Strongest Bridge

Group connections by cluster pair.

Example output:

```text
AI/ML ↔ Founders: 12
Students ↔ Recruiters: 8
Designers ↔ Founders: 5
```

This is one of the strongest organizer metrics for the demo.

---

## 25. Demo Data

Use 18-24 attendees. This is enough to make the graph feel alive without becoming cluttered.

Recommended clusters:

- Students
- Founders
- Recruiters
- Engineers
- Designers
- Researchers

Example demo data:

```ts
export const demoAttendees = [
  {
    id: "aisha-khan",
    roomId: "demo",
    name: "Aisha Khan",
    email: "aisha@example.com",
    role: "ML Student",
    company: "UCalgary",
    interests: ["AI", "Robotics", "Computer Vision"],
    lookingFor: "ML internship leads",
    canHelpWith: "Model evaluation and Python",
    cluster: "Students",
    createdAt: new Date().toISOString(),
  },
  {
    id: "marcus-lee",
    roomId: "demo",
    name: "Marcus Lee",
    email: "marcus@example.com",
    role: "Founder",
    company: "Nova Labs",
    interests: ["Startups", "AI", "Product"],
    lookingFor: "Technical cofounder",
    canHelpWith: "Pitch strategy",
    cluster: "Founders",
    createdAt: new Date().toISOString(),
  },
  {
    id: "priya-shah",
    roomId: "demo",
    name: "Priya Shah",
    email: "priya@example.com",
    role: "Recruiter",
    company: "Northstar Tech",
    interests: ["Hiring", "Software Engineering", "Internships"],
    lookingFor: "Strong student builders",
    canHelpWith: "Resume feedback",
    cluster: "Recruiters",
    createdAt: new Date().toISOString(),
  },
  {
    id: "daniel-kim",
    roomId: "demo",
    name: "Daniel Kim",
    email: "daniel@example.com",
    role: "Designer",
    company: "Freelance",
    interests: ["UX", "Branding", "Startups"],
    lookingFor: "Founder projects",
    canHelpWith: "Landing page design",
    cluster: "Designers",
    createdAt: new Date().toISOString(),
  }
];
```

Add more entries with overlapping interests to make graph clusters visible.

---

## 26. 2-Hour Hackathon Build Plan

### Minutes 0-20: Setup

Create project:

```bash
npx create-next-app@latest rooms
cd rooms
npm install react-force-graph-2d papaparse lucide-react clsx tailwind-merge
```

Optional:

```bash
npm install @supabase/supabase-js
```

Set up:

- Tailwind
- Global CSS variables
- Basic layout
- Demo data file

Do not start with Supabase. Start with the interaction.

---

### Minutes 20-45: Build Graph

Build:

- `/r/demo/map`
- `RoomGraph.tsx`
- Demo attendees
- Graph nodes
- Graph links
- Node click opens person sheet
- Search highlights selected node

This is the core product.

---

### Minutes 45-65: Build Meeting Logging

Build:

- Current user state
- Person sheet
- Met button
- Tags
- Optional note
- Save connection
- Draw met edge

At this point, the product is demoable.

---

### Minutes 65-85: Build My Map

Build:

- `/r/demo/me`
- People met list
- Notes
- Follow-up cards
- Personal connection count

This creates attendee payoff.

---

### Minutes 85-105: Build Room Pulse

Build:

- `/r/demo/pulse`
- Total conversations
- Active percentage
- Follow-up intent count
- Strongest bridge
- Most active cluster

This creates organizer payoff.

---

### Minutes 105-120: Polish

Polish:

- Landing page
- Mobile spacing
- Empty states
- Loading states
- Demo script
- Bug fixes
- Visual consistency

Do not add new features in the last 15 minutes.

---

## 27. Implementation Priority

### Priority 1: Must work

- Demo room map
- Select current attendee
- Search attendees
- Tap node
- Mark as met
- Add note/tags
- Show connection line
- Show follow-up summary

### Priority 2: Should work

- CSV upload
- Organizer Room Pulse
- Saved people
- Better visual clustering
- Stronger empty states

### Priority 3: Nice to have

- Real Supabase persistence
- QR code room link
- Real-time updates
- Better graph animations
- CSV field mapping
- Organizer room status controls

---

## 28. Technical Risk Management

### Risk: CSV parsing takes too long

Fix:

Use sample data button and make CSV optional.

### Risk: Graph is hard to control

Fix:

Use react-force-graph-2d. Do not build graph physics manually.

### Risk: Mobile graph labels clutter screen

Fix:

Hide most labels. Show labels only on selected, searched, or nearby nodes.

### Risk: App starts looking like a dashboard

Fix:

Keep the graph as the main screen. Make Room Pulse secondary.

### Risk: Meeting logging has too much friction

Fix:

Make the Met button work without a note. Tags and notes are optional.

### Risk: Supabase slows the team down

Fix:

Build local demo first. Add database after product moment works.

---

## 29. Copy Bank

### Landing

```text
Make sure you're in the right room.

Rooms turns networking events into live social maps. Find the right people, remember every conversation, and leave with a follow-up plan.
```

### Empty personal map

```text
Your map is empty.

Meet someone, find their node, and mark the conversation.
```

### First connection

```text
First connection made.

Your room map has started.
```

### Follow-up summary

```text
You made 6 connections tonight.

Here are the people worth following up with first.
```

### Organizer Room Pulse

```text
This room created 87 logged conversations.

Rooms tracks connection intent, not just attendance.
```

### Privacy

```text
Only selected profile fields are visible to attendees. Conversation notes stay private to the attendee who wrote them. Organizers only receive aggregate metrics.
```

---

## 30. Demo Script

### Opening

Networking events are supposed to create meaningful connections, but most people leave with forgotten names and no follow-up plan. Organizers also have no way to prove whether the event actually worked.

Rooms turns the attendee list into a live social map.

### Demo Steps

1. Create or open a demo room.
2. Show the graph of attendees.
3. Claim a profile.
4. Search for a person.
5. Open their profile sheet.
6. Tap **Met**.
7. Add a tag and note.
8. Save connection.
9. Show the new connection line.
10. Open **My Map**.
11. Show follow-up list.
12. Open **Room Pulse**.
13. Show organizer metrics.

### Closing

Rooms makes networking visible, memorable, and measurable.

---

## 31. Final MVP Definition

The MVP is successful if a judge can understand and feel this loop:

```text
I enter the room.
I see people as a map.
I meet someone.
I tap their node.
My map grows.
I leave with follow-ups.
The organizer sees proof that the event worked.
```

Do not overbuild. The product lives or dies on the quality of the graph interaction and the Met action.

---

## 32. Final Build Recommendation

Build the local demo first.

Recommended order:

1. Demo data
2. Graph screen
3. Current user selection
4. Search
5. Person sheet
6. Met action
7. Follow-up page
8. Organizer pulse
9. CSV upload
10. Supabase persistence

The best hackathon version is not the most complete version. It is the version where the core product moment feels obvious, useful, and polished.

---

## 33. Final Positioning

Do not pitch Rooms as:

```text
A networking dashboard.
```

Do not pitch Rooms as:

```text
Obsidian for people.
```

Pitch Rooms as:

```text
A live social map for events.
```

Core line:

```text
Rooms makes every conversation visible, memorable, and actionable.
```
