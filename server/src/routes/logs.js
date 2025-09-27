// src/routes/logs.js
import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * GET /api/logs
 * Query params:
 *  - radio (partial match)
 *  - from (YYYY-MM-DD)
 *  - to   (YYYY-MM-DD)
 *  - status (online|offline)
 *  - page (1-based)
 *  - limit
 *
 * Response:
 * { data: [...], meta: { total, page, limit, totalPages } }
 */
router.get("/", async (req, res) => {
  try {
    // Read query params
    const { radio, from, to, status } = req.query;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 500);
    const offset = (page - 1) * limit;

    // Build WHERE conditions and params safely
    const conditions = [];
    const params = [];

    if (radio) {
      conditions.push("radio LIKE ?");
      params.push(`%${radio}%`);
    }

    if (status) {
      // basic validation to avoid crazy values
      if (status !== "online" && status !== "offline") {
        return res.status(400).json({ error: "status must be 'online' or 'offline'" });
      }
      conditions.push("status = ?");
      params.push(status);
    }

    if (from) {
      // Expect from as YYYY-MM-DD
      conditions.push("date_time >= ?");
      params.push(`${from} 00:00:00`);
    }

    if (to) {
      conditions.push("date_time <= ?");
      params.push(`${to} 23:59:59`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total for pagination meta
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM logs ${where}`, params);
    const total = countRows[0]?.total ?? 0;

    // Fetch page of rows
    // Append limit and offset to params
    const [rows] = await pool.query(
      `SELECT id, date_time, radio, status, issue FROM logs ${where} ORDER BY date_time DESC LIMIT ? OFFSET ?`,
      params.concat([limit, offset])
    );

    res.json({
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/logs error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/logs
 * (keeps your existing insert route)
 * expect body: { date_time, radio, status, issue }
 */
router.post("/", async (req, res) => {
  try {
    const { date_time, radio, status, issue } = req.body;

    // Basic server-side checks (you already have Zod for stricter validation)
    if (!date_time || !radio || !status) {
      return res.status(400).json({ error: "date_time, radio and status are required" });
    }

    const [result] = await pool.execute(
      "INSERT INTO logs (date_time, radio, status, issue) VALUES (?, ?, ?, ?)",
      [date_time, radio, status, issue || null]
    );

    res.status(201).json({ id: result.insertId, message: "Log saved ✅" });
  } catch (err) {
    console.error("POST /api/logs error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;



