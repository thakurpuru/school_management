import Teacher from "../models/Teacher.js";

export const createTeacher = async (req, res) => {
  const teacher = await Teacher.create(req.body);
  res.status(201).json(teacher);
};

export const getTeachers = async (_req, res) => {
  const teachers = await Teacher.find().sort({ createdAt: -1 });
  res.json(teachers);
};

export const updateTeacher = async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  res.json(teacher);
};

export const deleteTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  await teacher.deleteOne();
  res.json({ message: "Teacher deleted successfully" });
};
