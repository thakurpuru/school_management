import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { apiRequest, getAssetUrl } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/format.js";

const initialPayment = {
  studentId: "",
  monthLabel: "",
  lineItems: [
    { feeType: "tuition", label: "Tuition Fee", amount: "" },
    { feeType: "transport", label: "Transport Fee", amount: "" },
    { feeType: "hostel", label: "Hostel Fee", amount: "" },
    { feeType: "admission", label: "Admission Fee", amount: "" },
    { feeType: "other", label: "Other Charges", amount: "" }
  ]
};

const StudentSearch = ({
  searchText,
  onSearchTextChange,
  matches,
  onSelect,
  selectedStudent
}) => (
  <div className="relative">
    <label className="label">Search Student</label>
    <input
      className="input"
      placeholder="Search by name, student ID, or Aadhar number"
      value={searchText}
      onChange={(event) => onSearchTextChange(event.target.value)}
    />

    {searchText && !selectedStudent ? (
      <div className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-brand-100 bg-white shadow-panel">
        {matches.length ? (
          matches.map((student) => (
            <button
              key={student._id}
              type="button"
              className="block w-full border-b border-brand-50 px-4 py-3 text-left transition hover:bg-brand-50"
              onClick={() => onSelect(student)}
            >
              <div className="font-semibold text-brand-900">
                {student.personalDetails.studentName}
              </div>
              <div className="text-xs text-brand-700">
                {student.academicDetails.className} - {student.academicDetails.section} |{" "}
                {student.studentId} | {student.personalDetails.aadharNumber}
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-3 text-sm text-brand-700">No matching students found.</div>
        )}
      </div>
    ) : null}
  </div>
);

const FeesPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState(initialPayment);
  const [history, setHistory] = useState([]);
  const [pendingDues, setPendingDues] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeStructure, setActiveStructure] = useState(null);
  const deferredSearchText = useDeferredValue(searchText);

  const matchingStudents = useMemo(() => {
    const query = deferredSearchText.trim().toLowerCase();

    if (!query) {
      return students.slice(0, 8);
    }

    return students
      .filter((student) => {
        const name = student.personalDetails.studentName.toLowerCase();
        const studentId = student.studentId.toLowerCase();
        const aadhar = student.personalDetails.aadharNumber.toLowerCase();
        return (
          name.includes(query) || studentId.includes(query) || aadhar.includes(query)
        );
      })
      .slice(0, 8);
  }, [deferredSearchText, students]);

  const paymentTotal = paymentForm.lineItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const previousDue = pendingDues.reduce(
    (sum, item) => sum + Number(item.dueAmount || 0),
    0
  );
  const remainingDue = Math.max(previousDue - paymentTotal, 0);
  const paymentExceedsDue = paymentTotal > previousDue;
  const noPendingDue = selectedStudent ? previousDue <= 0 : false;

  const loadStudents = async () => {
    const response = await apiRequest("/students");
    setStudents(response);
  };

  const loadFeeStructure = async () => {
    const response = await apiRequest("/fees/structure");
    setActiveStructure(response.activeStructure);
  };

  const buildDefaultLineItems = (structure, overview) => {
    const pendingDueEntries = overview?.pendingDues || [];

    if (pendingDueEntries.length) {
      const grouped = new Map();

      pendingDueEntries.forEach((item) => {
        const label = item.lineItems?.[0]?.label || item.feeType;
        const key = `${item.feeType}-${label}`;
        const current = grouped.get(key) || {
          feeType: item.feeType,
          label,
          amount: 0
        };

        current.amount += Number(item.dueAmount || 0);
        grouped.set(key, current);
      });

      return Array.from(grouped.values()).map((item) => ({
        ...item,
        amount: item.amount > 0 ? item.amount : ""
      }));
    }

    const suggested = overview?.suggestedLineItems?.length
      ? overview.suggestedLineItems
      : [
          {
            feeType: "tuition",
            label: "Tuition Fee",
            amount: ""
          },
          {
            feeType: "transport",
            label: "Transport Fee",
            amount: ""
          },
          {
            feeType: "hostel",
            label: "Hostel Fee",
            amount: ""
          },
          {
            feeType: "admission",
            label: "Admission Fee",
            amount: ""
          },
          ...((structure?.otherCharges || []).map((item) => ({
            feeType: "other",
            label: item.label,
            amount: ""
          })))
        ];

    const uniqueItems = new Map();

    suggested.forEach((item) => {
      if (!uniqueItems.has(`${item.feeType}-${item.label}`)) {
        uniqueItems.set(`${item.feeType}-${item.label}`, {
          feeType: item.feeType,
          label: item.label,
          amount: item.amount > 0 ? item.amount : ""
        });
      }
    });

    return Array.from(uniqueItems.values());
  };

  const loadStudentOverview = async (studentId) => {
    const response = await apiRequest(`/fees/${studentId}/overview`);
    setSelectedStudent(response.student);
    setHistory(response.history);
    setPendingDues(response.pendingDues);
    setPaymentForm({
      studentId,
      monthLabel: "",
      lineItems: buildDefaultLineItems(response.feeStructure, response)
    });
  };

  useEffect(() => {
    loadStudents();
    loadFeeStructure();
  }, []);

  const handleSelectStudent = async (student) => {
    setSearchText(
      `${student.personalDetails.studentName} | ${student.academicDetails.className} | ${student.studentId}`
    );
    await loadStudentOverview(student._id);
  };

  const updateLineItem = (index, field, value) => {
    setPaymentForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedStudent || !paymentForm.studentId) {
      toast.error("Please select a student");
      return;
    }

    if (noPendingDue) {
      toast.error("Amount cannot be empty");
      return;
    }

    if (paymentExceedsDue || paymentTotal <= 0) {
      toast.error("Amount cannot be empty");
      return;
    }

    try {
      const response = await apiRequest(`/fees/${paymentForm.studentId}/pay`, {
        method: "POST",
        body: {
          monthLabel: paymentForm.monthLabel,
          lineItems: paymentForm.lineItems.map((item) => ({
            ...item,
            amount: Number(item.amount || 0)
          }))
        }
      });

      toast.success("Fee submitted successfully");
      await loadStudents();
      await loadStudentOverview(response.student._id);
    } catch (error) {
      toast.error(error.message || "Amount cannot be empty");
    }
  };

  const generateDueReport = async (studentId = "") => {
    const endpoint = studentId
      ? `/fees/due-report?studentId=${studentId}`
      : "/fees/due-report";
    try {
      const response = await apiRequest(endpoint);
      window.open(getAssetUrl(response.pdfPath), "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error.message || "Unable to generate due report");
    }
  };

  const paymentHistory = history.filter((item) => item.entryKind === "payment");

  return (
    <div>
      <PageHeader
        title="Fees"
        description="Search students quickly, auto-load dues, accept partial payments, and generate receipts and due reports."
        action={
          <button type="button" className="btn-secondary" onClick={() => generateDueReport()}>
            Download School Due Report
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="panel p-6">
            <h3 className="font-display text-2xl text-brand-900">Pay Fee</h3>
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <StudentSearch
                searchText={searchText}
                onSearchTextChange={(value) => {
                  setSearchText(value);
                  setSelectedStudent(null);
                  setHistory([]);
                  setPendingDues([]);
                  setPaymentForm(initialPayment);
                }}
                matches={matchingStudents}
                onSelect={handleSelectStudent}
                selectedStudent={selectedStudent}
              />

              {selectedStudent ? (
                <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-700">
                  <p className="font-semibold text-brand-900">
                    {selectedStudent.personalDetails.studentName}
                  </p>
                  <p>
                    {selectedStudent.academicDetails.className} -{" "}
                    {selectedStudent.academicDetails.section} | {selectedStudent.studentId}
                  </p>
                  <p className="capitalize">Facility Type: {selectedStudent.facilityType}</p>
                  <p>Total Paid: {formatCurrency(selectedStudent.feeSummary.totalPaid)}</p>
                  <p>Total Due: {formatCurrency(selectedStudent.feeSummary.totalDue)}</p>
                </div>
              ) : null}

              <div>
                <label className="label">Receipt / Month Label</label>
                <input
                  className="input"
                  placeholder="Example: April 2026"
                  value={paymentForm.monthLabel}
                  onChange={(event) =>
                    setPaymentForm((current) => ({
                      ...current,
                      monthLabel: event.target.value
                    }))
                  }
                />
              </div>

              <div className="space-y-3">
                {paymentForm.lineItems.map((item, index) => (
                  <div key={`${item.feeType}-${item.label}-${index}`} className="grid gap-3 md:grid-cols-[1fr_160px]">
                    <div>
                      <label className="label">{item.label}</label>
                      <input
                        className="input"
                        value={item.label}
                        onChange={(event) => updateLineItem(index, "label", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Amount</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(event) => updateLineItem(index, "amount", event.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-brand-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                    Previous Due
                  </p>
                  <p className="mt-2 text-xl text-brand-900">{formatCurrency(previousDue)}</p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                    Current Payment
                  </p>
                  <p className="mt-2 text-xl text-brand-900">{formatCurrency(paymentTotal)}</p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                    Remaining Due
                  </p>
                  <p className="mt-2 text-xl text-brand-900">{formatCurrency(remainingDue)}</p>
                </div>
              </div>

              {paymentExceedsDue && selectedStudent ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Current payment is greater than the student's pending due. Reduce one or more
                  line items before submitting.
                </div>
              ) : null}

              {noPendingDue ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  This student currently has no pending due. Generate monthly dues first or select
                  another student.
                </div>
              ) : null}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={
                  !selectedStudent || paymentExceedsDue || paymentTotal <= 0 || noPendingDue
                }
              >
                Submit Payment
              </button>
            </form>
          </div>

          <div className="panel p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-2xl text-brand-900">Pending Dues</h3>
                <p className="mt-1 text-sm text-brand-700">
                  Live outstanding records loaded from monthly due entries.
                </p>
              </div>
              {selectedStudent ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => generateDueReport(selectedStudent._id)}
                >
                  Download Student Due Report
                </button>
              ) : null}
            </div>

            <div className="table-wrap mt-5">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Type</th>
                    <th>Assigned</th>
                    <th>Paid</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDues.length ? (
                    pendingDues.map((item) => (
                      <tr key={item._id} className="border-t border-brand-50">
                        <td>{item.monthLabel || "-"}</td>
                        <td className="capitalize">{item.feeType}</td>
                        <td>{formatCurrency(item.amount)}</td>
                        <td>{formatCurrency(item.paidAmount)}</td>
                        <td>{formatCurrency(item.dueAmount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-brand-700">
                        No pending dues for the selected student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="panel p-6">
            <h3 className="font-display text-2xl text-brand-900">Current Fee Structure</h3>
            {activeStructure ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-brand-50 p-4">
                  <p>Tuition Fee: {formatCurrency(activeStructure.tuitionFee)}</p>
                  <p>Transport Fee: {formatCurrency(activeStructure.transportFee)}</p>
                  <p>Hostel Fee: {formatCurrency(activeStructure.hostelFee)}</p>
                  <p>Admission Fee: {formatCurrency(activeStructure.admissionFee)}</p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-4">
                  <p className="font-semibold text-brand-900">Other Charges</p>
                  {activeStructure.otherCharges?.length ? (
                    activeStructure.otherCharges.map((item, index) => (
                      <p key={`${item.label}-${index}`}>
                        {item.label}: {formatCurrency(item.amount)}
                      </p>
                    ))
                  ) : (
                    <p>No custom charges defined.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-brand-700">
                No fee structure configured yet. Create one from the Fee Structure page.
              </p>
            )}
          </div>

          <div className="panel p-6">
            <h3 className="font-display text-2xl text-brand-900">Payment History</h3>
            <div className="table-wrap mt-5">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.length ? (
                    paymentHistory.map((item) => (
                      <tr key={item._id} className="border-t border-brand-50">
                        <td>{item.receiptId}</td>
                        <td>{formatDate(item.paymentDate)}</td>
                        <td className="capitalize">{item.feeType}</td>
                        <td>{item.monthLabel || "-"}</td>
                        <td>{formatCurrency(item.amount)}</td>
                        <td>
                          {item.pdfPath ? (
                            <a
                              className="text-brand-700 underline"
                              href={getAssetUrl(item.pdfPath)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download PDF
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-brand-700">
                        No payments recorded yet.
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

export default FeesPage;
