export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Something went wrong";

  if (err?.code === 11000) {
    statusCode = 400;
    const duplicateField = Object.keys(err.keyPattern || {})[0];
    const duplicateValue = Object.values(err.keyValue || {})[0];

    if (duplicateField?.includes("aadharNumber")) {
      message = `A student with Aadhar number "${duplicateValue}" already exists`;
    } else if (duplicateField === "receiptNumber") {
      message = "A fee receipt reference conflict occurred. Please retry the action.";
    } else {
      message = `Duplicate value found for ${duplicateField || "a unique field"}`;
    }
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
