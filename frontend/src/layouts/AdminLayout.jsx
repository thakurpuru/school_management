import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/fees", label: "Fees" },
  { to: "/admin/fee-structure", label: "Fee Structure" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin/staff", label: "Staff" },
  { to: "/admin/salaries", label: "Salaries" }
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr]">
        <aside className="panel p-6">
          <div className="border-b border-brand-100 pb-6">
            <h1 className="font-display text-2xl text-brand-900">School Admin</h1>
            <p className="mt-2 text-sm text-brand-700">{admin?.name}</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-brand-500 text-white"
                      : "text-brand-700 hover:bg-brand-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button type="button" className="btn-secondary mt-8 w-full" onClick={logout}>
            Logout
          </button>
        </aside>

        <main className="space-y-6 py-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
