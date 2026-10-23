import { useEffect, useState } from "react";
import * as api from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import StatsCards from "./components/StatsCards.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseTable from "./components/ExpenseTable.jsx";
import CategoryChart from "./components/CategoryChart.jsx";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [editing, setEditing] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("dashboard");

  const load = async () => {
    setLoading(true);
    try {
      setExpenses(await api.getExpenses());
      setApiError("");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Returns an error message (or "") so the form can show it.
  const saveExpense = async (values) => {
    try {
      if (editing) {
        const updated = await api.updateExpense(editing._id, values);
        setExpenses((list) => list.map((e) => (e._id === updated._id ? updated : e)));
        setEditing(null);
      } else {
        const created = await api.createExpense(values);
        setExpenses((list) => [created, ...list]);
      }
      return "";
    } catch (err) {
      return err.message;
    }
  };

  const startEdit = (expense) => {
    setEditing(expense);
    document.getElementById("add")?.scrollIntoView();
  };

  const removeExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.deleteExpense(id);
      setExpenses((list) => list.filter((e) => e._id !== id));
      if (editing && editing._id === id) setEditing(null);
    } catch (err) {
      setApiError(err.message);
    }
  };

  const navigate = (id) => {
    setActiveLink(id);
    setMenuOpen(false);
  };

  return (
    <>
      <Sidebar
        open={menuOpen}
        active={activeLink}
        onNavigate={navigate}
        onClose={() => setMenuOpen(false)}
      />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span><span></span><span></span>
          </button>
          <h1 className="topbar-title">Expense Tracker Dashboard</h1>
          <button className="btn btn-ghost" type="button" onClick={load}>
            Refresh
          </button>
        </header>

        <main className="content">
          {apiError && <p className="banner banner-error" role="alert">{apiError}</p>}
          {loading && <p className="banner">Loading expenses…</p>}

          <StatsCards expenses={expenses} />
          <ExpenseForm editing={editing} onSave={saveExpense} onCancel={() => setEditing(null)} />
          <ExpenseTable expenses={expenses} onEdit={startEdit} onDelete={removeExpense} />
          <CategoryChart expenses={expenses} />
        </main>
      </div>
    </>
  );
}
