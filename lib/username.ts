export function normalizeUsername(username: string): string {
  return username.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9_]/g, "");
}

export function validateUsername(username: string): string | null {
  const normalized = normalizeUsername(username);
  if (!normalized) return "Username is required.";
  if (normalized.length < 3) return "Username must be at least 3 characters.";
  if (normalized.length > 30) return "Username must be 30 characters or less.";
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return "Username can only contain letters, numbers, and underscores.";
  }
  return null;
}
