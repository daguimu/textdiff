export interface Snapshot {
  left: string;
  right: string;
}

export const MAX_HISTORY = 200;

export function appendSnapshot(
  history: Snapshot[],
  snapshot: Snapshot,
  maxEntries = MAX_HISTORY
): Snapshot[] {
  const limit = Math.max(1, maxEntries);
  const last = history[history.length - 1];

  if (last && last.left === snapshot.left && last.right === snapshot.right) {
    return history;
  }

  if (history.length < limit) {
    return [...history, snapshot];
  }

  return [...history.slice(history.length - limit + 1), snapshot];
}
