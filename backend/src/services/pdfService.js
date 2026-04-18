import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageRoot = path.join(__dirname, "..", "..", "storage");

const ensureDirectory = (folderName) => {
  const folderPath = path.join(storageRoot, folderName);
  fs.mkdirSync(folderPath, { recursive: true });
  return folderPath;
};

const schoolConfig = () => ({
  name: process.env.SCHOOL_NAME || "Green Valley Public School",
  address:
    process.env.SCHOOL_ADDRESS || "Near Main Road, Your City, State - 123456",
  phone: process.env.SCHOOL_PHONE || "+91-9876543210",
  headName: process.env.SCHOOL_HEAD_NAME || "School Head"
});

const drawTableHeader = (doc, y, headers) => {
  let x = 55;

  headers.forEach((header) => {
    doc.rect(x, y, header.width, 24).stroke();
    doc.text(header.label, x + 8, y + 7, {
      width: header.width - 16
    });
    x += header.width;
  });
};

const summarizeDueBreakdown = (pendingDues = []) => {
  const summary = new Map();

  pendingDues.forEach((item) => {
    const key = item.feeType;
    const current = summary.get(key) || {
      label:
        item.feeType === "admission"
          ? "Admission Fee"
          : item.feeType === "transport"
            ? "Transport Fee"
            : item.feeType === "hostel"
              ? "Hostel Fee"
              : "Tuition Fee",
      count: 0,
      amount: 0
    };

    current.count += item.feeType === "admission" ? 0 : 1;
    current.amount += Number(item.dueAmount || 0);
    summary.set(key, current);
  });

  return Array.from(summary.entries()).map(([feeType, item]) => ({
    feeType,
    label: item.label,
    count: item.count,
    amount: item.amount
  }));
};

