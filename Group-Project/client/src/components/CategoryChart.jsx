import { CATEGORIES, money, totalsByCategory } from "../utils.js";

export default function CategoryChart({ expenses }) {
  const totals = totalsByCategory(expenses);
  const max = Math.max(...Object.values(totals), 1);

  return (
    <section className="panel" id="analytics">
      <h2>Spending by Category</h2>
      <div>
        {CATEGORIES.map((c) => (
          <div className="bar-row" key={c}>
            <span>{c}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(totals[c] / max) * 100}%` }}></div>
            </div>
            <strong>{money(totals[c])}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
