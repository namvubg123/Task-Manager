import { response } from "express";
import User from "../models/user.js";
import { createJWT } from "../utils/index.js";
import Notice from "../models/notification.js";
import Department from "../models/department.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, role, title, phone, department } =
      req.body;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: false,
        message:
          "Mật khẩu phải có ít nhất 1 chữ viết hoa, 1 số và 1 ký tự đặc biệt",
      });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "Người dùng đã tồn tại",
      });
    }
    if (role === "Trưởng bộ môn") {
      const departmentExists = await Department.findById(department);
      if (departmentExists.manager) {
        return res.status(400).json({
          status: false,
          message: "Bộ môn này đã có trưởng bộ môn",
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin,
      role,
      title,
      phone,
      department,
    });

    if (user) {
      isAdmin ? createJWT(res, user._id) : null;
      if (role === "Trưởng bộ môn") {
        await Department.findByIdAndUpdate(department, { manager: user._id });
      }

      user.password = undefined;

      res.status(201).json(user);
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Email không tồn tại hoặc mật khẩu sai!",
      });
    }

    if (!user?.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      createJWT(res, user._id);

      user.password = undefined;

      res.status(200).json(user);
    } else {
      return res.status(401).json({
        status: false,
        message: "Email không tồn tại hoặc mật khẩu sai!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      htttpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTeamList = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    let users;

    if (isAdmin) {
      users = await User.find()
        .select("name title role email phone isActive department")
        .populate({
          path: "department",
          select: "name ",
        });
    } else {
      const user = await User.findById(userId);
      console.log(user);
      if (user.role === "Trưởng bộ môn" || user.role === "Giảng viên") {
        users = await User.find({
          department: user.department,
        })
          .select("name title role email phone isActive department")
          .populate({
            path: "department",
            select: "name ",
          });
      } else {
        return res
          .status(403)
          .json({ status: false, message: "Bạn không có quyền truy cập." });
      }
    }

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getNotificationsList = async (req, res) => {
  try {
    const { userId } = req.user;

    const notice = await Notice.find({
      team: userId,
      isRead: { $nin: [userId] },
    }).populate("task", "title");

    res.status(201).json(notice);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { _id, role, department } = req.body;

    const id =
      isAdmin && userId === _id
        ? userId
        : isAdmin && userId !== _id
        ? _id
        : userId;

    const user = await User.findById(id);

    if (user) {
      user.name = req.body.name || user.name;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;
      user.department = req.body.department || user.department;
      user.phone = req.body.phone || user.phone;

      const checkRole = await Department.findOne({
        manager: _id,
      });

      if (role === "Trưởng bộ môn" && !checkRole) {
        const departmentExists = await Department.findById(department);
        if (departmentExists.manager) {
          return res.status(400).json({
            status: false,
            message: "Bộ môn này đã có trưởng bộ môn",
          });
        } else {
          await Department.findByIdAndUpdate(department, { manager: user._id });
        }
      }

      const updatedUser = await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: "Update thông tin thành công!.",
        user: updatedUser,
      });
    } else {
      res
        .status(404)
        .json({ status: false, message: "Người dùng không tồn tại!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { userId } = req.user;

    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }

    res.status(201).json({ status: true, message: "Done" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { password } = req.body;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: false,
        message:
          "Mật khẩu phải có ít nhất 1 chữ viết hoa, 1 số và 1 ký tự đặc biệt",
      });
    }

    const user = await User.findById(userId);

    if (user) {
      user.password = password;

      await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: `Thay đổi mật khẩu thành công.`,
      });
    } else {
      res
        .status(404)
        .json({ status: false, message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user) {
      user.isActive = req.body.isActive; //!user.isActive

      await user.save();

      res.status(201).json({
        status: true,
        message: `User account has been ${
          user?.isActive ? "activated" : "disabled"
        }`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user.isAdmin) {
      return res
        .status(403)
        .json({ status: false, message: "Không thể xóa tài khoản admin." });
    }

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "Xóa người dùng thành công" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
