import { useEffect, useState } from "react";
import { CATEGORIES, todayISO, validateExpense } from "../utils.js";

const emptyForm = () => ({ title: "", amount: "", category: CATEGORIES[0], date: todayISO() });

export default function ExpenseForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(
      editing
        ? {
            title: editing.title,
            amount: String(editing.amount),
            category: editing.category,
            date: editing.date
          }
        : emptyForm()
    );
    setError("");
  }, [editing]);

  const update = (field) => (ev) => setForm((f) => ({ ...f, [field]: ev.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const problem = validateExpense(form);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    const serverError = await onSave({
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date
    });
    setSaving(false);
    if (serverError) {
      setError(serverError);
    } else {
      setForm(emptyForm());
      setError("");
    }
  };

  return (
    <section className="panel" id="add">
      <h2>{editing ? "Edit Expense" : "Add Expense"}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <label>
            Title
            <input type="text" placeholder="e.g. Lunch" value={form.title} onChange={update("title")} />
          </label>
          <label>
            Amount (₹)
            <input type="number" min="1" step="1" value={form.amount} onChange={update("amount")} />
          </label>
          <label>
            Category
            <select value={form.category} onChange={update("category")}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={form.date} onChange={update("date")} />
          </label>
        </div>
        <p className="error" role="alert">{error}</p>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add Expense"}
          </button>
          {editing && (
            <button className="btn btn-ghost" type="button" onClick={onCancel}>
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
