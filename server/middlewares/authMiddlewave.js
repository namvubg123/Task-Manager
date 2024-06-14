import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const resp = await User.findById(decodedToken.userId).select(
        "isAdmin email"
      );

      req.user = {
        email: resp.email,
        isAdmin: resp.isAdmin,
        userId: decodedToken.userId,
      };

      next();
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Xác thực thất bại. Hãy đăng nhập!" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ status: false, message: "Xác thực thất bại. Hãy đăng nhập!." });
  }
};

const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Bạn không có quyền làm việc này!",
    });
  }
};

const checkRole = (req, res, next) => {
  if (req.user && req.user.role === "Trưởng bộ môn") {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Bạn không có quyền làm việc này!",
    });
  }
};

const isAdminOrSpecialRole = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.role === "Trưởng bộ môn")) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Bạn không có quyền làm việc này!",
    });
  }
};

export { isAdminRoute, protectRoute, checkRole, isAdminOrSpecialRole };
