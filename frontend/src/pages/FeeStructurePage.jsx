import { useEffect, useState } from "react";
import { apiRequest, getAssetUrl } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/format.js";

const initialForm = {
  tuitionFee: "",
  transportFee: "",
  hostelFee: "",
  admissionFee: "",
  monthLabel: "",
  otherCharges: [{ label: "", amount: "" }]
};

const FeeStructurePage = () => {
  const [form, setForm] = useState(initialForm);
  const [activeStructure, setActiveStructure] = useState(null);
  const [history, setHistory] = useState([]);

  const loadFeeStructure = async () => {
    const response = await apiRequest("/fees/structure");
    setActiveStructure(response.activeStructure);
    setHistory(response.history);
  };

  useEffect(() => {
    loadFeeStructure();
  }, []);

  const updateOtherCharge = (index, field, value) => {
    setForm((current) => ({
      ...current,
      otherCharges: current.otherCharges.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      form.tuitionFee === "" ||
      form.transportFee === "" ||
      form.hostelFee === "" ||
      form.admissionFee === ""
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await apiRequest("/fees/structure", {
        method: "POST",
        body: {
          tuitionFee: Number(form.tuitionFee || 0),
          transportFee: Number(form.transportFee || 0),
          hostelFee: Number(form.hostelFee || 0),
          admissionFee: Number(form.admissionFee || 0),
          monthLabel: form.monthLabel,
          otherCharges: form.otherCharges
            .map((item) => ({
              label: item.label,
              amount: Number(item.amount || 0)
            }))
            .filter((item) => item.label && item.amount > 0)
        }
      });

      toast.success("Fee submitted successfully");
      toast.success(`${response.updatedStudents} students updated for ${response.monthLabel}.`);
      setForm(initialForm);
      await loadFeeStructure();
    } catch (error) {
      toast.error(error.message || "All fields are required");
    }
  };

  const generateMonthlyDues = async () => {
    try {
      const response = await apiRequest("/fees/monthly-dues", {
        method: "POST",
        body: {
          monthLabel: form.monthLabel
        }
      });
      toast.success(`${response.createdDueCount} due entries created for ${response.monthLabel}.`);
    } catch (error) {
      toast.error(error.message || "Unable to generate monthly dues");
    }
  };

  const generateSchoolDueReport = async () => {
    try {
      const response = await apiRequest("/fees/due-report");
      window.open(getAssetUrl(response.pdfPath), "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error.message || "Unable to generate due report");
    }
  };

  return (
    <div>
      <PageHeader
        title="Fee Structure"
        description="Define the school's fee template, automate monthly dues, and generate full-school due reports."
        action={
          <button type="button" className="btn-secondary" onClick={generateSchoolDueReport}>
            Download Due Report
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="panel p-6">
          <h3 className="font-display text-2xl text-brand-900">Manage Fee Structure</h3>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Tuition Fee</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.tuitionFee}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tuitionFee: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Transport Fee</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.transportFee}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, transportFee: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Hostel Fee</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.hostelFee}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, hostelFee: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Admission Fee</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.admissionFee}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, admissionFee: event.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Apply Month Label</label>
                <input
                  className="input"
                  placeholder="Example: April 2026"
                  value={form.monthLabel}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, monthLabel: event.target.value }))
                  }
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
                  Other Charges
                </p>
                <button
                  type="button"
                  className="btn-secondary px-4 py-2"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      otherCharges: [...current.otherCharges, { label: "", amount: "" }]
                    }))
                  }
                >
                  Add Charge
                </button>
              </div>

              {form.otherCharges.map((charge, index) => (
                <div key={`charge-${index}`} className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <input
                    className="input"
                    placeholder="Charge label"
                    value={charge.label}
                    onChange={(event) =>
                      updateOtherCharge(index, "label", event.target.value)
                    }
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="Amount"
                    value={charge.amount}
                    onChange={(event) =>
                      updateOtherCharge(index, "amount", event.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary">
                Save Structure And Apply
              </button>
              <button type="button" className="btn-secondary" onClick={generateMonthlyDues}>
                Generate Monthly Dues
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="panel p-6">
            <h3 className="font-display text-2xl text-brand-900">Active Structure</h3>
            {activeStructure ? (
              <div className="mt-4 space-y-3 text-sm text-brand-700">
                <p>Version: {activeStructure.version}</p>
                <p>Tuition Fee: {formatCurrency(activeStructure.tuitionFee)}</p>
                <p>Transport Fee: {formatCurrency(activeStructure.transportFee)}</p>
                <p>Hostel Fee: {formatCurrency(activeStructure.hostelFee)}</p>
                <p>Admission Fee: {formatCurrency(activeStructure.admissionFee)}</p>
                <div className="rounded-2xl bg-brand-50 p-4">
                  <p className="font-semibold text-brand-900">Other Charges</p>
                  {activeStructure.otherCharges?.length ? (
                    activeStructure.otherCharges.map((item, index) => (
                      <p key={`${item.label}-${index}`}>
                        {item.label}: {formatCurrency(item.amount)}
                      </p>
                    ))
                  ) : (
                    <p>No custom charges saved.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-brand-700">No active fee structure yet.</p>
            )}
          </div>

          <div className="panel p-6">
            <h3 className="font-display text-2xl text-brand-900">Recent Versions</h3>
            <div className="table-wrap mt-5">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Updated</th>
                    <th>Tuition</th>
                    <th>Transport</th>
                    <th>Hostel</th>
                    <th>Admission</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length ? (
                    history.map((item) => (
                      <tr key={item._id} className="border-t border-brand-50">
                        <td>{item.version}</td>
                        <td>{formatDate(item.updatedAt)}</td>
                        <td>{formatCurrency(item.tuitionFee)}</td>
                        <td>{formatCurrency(item.transportFee)}</td>
                        <td>{formatCurrency(item.hostelFee)}</td>
                        <td>{formatCurrency(item.admissionFee)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-brand-700">
                        No fee structure history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeeStructurePage;
