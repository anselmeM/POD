// ============================================================
// JSON-string column serialization
// SQLite stores arrays/objects as JSON strings (see schema.prisma).
// These helpers convert raw DB rows into the shapes in lib/types.ts.
// ============================================================

export function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string") {
    return (raw ?? fallback) as T;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function serializeExperiment(row: Record<string, unknown>) {
  return { ...row, channel: parseJson<unknown[]>(row.channel, []) };
}

export function serializeLead(row: Record<string, unknown>) {
  return { ...row, events: parseJson<string[]>(row.events, []) };
}

export function serializeSignalEvent(row: Record<string, unknown>) {
  return { ...row, metadata: parseJson<Record<string, unknown>>(row.metadata, {}) };
}

export function serializeInsight(row: Record<string, unknown>) {
  return { ...row, evidence: parseJson<string[]>(row.evidence, []) };
}
