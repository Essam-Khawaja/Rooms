const TAG_ACTIONS: Record<string, string> = {
  "Follow up": "Send a quick follow-up message while the conversation is still fresh.",
  "Send resume": "Send your resume and thank them for the conversation.",
  "Coffee chat": "Ask for a quick coffee chat this week.",
  "Project idea": "Send a short summary of the project idea you discussed.",
  Research: "Share your related work or GitHub link.",
  Hiring: "Follow up with your resume and availability.",
  Mentor: "Ask if they'd be open to a brief mentoring call.",
  Investor: "Send your pitch deck or one-pager with a clear ask.",
  Friend: "Send a friendly message to keep the connection warm.",
  "Design feedback": "Share your designs and ask for specific feedback.",
};

export function getSuggestedAction(tags: string[], note?: string): string {
  for (const tag of tags) {
    if (TAG_ACTIONS[tag]) return TAG_ACTIONS[tag];
  }

  if (note && note.length > 20) {
    return "Reference something specific from your conversation when you reach out.";
  }

  if (tags.length > 0) {
    return `Follow up about ${tags[0].toLowerCase()}.`;
  }

  return "Send a brief thank-you and mention one thing you discussed.";
}
