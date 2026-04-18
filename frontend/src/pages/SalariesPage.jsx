import { useEffect, useState } from "react";
import { apiRequest, getAssetUrl } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/format.js";

const initialSalary = {
  employeeModel: "Teacher",
  employeeId: "",
  monthLabel: "",
  amount: "",
  note: ""
};

const SalariesPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [form, setForm] = useState(initialSalary);

  const loadDependencies = async () => {
    const [teacherData, staffData, salaryData] = await Promise.all([
      apiRequest("/teachers"),
      apiRequest("/staff"),
      apiRequest("/salaries")
    ]);

    setTeachers(teacherData);
    setStaffMembers(staffData);
    setSalaryHistory(salaryData);
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  const employeeOptions =
    form.employeeModel === "Teacher" ? teachers : staffMembers;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.employeeId || !form.monthLabel || !form.amount) {
      toast.error("All fields are required");
      return;
    }

    try {
      await apiRequest("/salaries", {
        method: "POST",
        body: {
          ...form,
          amount: Number(form.amount || 0)
        }
      });
      toast.success("Record added successfully");
      setForm(initialSalary);
      await loadDependencies();
    } catch (error) {
      toast.error(error.message || "Amount cannot be empty");
    }
  };

  return (
    <div>
      <PageHeader
        title="Salaries"
        description="Record monthly salary payments and generate printable salary slips for teachers and staff."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="panel p-6">
          <h3 className="font-display text-2xl text-brand-900">Pay Salary</h3>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label">Employee Type</label>
              <select
                className="input"
                value={form.employeeModel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    employeeModel: event.target.value,
                    employeeId: ""
                  }))
                }
              >
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="label">Employee</label>
              <select
                className="input"
                value={form.employeeId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, employeeId: event.target.value }))
                }
                required
              >
                <option value="">Select employee</option>
                {employeeOptions.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Month Label</label>
              <input
                className="input"
                placeholder="Example: April 2026"
                value={form.monthLabel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, monthLabel: event.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="label">Amount</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: event.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="label">Note</label>
              <textarea
                className="input min-h-28"
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({ ...current, note: event.target.value }))
                }
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Record Salary Payment
            </button>
          </form>
        </section>

        <section className="panel p-6">
          <h3 className="font-display text-2xl text-brand-900">Salary History</h3>
          <div className="table-wrap mt-5">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Slip</th>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {salaryHistory.length ? (
                  salaryHistory.map((entry) => (
                    <tr key={entry._id} className="border-t border-brand-50">
                      <td>{entry.slipNumber}</td>
                      <td>{entry.employeeId?.name || "-"}</td>
                      <td>{entry.employeeId?.role || entry.employeeModel}</td>
                      <td>{entry.monthLabel}</td>
                      <td>{formatCurrency(entry.amount)}</td>
                      <td>{formatDate(entry.paymentDate)}</td>
                      <td>
                        <a
                          className="text-brand-700 underline"
                          href={getAssetUrl(entry.pdfPath)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-brand-700">
                      No salary payments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalariesPage;
