import { useEffect, useState } from "react";
import { apiRequest, getAssetUrl } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { formatCurrency, formatDate } from "../utils/format.js";

const DashboardPage = () => {
  const [data, setData] = useState({
    stats: {
      totalStudents: 0,
      totalTeachersAndStaff: 0,
      totalCollectedFees: 0,
      totalPendingDues: 0
    },
    recentPayments: []
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const response = await apiRequest("/dashboard");
      setData(response);
    };

    loadDashboard();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick view of your school operations, fee collection, and recent transactions."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Students" value={data.stats.totalStudents} />
        <StatCard title="Teachers & Staff" value={data.stats.totalTeachersAndStaff} />
        <StatCard
          title="Collected Fees"
          value={formatCurrency(data.stats.totalCollectedFees)}
          tone="accent"
        />
        <StatCard title="Pending Dues" value={formatCurrency(data.stats.totalPendingDues)} />
      </div>

      <div className="panel mt-6 p-6">
        <h3 className="font-display text-2xl text-brand-900">Recent Fee Payments</h3>
        <div className="table-wrap mt-5">
          <table className="table-base">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Student</th>
                <th>Class</th>
                <th>Date</th>
                <th>Amount</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.length ? (
                data.recentPayments.map((payment) => (
                  <tr key={payment._id} className="border-t border-brand-50">
                    <td>{payment.receiptId}</td>
                    <td>{payment.studentId?.personalDetails?.studentName || "-"}</td>
                    <td>{payment.studentId?.academicDetails?.className || "-"}</td>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>
                      {payment.pdfPath ? (
                        <a
                          className="text-brand-700 underline"
                          href={getAssetUrl(payment.pdfPath)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Receipt
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
    </div>
  );
};

export default DashboardPage;
