import { describe, expect, it } from "vitest";
import { personCreateSchema, personUpdateSchema } from "../../src/services/validate-person.js";

describe("personCreateSchema", () => {
  it("accepts a complete valid person", () => {
    const r = personCreateSchema.safeParse({ name: "Alice", age: 30, email: "alice@example.com" });
    expect(r.success).toBe(true);
    expect(r.data.email).toBe("alice@example.com");
  });

  it("lowercases and trims email", () => {
    const r = personCreateSchema.safeParse({ name: "Alice", age: 30, email: "  Alice@Example.COM  " });
    expect(r.success).toBe(true);
    expect(r.data.email).toBe("alice@example.com");
  });

  it("rejects empty name", () => {
    expect(personCreateSchema.safeParse({ name: "", age: 30, email: "a@b.c" }).success).toBe(false);
  });

  it("rejects out-of-range age", () => {
    expect(personCreateSchema.safeParse({ name: "x", age: -1, email: "a@b.c" }).success).toBe(false);
    expect(personCreateSchema.safeParse({ name: "x", age: 200, email: "a@b.c" }).success).toBe(false);
    expect(personCreateSchema.safeParse({ name: "x", age: 30.5, email: "a@b.c" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(personCreateSchema.safeParse({ name: "x", age: 30, email: "no-at" }).success).toBe(false);
  });
});

describe("personUpdateSchema", () => {
  it("accepts a partial update", () => {
    expect(personUpdateSchema.safeParse({ age: 31 }).success).toBe(true);
  });
  it("rejects empty body", () => {
    expect(personUpdateSchema.safeParse({}).success).toBe(false);
  });
  it("re-validates supplied fields", () => {
    expect(personUpdateSchema.safeParse({ age: -1 }).success).toBe(false);
  });
});
