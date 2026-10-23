const mongoose = require("mongoose");

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Health", "Other"];

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 100 },
    amount: { type: Number, required: [true, "Amount is required"], min: [1, "Amount must be at least 1"] },
    category: { type: String, enum: CATEGORIES, default: "Other" },
    // stored as "YYYY-MM-DD" to match the date input on the client
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
module.exports.CATEGORIES = CATEGORIES;