export const createFeeReceiptPdf = ({ student, fee }) =>
  new Promise((resolve, reject) => {
    const folderPath = ensureDirectory("receipts");
    const fileName = `${fee.receiptId}.pdf`;
    const filePath = path.join(folderPath, fileName);
    const relativePath = `/storage/receipts/${fileName}`;
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    const school = schoolConfig();

    doc.pipe(stream);

    doc.fontSize(18).text(school.name, { align: "center" });
    doc.fontSize(10).text(school.address, { align: "center" });
    doc.text(`Contact: ${school.phone}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text("Fee Receipt", { align: "center", underline: true });
    doc.moveDown();

    doc.fontSize(11);
    doc.text(`Receipt Number: ${fee.receiptId}`);
    doc.text(`Date of Payment: ${new Date(fee.paymentDate).toLocaleDateString("en-IN")}`);
    doc.text(`Student Name: ${student.personalDetails.studentName}`);
    doc.text(
      `Class / Course: ${student.academicDetails.className} - ${student.academicDetails.section}`
    );
    if (fee.monthLabel) {
      doc.text(`Month: ${fee.monthLabel}`);
    }
    doc.moveDown();

    let y = doc.y;
    drawTableHeader(doc, y, [
      { label: "Particulars", width: 350 },
      { label: "Amount", width: 140 }
    ]);
    y += 24;

    fee.lineItems.forEach((item) => {
      doc.rect(55, y, 350, 24).stroke();
      doc.rect(405, y, 140, 24).stroke();
      doc.text(item.label, 63, y + 7, { width: 334 });
      doc.text(item.amount.toFixed(2), 413, y + 7);
      y += 24;
    });

    doc.rect(55, y, 350, 24).stroke();
    doc.rect(405, y, 140, 24).stroke();
    doc.font("Helvetica-Bold");
    doc.text("Paid Amount", 63, y + 7);
    doc.text(fee.amount.toFixed(2), 413, y + 7);
    doc.font("Helvetica");
    y += 40;

    doc.text(`Remaining Due: ${Number(student?.feeSummary?.totalDue || 0).toFixed(2)}`, 55, y);
    y += 24;
    doc.text("Payment Type: Cash", 55, y);
    y += 24;
    doc.text("Paid By: Cash", 55, y);
    y += 36;
    doc.text(`Signature: ____________________ (${school.headName})`, 55, y);
    y += 40;
    doc.fontSize(10).text("Amount once paid is non-refundable", 55, y);

    doc.end();

    stream.on("finish", () => resolve(relativePath));
    stream.on("error", reject);
  });

export const createSalarySlipPdf = ({ employee, salary }) =>
  new Promise((resolve, reject) => {
    const folderPath = ensureDirectory("salary-slips");
    const fileName = `${salary.slipNumber}.pdf`;
    const filePath = path.join(folderPath, fileName);
    const relativePath = `/storage/salary-slips/${fileName}`;
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    const school = schoolConfig();

    doc.pipe(stream);

    doc.fontSize(18).text(school.name, { align: "center" });
    doc.fontSize(10).text(school.address, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text("Salary Slip", { align: "center", underline: true });
    doc.moveDown();

    doc.fontSize(11);
    doc.text(`Slip Number: ${salary.slipNumber}`);
    doc.text(`Payment Date: ${new Date(salary.paymentDate).toLocaleDateString("en-IN")}`);
    doc.text(`Employee Name: ${employee.name}`);
    doc.text(`Role: ${employee.role}`);
    doc.text(`Month: ${salary.monthLabel}`);
    doc.text(`Amount Paid: ${salary.amount.toFixed(2)}`);
    doc.text(`Payment Mode: ${salary.paymentMode}`);
    if (salary.note) {
      doc.text(`Note: ${salary.note}`);
    }

    doc.moveDown(4);
    doc.text(`Authorized Signature: ____________________ (${school.headName})`);

    doc.end();

    stream.on("finish", () => resolve(relativePath));
    stream.on("error", reject);
  });

export const createDueReportPdf = ({ title, rows }) =>
  new Promise((resolve, reject) => {
    const folderPath = ensureDirectory("due-reports");
    const fileName = `DUE-${Date.now()}.pdf`;
    const filePath = path.join(folderPath, fileName);
    const relativePath = `/storage/due-reports/${fileName}`;
    const doc = new PDFDocument({ margin: 45, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    const school = schoolConfig();

    doc.pipe(stream);

    doc.fontSize(18).text(school.name, { align: "center" });
    doc.fontSize(10).text(school.address, { align: "center" });
    doc.text(`Contact: ${school.phone}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(title, { align: "center", underline: true });
    doc.moveDown();

    rows.forEach((row, index) => {
      const totalDue = row.pendingDues.reduce((sum, item) => sum + item.dueAmount, 0);
      const dueSummary = summarizeDueBreakdown(row.pendingDues);

      doc.fontSize(12).font("Helvetica-Bold");
      doc.text(`${row.student.personalDetails.studentName} (${row.student.studentId})`);
      doc.font("Helvetica").fontSize(10);
      doc.text(
        `Class: ${row.student.academicDetails.className} - ${row.student.academicDetails.section}`
      );
      doc.text(`Aadhar: ${row.student.personalDetails.aadharNumber}`);
      doc.text(`Facility Type: ${row.student.facilityType}`);
      doc.text(`Total Due: ${totalDue.toFixed(2)}`);
      doc.moveDown(0.5);

      dueSummary.forEach((item) => {
        const label =
          item.feeType === "admission"
            ? `${item.label}:`
            : `${item.label} (${item.count} months):`;
        doc.text(`${label} ${item.amount.toFixed(2)}`);
      });
      doc.moveDown(0.75);

      let y = doc.y;
      drawTableHeader(doc, y, [
        { label: "Month", width: 130 },
        { label: "Type", width: 150 },
        { label: "Assigned", width: 120 },
        { label: "Pending", width: 90 }
      ]);
      y += 24;

      row.pendingDues.forEach((item) => {
        doc.rect(55, y, 130, 24).stroke();
        doc.rect(185, y, 150, 24).stroke();
        doc.rect(335, y, 120, 24).stroke();
        doc.rect(455, y, 90, 24).stroke();
        doc.text(item.monthLabel || "-", 63, y + 7, { width: 114 });
        doc.text(item.feeType, 193, y + 7, { width: 134 });
        doc.text(item.amount.toFixed(2), 343, y + 7);
        doc.text(item.dueAmount.toFixed(2), 463, y + 7);
        y += 24;
      });

      doc.moveDown(2);

      if (index !== rows.length - 1) {
        doc.addPage();
      }
    });

    doc.end();

    stream.on("finish", () => resolve(relativePath));
    stream.on("error", reject);
  });
