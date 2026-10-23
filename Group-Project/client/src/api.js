// Thin wrapper around the Express API.
const BASE = "/api/expenses";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Request failed (${res.status})`);
  return body;
}

export const getExpenses = () => request(BASE);
export const createExpense = (data) =>
  request(BASE, { method: "POST", body: JSON.stringify(data) });
export const updateExpense = (id, data) =>
  request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteExpense = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
