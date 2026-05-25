import { Router } from "express";
import { personCreateSchema, personUpdateSchema } from "../services/validate-person.js";
import { isValidObjectId } from "../middleware/validate-object-id.js";

export function buildPersonsRouter({ PersonModel }) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const limit = clamp(Number(req.query.limit) || 50, 1, 200);
      const offset = clamp(Number(req.query.offset) || 0, 0, Number.MAX_SAFE_INTEGER);
      const [items, total] = await Promise.all([
        PersonModel.find().sort({ createdAt: -1 }).skip(offset).limit(limit),
        PersonModel.countDocuments(),
      ]);
      res.json({
        items: items.map((d) => d.toJSON()),
        total,
        limit,
        offset,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    const parsed = personCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation failed", issues: parsed.error.issues });
    }
    try {
      const doc = await PersonModel.create(parsed.data);
      res.status(201).json(doc.toJSON());
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({ error: "email already exists" });
      }
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "invalid id" });
    }
    try {
      const doc = await PersonModel.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: "not found" });
      res.json(doc.toJSON());
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "invalid id" });
    }
    const parsed = personUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation failed", issues: parsed.error.issues });
    }
    try {
      const doc = await PersonModel.findByIdAndUpdate(req.params.id, parsed.data, {
        new: true,
        runValidators: true,
      });
      if (!doc) return res.status(404).json({ error: "not found" });
      res.json(doc.toJSON());
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({ error: "email already exists" });
      }
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "invalid id" });
    }
    try {
      const doc = await PersonModel.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: "not found" });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}
