import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/students/list", label: "Student List" },
  { to: "/admin/students/add", label: "Add Student" },
  { to: "/admin/fees", label: "Fees" },
  { to: "/admin/fee-structure", label: "Fee Structure" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin/staff", label: "Staff" },
  { to: "/admin/salaries", label: "Salaries" }
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="mb-4 border border-brand-100 bg-white shadow-panel">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/logo.jpg"
                alt="School Logo"
                className="h-12 w-12 flex-shrink-0 rounded-full object-contain"
              />
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-semibold text-brand-900">
                  New Shining Star Public School
                </h1>
                <p className="truncate text-xs text-brand-700">
                  Admin Panel{admin?.name ? ` - ${admin.name}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="text-3xl text-brand-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
          </div>
        </div>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-brand-900/35 lg:hidden"
            onClick={closeSidebar}
          />
        ) : null}

        <div className="grid min-h-screen gap-6 lg:grid-cols-[260px_1fr]">
          <aside
            className={`panel fixed inset-y-4 left-4 z-50 w-[min(85vw,320px)] overflow-y-auto p-6 transition-transform duration-300 lg:static lg:w-auto lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
            }`}
          >
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <h2 className="font-display text-xl text-brand-900">Menu</h2>
              <button
                type="button"
                className="text-2xl text-brand-900"
                onClick={closeSidebar}
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

          <div className="border-b border-brand-100 pb-6">
            <h1 className="font-display text-2xl text-brand-900">School Admin</h1>
            <p className="mt-2 text-sm text-brand-700">{admin?.name}</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
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

          <button
            type="button"
            className="btn-secondary mt-8 w-full"
            onClick={() => {
              closeSidebar();
              logout();
            }}
          >
            Logout
          </button>
          </aside>

          <main className="min-w-0 space-y-6 py-2">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
