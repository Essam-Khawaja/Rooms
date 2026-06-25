import type { Attendee } from "./types";

export function searchAttendees(query: string, attendees: Attendee[]): Attendee[] {
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
        attendee.cluster,
        ...attendee.interests,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const nameLower = attendee.name.toLowerCase();
      let score = 0;

      if (nameLower === q) score = 20;
      else if (nameLower.startsWith(q)) score = 15;
      else if (nameLower.includes(q)) score = 10;
      else if (haystack.includes(q)) score = 5;
      else {
        const words = q.split(/\s+/);
        const matchedWords = words.filter((w) => haystack.includes(w));
        if (matchedWords.length > 0) score = matchedWords.length * 2;
      }

      return { attendee, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.attendee);
}
