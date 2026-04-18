import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { toast } from "react-toastify";
import { formatCurrency } from "../utils/format.js";

const initialStaff = {
  name: "",
  role: "",
  department: "",
  salary: "",
  contact: "",
  address: ""
};

const StaffPage = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [form, setForm] = useState(initialStaff);
  const [editingId, setEditingId] = useState(null);

  const loadStaff = async () => {
    const response = await apiRequest("/staff");
    setStaffMembers(response);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiRequest(editingId ? `/staff/${editingId}` : "/staff", {
        method: editingId ? "PUT" : "POST",
        body: { ...form, salary: Number(form.salary || 0) }
      });
      toast.success("Record saved successfully");
      setForm(initialStaff);
      setEditingId(null);
      await loadStaff();
    } catch (error) {
      toast.error(error.message || "All fields are required");
    }
  };

  const handleEdit = (staff) => {
    setEditingId(staff._id);
    setForm({
      name: staff.name,
      role: staff.role,
      department: staff.department,
      salary: staff.salary,
      contact: staff.contact,
      address: staff.address
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await apiRequest(`/staff/${id}`, { method: "DELETE" });
      toast.success("Record deleted successfully");
      await loadStaff();
    } catch (error) {
      toast.error(error.message || "Unable to delete record");
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage non-teaching staff, operations teams, and salary-linked contact records."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <h3 className="font-display text-2xl text-brand-900">
            {editingId ? "Update Staff Member" : "Add Staff Member"}
          </h3>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {["name", "role", "department", "contact", "address"].map((field) => (
              <div key={field}>
                <label className="label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  className="input"
                  value={form[field]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [field]: event.target.value }))
                  }
                  required={field !== "department" && field !== "address"}
                />
              </div>
            ))}
            <div>
              <label className="label">Salary</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.salary}
                onChange={(event) =>
                  setForm((current) => ({ ...current, salary: event.target.value }))
                }
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingId ? "Update Staff" : "Add Staff"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setForm(initialStaff);
                  setEditingId(null);
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="panel p-6">
          <h3 className="font-display text-2xl text-brand-900">Staff Directory</h3>
          <div className="table-wrap mt-5">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.length ? (
                  staffMembers.map((staff) => (
                    <tr key={staff._id} className="border-t border-brand-50">
                      <td>{staff.name}</td>
                      <td>{staff.role}</td>
                      <td>{staff.department || "-"}</td>
                      <td>{formatCurrency(staff.salary)}</td>
                      <td>{staff.contact}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn-secondary px-3 py-2"
                            onClick={() => handleEdit(staff)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDelete(staff._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-brand-700">
                      No staff members added yet.
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

export default StaffPage;
