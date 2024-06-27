import Department from "../models/department.js";
import User from "../models/user.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate({
      path: "manager",
      select: "name title email role department",
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await Department.findById(id).populate({
      path: "manager",
      select: "name title email role department",
    });
    if (!department) {
      return res.status(404).json({ message: "Bộ môn không tồn tại" });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
};

export const createDepartment = async (req, res) => {
  const { name, description, manager } = req.body;

  try {
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: "Bộ môn đã tồn tại" });
    }
    const existingManagerDepartment = await Department.findOne({
      manager: manager,
    });
    if (existingManagerDepartment) {
      return res.status(401).json({
        message: "Người quản lý đã là trưởng bộ môn của một bộ môn khác.",
      });
    }

    const managerUser = await User.findById(manager);
    if (!managerUser) {
      return res.status(402).json({ message: "Người quản lý không tồn tại" });
    }

    const department = new Department({
      name,
      description,
      manager,
    });
    await department.save();

    managerUser.department = department._id;
    managerUser.role = "Trưởng bộ môn";
    await managerUser.save();

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateDepartment = async (req, res) => {
  const { _id, name, description, manager } = req.body;

  try {
    const department = await Department.findById(_id);
    if (!department) {
      return res.status(404).json({ message: "Bộ môn không tồn tại" });
    }

    const managerUser = await User.findById(manager);
    if (!managerUser) {
      return res.status(400).json({ message: "Người quản lý không tồn tại" });
    }

    const currentManager = department.manager;
    if (currentManager && currentManager.toString() !== manager) {
      const currentManagerUser = await User.findById(currentManager);
      if (currentManagerUser) {
        currentManagerUser.role = "Giảng viên";
        await currentManagerUser.save();
      }
    }

    department.name = name;
    department.description = description;
    department.manager = manager;
    await department.save();

    managerUser.department = department._id;

    managerUser.role = "Trưởng bộ môn";
    await managerUser.save();

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Bộ môn không tồn tại" });
    }

    await department.deleteOne();

    const managerUser = await User.findById(department.manager);
    managerUser.department = null;
    await managerUser.save();

    res.json({ message: "Xóa bộ môn thành công" });
  } catch (error) {
    res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
};
