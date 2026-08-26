import { describe, it, expect } from "vitest";
import { parseJson, serializeExperiment, serializeLead, serializeSignalEvent, serializeInsight } from "@/lib/serialize";

describe("serialize — parseJson", () => {
  it("parses JSON string", () => {
    expect(parseJson('["a","b"]', [])).toEqual(["a","b"]);
  });
  it("returns fallback on invalid JSON", () => {
    expect(parseJson("not-json", [1])).toEqual([1]);
  });
  it("passes through non-string", () => {
    expect(parseJson(["x"], [])).toEqual(["x"]);
  });
});

describe("serialize — experiment", () => {
  it("parses channel string", () => {
    const row = { id: "1", channel: '["linkedin","meta"]', name: "X" };
    expect(serializeExperiment(row as never).channel).toEqual(["linkedin","meta"]);
  });
});

describe("serialize — lead", () => {
  it("parses events", () => {
    const row = { events: '["page_view"]' };
    expect(serializeLead(row as never).events).toEqual(["page_view"]);
  });
});

describe("serialize — signalEvent", () => {
  it("parses metadata", () => {
    const row = { metadata: '{"foo":"bar"}' };
    expect(serializeSignalEvent(row as never).metadata).toEqual({ foo: "bar" });
  });
});

describe("serialize — insight", () => {
  it("parses evidence", () => {
    const row = { evidence: '["e1"]' };
    expect(serializeInsight(row as never).evidence).toEqual(["e1"]);
  });
});
