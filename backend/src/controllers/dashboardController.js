import Fee from "../models/Fee.js";
import Staff from "../models/Staff.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

export const getDashboardStats = async (_req, res) => {
  const [studentCount, teacherCount, staffCount, feeSummary] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Staff.countDocuments(),
    Student.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$feeSummary.totalPaid" },
          totalDue: { $sum: "$feeSummary.totalDue" }
        }
      }
    ])
  ]);

  const recentPayments = await Fee.find()
    .where("entryKind")
    .equals("payment")
    .sort({ paymentDate: -1 })
    .limit(5)
    .populate("studentId", "studentId personalDetails.studentName academicDetails.className");

  res.json({
    stats: {
      totalStudents: studentCount,
      totalTeachersAndStaff: teacherCount + staffCount,
      totalCollectedFees: feeSummary[0]?.totalCollected || 0,
      totalPendingDues: feeSummary[0]?.totalDue || 0
    },
    recentPayments
  });
};
