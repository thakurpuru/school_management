import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { toast } from "react-toastify";
import { formatCurrency } from "../utils/format.js";

const initialTeacher = {
  name: "",
  role: "",
  subject: "",
  salary: "",
  contact: "",
  address: ""
};

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(initialTeacher);
  const [editingId, setEditingId] = useState(null);

  const loadTeachers = async () => {
    const response = await apiRequest("/teachers");
    setTeachers(response);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiRequest(editingId ? `/teachers/${editingId}` : "/teachers", {
        method: editingId ? "PUT" : "POST",
        body: { ...form, salary: Number(form.salary || 0) }
      });
      toast.success("Record saved successfully");
      setForm(initialTeacher);
      setEditingId(null);
      await loadTeachers();
    } catch (error) {
      toast.error(error.message || "All fields are required");
    }
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher._id);
    setForm({
      name: teacher.name,
      role: teacher.role,
      subject: teacher.subject,
      salary: teacher.salary,
      contact: teacher.contact,
      address: teacher.address
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await apiRequest(`/teachers/${id}`, { method: "DELETE" });
      toast.success("Record deleted successfully");
      await loadTeachers();
    } catch (error) {
      toast.error(error.message || "Unable to delete record");
    }
  };

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Create and maintain teacher records with role, subject, salary, and contact details."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <h3 className="font-display text-2xl text-brand-900">
            {editingId ? "Update Teacher" : "Add Teacher"}
          </h3>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {["name", "role", "subject", "contact", "address"].map((field) => (
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
                  required={field !== "subject" && field !== "address"}
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
                {editingId ? "Update Teacher" : "Add Teacher"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setForm(initialTeacher);
                  setEditingId(null);
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="panel p-6">
          <h3 className="font-display text-2xl text-brand-900">Teacher Directory</h3>
          <div className="table-wrap mt-5">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Subject</th>
                  <th>Salary</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length ? (
                  teachers.map((teacher) => (
                    <tr key={teacher._id} className="border-t border-brand-50">
                      <td>{teacher.name}</td>
                      <td>{teacher.role}</td>
                      <td>{teacher.subject || "-"}</td>
                      <td>{formatCurrency(teacher.salary)}</td>
                      <td>{teacher.contact}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn-secondary px-3 py-2"
                            onClick={() => handleEdit(teacher)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDelete(teacher._id)}
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
                      No teachers added yet.
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

export default TeachersPage;
