const LINKS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "add", label: "Add Expense" },
  { id: "expenses", label: "Expenses" },
  { id: "analytics", label: "Analytics" }
];

export default function Sidebar({ open, active, onNavigate, onClose }) {
  return (
    <>
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">ET</span>
          <span className="brand-name">SpendWise</span>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`nav-link${active === link.id ? " active" : ""}`}
              onClick={() => onNavigate(link.id)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
      <div className={`overlay${open ? " show" : ""}`} onClick={onClose}></div>
    </>
  );
}
