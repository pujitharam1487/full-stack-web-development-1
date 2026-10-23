const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");

const router = express.Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid expense id" });
  }
  next();
}

// GET /api/expenses?search=&category=
router.get(
  "/",
  wrap(async (req, res) => {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: escaped, $options: "i" };
    }
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  })
);

// POST /api/expenses
router.post(
  "/",
  wrap(async (req, res) => {
    const { title, amount, category, date } = req.body;
    const expense = await Expense.create({ title, amount, category, date });
    res.status(201).json(expense);
  })
);

// PUT /api/expenses/:id
router.put(
  "/:id",
  checkId,
  wrap(async (req, res) => {
    const { title, amount, category, date } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, date },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  })
);

// DELETE /api/expenses/:id
router.delete(
  "/:id",
  checkId,
  wrap(async (req, res) => {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  })
);

module.exports = router;
