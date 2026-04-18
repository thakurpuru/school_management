import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const LoginPage = () => {
  const { admin, login } = useAuth();
  const [form, setForm] = useState({
    email: "admin@school.com",
    password: "admin123"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form.email, form.password);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="panel grid w-full max-w-5xl overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-[linear-gradient(180deg,#31473a_0%,#52734d_55%,#bc6c25_100%)] p-10 text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-white/80">
            Admin Portal
          </p>
          <h1 className="mt-6 font-display text-4xl">School Management System</h1>
          <p className="mt-5 max-w-md leading-7 text-white/90">
            Sign in to manage students, fees, receipts, teachers, staff records,
            and salary slips from a single session-protected admin dashboard.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="font-display text-3xl text-brand-900">Admin Login</h2>
          <p className="mt-2 text-sm text-brand-700">
            Use the default admin credentials from the backend environment.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Signing In..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
