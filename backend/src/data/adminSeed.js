import Admin from "../models/Admin.js";

export const initializeAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || "admin@school.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existingAdmin = await Admin.findOne({ email });

  if (!existingAdmin) {
    await Admin.create({
      name: "School Administrator",
      email,
      password
    });
    console.log("Default admin created");
    return;
  }

  existingAdmin.password = password;
  await existingAdmin.save();
};
