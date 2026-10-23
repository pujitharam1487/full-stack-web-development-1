import { CATEGORIES, money, totalsByCategory } from "../utils.js";

export default function StatsCards({ expenses }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const totals = totalsByCategory(expenses);
  const top = CATEGORIES.reduce((a, b) => (totals[b] > totals[a] ? b : a), CATEGORIES[0]);

  const cards = [
    { label: "Total Spent", value: money(total) },
    { label: "Transactions", value: expenses.length },
    { label: "Average Expense", value: expenses.length ? money(total / expenses.length) : "₹0" },
    { label: "Top Category", value: expenses.length ? top : "-" }
  ];

  return (
    <section className="stats" id="dashboard" aria-label="Summary">
      {cards.map((c) => (
        <article className="stat-card" key={c.label}>
          <p className="stat-label">{c.label}</p>
          <p className="stat-value">{c.value}</p>
        </article>
      ))}
    </section>
  );
}
