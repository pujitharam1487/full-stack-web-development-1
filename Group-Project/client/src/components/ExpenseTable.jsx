import { useMemo, useState } from "react";
import { CATEGORIES, HIGH_AMOUNT, money } from "../utils.js";

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses
      .filter((e) => e.title.toLowerCase().includes(q) && (!category || e.category === category))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search, category]);

  return (
    <section className="panel" id="expenses">
      <div className="panel-head">
        <h2>Expenses</h2>
        <div className="filters">
          <input
            type="search"
            placeholder="Search title..."
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
          />
          <select value={category} onChange={(ev) => setCategory(ev.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th className="num">Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e._id}>
                <td>{e.date}</td>
                <td>{e.title}</td>
                <td><span className="badge">{e.category}</span></td>
                <td className={`num${e.amount >= HIGH_AMOUNT ? " high" : ""}`}>{money(e.amount)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => onEdit(e)}>Edit</button>{" "}
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(e._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="empty">No expenses found.</p>}
    </section>
  );
}
