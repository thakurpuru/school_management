import Staff from "../models/Staff.js";

export const createStaff = async (req, res) => {
  const staff = await Staff.create(req.body);
  res.status(201).json(staff);
};

export const getStaffMembers = async (_req, res) => {
  const staffMembers = await Staff.find().sort({ createdAt: -1 });
  res.json(staffMembers);
};

export const updateStaff = async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!staff) {
    res.status(404);
    throw new Error("Staff member not found");
  }

  res.json(staff);
};

export const deleteStaff = async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    res.status(404);
    throw new Error("Staff member not found");
  }

  await staff.deleteOne();
  res.json({ message: "Staff member deleted successfully" });
};
