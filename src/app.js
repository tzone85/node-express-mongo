import express from "express";
import { buildPersonsRouter } from "./routes/persons.js";
import { buildPersonModel } from "./models/person.js";

/**
 * Composition root. Tests pass `{ PersonModel }` to skip mongoose entirely
 * (using a mock); production builds the model from a real connection.
 */
export function createApp({ PersonModel, logger = console } = {}) {
  const Person = PersonModel ?? buildPersonModel();
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.use((req, _res, next) => {
    logger.info?.(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get("/", (_req, res) => res.json({ service: "node-express-mongo", version: "1.0.0" }));
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/persons", buildPersonsRouter({ PersonModel: Person }));

  app.use((_req, res) => res.status(404).json({ error: "not found" }));
  app.use((err, _req, res, _next) => {
    logger.error?.("unhandled error", err);
    res.status(500).json({ error: "internal server error" });
  });

  return app;
}
