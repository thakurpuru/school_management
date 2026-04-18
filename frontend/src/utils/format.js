export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value || 0));

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "-";
