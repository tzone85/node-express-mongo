import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { buildPersonModel } from "../../src/models/person.js";

let mongod;
let PersonModel;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  PersonModel = buildPersonModel();
  app = createApp({ PersonModel, logger: { error: () => {}, info: () => {} } });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod?.stop();
});

beforeEach(async () => {
  await PersonModel.deleteMany({});
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const r = await request(app).get("/health");
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/persons", () => {
  it("creates a person and returns 201 with id", async () => {
    const r = await request(app)
      .post("/api/persons")
      .send({ name: "Alice", age: 30, email: "alice@example.com" });
    expect(r.status).toBe(201);
    expect(r.body.id).toBeDefined();
    expect(r.body.name).toBe("Alice");
    expect(r.body.email).toBe("alice@example.com");
    expect(r.body._id).toBeUndefined();
  });

  it("rejects invalid body", async () => {
    const r = await request(app).post("/api/persons").send({ name: "", age: -1, email: "no" });
    expect(r.status).toBe(400);
  });

  it("rejects duplicate email with 409", async () => {
    const body = { name: "A", age: 20, email: "dup@example.com" };
    await request(app).post("/api/persons").send(body);
    const r = await request(app).post("/api/persons").send(body);
    expect(r.status).toBe(409);
  });
});

describe("GET /api/persons", () => {
  it("returns a paginated list", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/persons").send({ name: `P${i}`, age: 20 + i, email: `p${i}@example.com` });
    }
    const r = await request(app).get("/api/persons?limit=2&offset=1");
    expect(r.status).toBe(200);
    expect(r.body.items).toHaveLength(2);
    expect(r.body.total).toBe(5);
    expect(r.body.limit).toBe(2);
    expect(r.body.offset).toBe(1);
  });
});

describe("GET /api/persons/:id", () => {
  it("returns the person", async () => {
    const created = await request(app)
      .post("/api/persons")
      .send({ name: "A", age: 20, email: "a@example.com" });
    const r = await request(app).get(`/api/persons/${created.body.id}`);
    expect(r.status).toBe(200);
    expect(r.body.id).toBe(created.body.id);
  });

  it("400 on malformed id", async () => {
    const r = await request(app).get("/api/persons/not-an-objectid");
    expect(r.status).toBe(400);
  });

  it("404 on unknown id", async () => {
    const fake = new mongoose.Types.ObjectId().toString();
    const r = await request(app).get(`/api/persons/${fake}`);
    expect(r.status).toBe(404);
  });
});

describe("PATCH /api/persons/:id", () => {
  it("partial update succeeds", async () => {
    const c = await request(app)
      .post("/api/persons")
      .send({ name: "A", age: 20, email: "a@example.com" });
    const r = await request(app).patch(`/api/persons/${c.body.id}`).send({ age: 99 });
    expect(r.status).toBe(200);
    expect(r.body.age).toBe(99);
    expect(r.body.name).toBe("A");
  });

  it("400 on empty body", async () => {
    const c = await request(app)
      .post("/api/persons")
      .send({ name: "A", age: 20, email: "a@example.com" });
    const r = await request(app).patch(`/api/persons/${c.body.id}`).send({});
    expect(r.status).toBe(400);
  });

  it("404 on unknown id", async () => {
    const fake = new mongoose.Types.ObjectId().toString();
    const r = await request(app).patch(`/api/persons/${fake}`).send({ age: 99 });
    expect(r.status).toBe(404);
  });

  it("409 on duplicate email", async () => {
    await request(app).post("/api/persons").send({ name: "A", age: 20, email: "shared@example.com" });
    const c = await request(app).post("/api/persons").send({ name: "B", age: 21, email: "uniq@example.com" });
    const r = await request(app).patch(`/api/persons/${c.body.id}`).send({ email: "shared@example.com" });
    expect(r.status).toBe(409);
  });
});

describe("DELETE /api/persons/:id", () => {
  it("deletes and 204s", async () => {
    const c = await request(app)
      .post("/api/persons")
      .send({ name: "A", age: 20, email: "a@example.com" });
    const r = await request(app).delete(`/api/persons/${c.body.id}`);
    expect(r.status).toBe(204);
    const g = await request(app).get(`/api/persons/${c.body.id}`);
    expect(g.status).toBe(404);
  });

  it("404 on unknown id", async () => {
    const fake = new mongoose.Types.ObjectId().toString();
    const r = await request(app).delete(`/api/persons/${fake}`);
    expect(r.status).toBe(404);
  });
});

describe("404 elsewhere", () => {
  it("returns JSON 404", async () => {
    const r = await request(app).get("/whatever");
    expect(r.status).toBe(404);
    expect(r.body.error).toBe("not found");
  });
});
