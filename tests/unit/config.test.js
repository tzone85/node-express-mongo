import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "../../src/config.js";

describe("loadConfig", () => {
  it("uses defaults when nothing is set", () => {
    const c = loadConfig({});
    expect(c.mongoUrl).toMatch(/^mongodb:\/\//);
    expect(c.port).toBe(5000);
    expect(c.logLevel).toBe("info");
  });

  it("accepts a custom MONGO_URL", () => {
    const c = loadConfig({ MONGO_URL: "mongodb://db:27017/x" });
    expect(c.mongoUrl).toBe("mongodb://db:27017/x");
  });

  it("rejects an invalid MONGO_URL", () => {
    expect(() => loadConfig({ MONGO_URL: "not-a-url" })).toThrow(ConfigError);
  });

  it("PORT must be numeric", () => {
    expect(() => loadConfig({ PORT: "not-a-port" })).toThrow(ConfigError);
    expect(loadConfig({ PORT: "8080" }).port).toBe(8080);
  });

  it("LOG_LEVEL must be one of the allowed values", () => {
    expect(() => loadConfig({ LOG_LEVEL: "yelling" })).toThrow(ConfigError);
    expect(loadConfig({ LOG_LEVEL: "debug" }).logLevel).toBe("debug");
  });
});
