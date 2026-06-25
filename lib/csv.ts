import Papa from "papaparse";
import type { CreateAttendeeInput } from "./types";
import { getSampleAttendees } from "./demo-data";

type CsvRow = Record<string, string>;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]+/g, "");
}

function getField(row: CsvRow, ...keys: string[]): string | undefined {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
  );
  for (const key of keys) {
    const val = normalized[normalizeKey(key)];
    if (val?.trim()) return val.trim();
  }
  return undefined;
}

function parseInterests(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function inferCluster(role?: string, interests: string[] = []): string {
  const text = `${role ?? ""} ${interests.join(" ")}`.toLowerCase();
  if (text.includes("recruit") || text.includes("talent") || text.includes("hiring"))
    return "Recruiters";
  if (text.includes("founder") || text.includes("ceo")) return "Founders";
  if (text.includes("design") || text.includes("ux")) return "Designers";
  if (text.includes("research") || text.includes("phd") || text.includes("scientist"))
    return "Researchers";
  if (text.includes("student") || text.includes("intern")) return "Students";
  if (text.includes("engineer") || text.includes("developer")) return "Engineers";
  return "Students";
}

export function parseCsvToAttendees(csvText: string): CreateAttendeeInput[] {
  const result = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error("Failed to parse CSV");
  }

  const attendees = result.data
    .filter((row) => getField(row, "name"))
    .map((row) => {
      const name = getField(row, "name")!;
      const interests = parseInterests(getField(row, "interests"));
      const role = getField(row, "role");

      return {
        name,
        email: getField(row, "email"),
        role,
        company: getField(row, "company"),
        interests,
        lookingFor: getField(row, "looking_for", "lookingfor", "looking for"),
        canHelpWith: getField(row, "can_help_with", "canhelpwith", "can help with"),
        username: getField(row, "username"),
        cluster: inferCluster(role, interests),
      };
    });

  if (attendees.length === 0) {
    throw new Error("No valid attendees found in CSV");
  }

  return attendees;
}

export function getFallbackAttendees(): CreateAttendeeInput[] {
  return getSampleAttendees();
}
