import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { apiRequest, getAssetUrl } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/format.js";

const initialForm = {
  personalDetails: {
    studentName: "",
    fatherName: "",
    motherName: "",
    aadharNumber: ""
  },
  academicDetails: {
    className: "",
    section: "",
    admissionDate: ""
  },
  contactDetails: {
    address: "",
    phoneNumber: ""
  },
  facilityType: "none",
  feeSummary: {
    admissionFee: "",
    tuitionFee: "",
    transportFee: "",
    hostelFee: "",
    otherCharges: ""
  }
};

const isValidAadhar = (value = "") => /^\d{12}$/.test(String(value).trim());

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeHistory, setFeeHistory] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);

  const loadStudents = async (search = "") => {
    const response = await apiRequest(
      `/students${search ? `?search=${encodeURIComponent(search)}` : ""}`
    );
    startTransition(() => setStudents(response));
  };

  const loadStudentDetails = async (studentId) => {
    const response = await apiRequest(`/students/${studentId}`);
    setSelectedStudent(response.student);
    setFeeHistory(response.feeHistory);
  };

  useEffect(() => {
    loadStudents(deferredSearch);
  }, [deferredSearch]);

  const handleNestedChange = (group, field, value) => {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value
      }
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const endpoint = editingId ? `/students/${editingId}` : "/students";
    const method = editingId ? "PUT" : "POST";

    const requiredFields = [
      form.personalDetails.studentName,
      form.personalDetails.fatherName,
      form.personalDetails.motherName,
      form.personalDetails.aadharNumber,
      form.academicDetails.className,
      form.academicDetails.section,
      form.academicDetails.admissionDate,
      form.contactDetails.address,
      form.contactDetails.phoneNumber,
      form.facilityType
    ];

    if (requiredFields.some((field) => !String(field || "").trim())) {
      toast.error("All fields are required");
      return;
    }

    if (!isValidAadhar(form.personalDetails.aadharNumber)) {
      toast.error("Invalid Aadhar number");
      return;
    }

    try {
      await apiRequest(endpoint, {
        method,
        body: {
          ...form,
          feeSummary: {
            admissionFee: Number(form.feeSummary.admissionFee || 0),
            tuitionFee: Number(form.feeSummary.tuitionFee || 0),
            transportFee:
              form.facilityType === "transport"
                ? Number(form.feeSummary.transportFee || 0)
                : 0,
            hostelFee:
              form.facilityType === "hosteler"
                ? Number(form.feeSummary.hostelFee || 0)
                : 0,
            otherCharges: Number(form.feeSummary.otherCharges || 0)
          }
        }
      });

      toast.success(
        editingId ? "Student updated successfully" : "Student added successfully"
      );
      resetForm();
      await loadStudents(deferredSearch);
    } catch (error) {
      toast.error(error.message || "All fields are required");
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      personalDetails: student.personalDetails,
      academicDetails: {
        ...student.academicDetails,
        admissionDate: student.academicDetails.admissionDate?.slice(0, 10)
      },
      contactDetails: student.contactDetails,
      facilityType: student.facilityType || "none",
      feeSummary: {
        admissionFee: student.feeSummary.admissionFee,
        tuitionFee: student.feeSummary.tuitionFee,
        transportFee: student.feeSummary.transportFee,
        hostelFee: student.feeSummary.hostelFee,
        otherCharges: student.feeSummary.otherCharges
      }
    });
  };

  const handleDelete = async (studentId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await apiRequest(`/students/${studentId}`, { method: "DELETE" });
      toast.success("Record deleted successfully");
    } catch (error) {
      toast.error(error.message || "Unable to delete record");
      return;
    }

    if (selectedStudent?._id === studentId) {
      setSelectedStudent(null);
      setFeeHistory([]);
    }
    await loadStudents(deferredSearch);
  };

  const handleAutoUpgrade = async () => {
    try {
      const response = await apiRequest("/students/auto-upgrade", { method: "POST" });
      toast.success(`${response.upgradedCount} students upgraded automatically`);
      await loadStudents(deferredSearch);
    } catch (error) {
      toast.error(error.message || "Unable to upgrade students");
    }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        description="Maintain personal, academic, contact, and admission fee details in a clean student register."
        action={
          <button type="button" className="btn-secondary" onClick={handleAutoUpgrade}>
            Run Yearly Upgrade
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="font-display text-2xl text-brand-900">Student List</h3>
            <input
              className="input max-w-sm"
              placeholder="Search by name, Aadhar, phone, or ID"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <div className="table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Total Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length ? (
                  students.map((student) => (
                    <tr key={student._id} className="border-t border-brand-50">
                      <td>{student.studentId}</td>
                      <td>{student.personalDetails.studentName}</td>
                      <td>
                        {student.academicDetails.className} - {student.academicDetails.section}
                      </td>
                      <td>{formatCurrency(student.feeSummary.totalDue)}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn-secondary px-3 py-2"
                            onClick={() => loadStudentDetails(student._id)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btn-secondary px-3 py-2"
                            onClick={() => handleEdit(student)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDelete(student._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-brand-700">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="panel p-6">
            <h3 className="font-display text-2xl text-brand-900">
              {editingId ? "Update Student" : "Add Student"}
            </h3>
            <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
                  Personal Details
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">Student Name</label>
                    <input
                      className="input"
                      value={form.personalDetails.studentName}
                      onChange={(event) =>
                        handleNestedChange("personalDetails", "studentName", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Father's Name</label>
                    <input
                      className="input"
                      value={form.personalDetails.fatherName}
                      onChange={(event) =>
                        handleNestedChange("personalDetails", "fatherName", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Mother's Name</label>
                    <input
                      className="input"
                      value={form.personalDetails.motherName}
                      onChange={(event) =>
                        handleNestedChange("personalDetails", "motherName", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Aadhar Number</label>
                    <input
                      className="input"
                      value={form.personalDetails.aadharNumber}
                      onChange={(event) =>
                        handleNestedChange("personalDetails", "aadharNumber", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
                  Academic Details
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="label">Class</label>
                    <input
                      className="input"
                      value={form.academicDetails.className}
                      onChange={(event) =>
                        handleNestedChange("academicDetails", "className", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Section</label>
                    <input
                      className="input"
                      value={form.academicDetails.section}
                      onChange={(event) =>
                        handleNestedChange("academicDetails", "section", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Admission Date</label>
                    <input
                      className="input"
                      type="date"
                      value={form.academicDetails.admissionDate}
                      onChange={(event) =>
                        handleNestedChange("academicDetails", "admissionDate", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
                  Contact Details
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      className="input"
                      value={form.contactDetails.phoneNumber}
                      onChange={(event) =>
                        handleNestedChange("contactDetails", "phoneNumber", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <input
                      className="input"
                      value={form.contactDetails.address}
                      onChange={(event) =>
                        handleNestedChange("contactDetails", "address", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
                  Facility Type
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { value: "hosteler", label: "Hosteler" },
                    { value: "transport", label: "Transport User" },
                    { value: "none", label: "None" }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                        form.facilityType === option.value
                          ? "border-brand-500 bg-brand-50 text-brand-900"
                          : "border-brand-100 bg-white text-brand-700"
                      }`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="facilityType"
                        value={option.value}
                        checked={form.facilityType === option.value}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            facilityType: event.target.value,
                            feeSummary: {
                              ...current.feeSummary,
                              transportFee:
                                event.target.value === "transport"
                                  ? current.feeSummary.transportFee
                                  : "",
                              hostelFee:
                                event.target.value === "hosteler"
                                  ? current.feeSummary.hostelFee
                                  : ""
                            }
                          }))
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">
                  Fee Details At Admission
                </p>
                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <label className="label">Admission Fee</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={form.feeSummary.admissionFee}
                      onChange={(event) =>
                        handleNestedChange("feeSummary", "admissionFee", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Tuition Fee</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={form.feeSummary.tuitionFee}
                      onChange={(event) =>
                        handleNestedChange("feeSummary", "tuitionFee", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Transport Fee</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={form.feeSummary.transportFee}
                      disabled={form.facilityType === "hosteler" || form.facilityType === "none"}
                      onChange={(event) =>
                        handleNestedChange("feeSummary", "transportFee", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Hostel Fee</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={form.feeSummary.hostelFee}
                      disabled={form.facilityType !== "hosteler"}
                      onChange={(event) =>
                        handleNestedChange("feeSummary", "hostelFee", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Other Charges</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={form.feeSummary.otherCharges}
                      onChange={(event) =>
                        handleNestedChange("feeSummary", "otherCharges", event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary">
                  {editingId ? "Update Student" : "Add Student"}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="panel p-6">
            <h3 className="font-display text-2xl text-brand-900">Student Details</h3>
            {selectedStudent ? (
              <div className="mt-5 space-y-4 text-sm text-brand-700">
                <div>
                  <p className="font-semibold text-brand-900">
                    {selectedStudent.personalDetails.studentName}
                  </p>
                  <p>{selectedStudent.studentId}</p>
                </div>
                <p>
                  Class: {selectedStudent.academicDetails.className} -{" "}
                  {selectedStudent.academicDetails.section}
                </p>
                <p>Admission Date: {formatDate(selectedStudent.academicDetails.admissionDate)}</p>
                <p>Father: {selectedStudent.personalDetails.fatherName}</p>
                <p>Mother: {selectedStudent.personalDetails.motherName}</p>
                <p>Aadhar: {selectedStudent.personalDetails.aadharNumber}</p>
                <p className="capitalize">Facility: {selectedStudent.facilityType}</p>
                <p>Phone: {selectedStudent.contactDetails.phoneNumber}</p>
                <p>Address: {selectedStudent.contactDetails.address}</p>
                <p>Total Paid: {formatCurrency(selectedStudent.feeSummary.totalPaid)}</p>
                <p>Total Due: {formatCurrency(selectedStudent.feeSummary.totalDue)}</p>
                <p>Transport Fee: {formatCurrency(selectedStudent.feeSummary.transportFee)}</p>
                <p>Hostel Fee: {formatCurrency(selectedStudent.feeSummary.hostelFee)}</p>

                <div className="rounded-2xl bg-brand-50 p-4">
                  <p className="font-semibold text-brand-900">Fee History</p>
                  <div className="mt-3 space-y-3">
                    {feeHistory.length ? (
                      feeHistory.map((item) => (
                        <div
                          key={item._id}
                          className="rounded-2xl border border-brand-100 bg-white px-4 py-3"
                        >
                          <div className="flex flex-col gap-1 text-sm">
                            <span className="capitalize">{item.entryKind}</span>
                            <span>{item.receiptId || "Due Entry"}</span>
                            <span>{formatDate(item.paymentDate)}</span>
                            <span>{formatCurrency(item.amount)}</span>
                            {item.pdfPath ? (
                              <a
                                className="text-brand-700 underline"
                                href={getAssetUrl(item.pdfPath)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open Receipt
                              </a>
                            ) : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No fee history yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-brand-700">
                Choose a student from the list to view full details and payment records.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentsPage;
