import express from "express";
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.js";
import {
  isAdminRoute,
  protectRoute,
  isAdminOrSpecialRole,
} from "../middlewares/authMiddlewave.js";

const router = express.Router();

router.get("/", protectRoute, getDepartments);
router.get("/:id", protectRoute, getDepartmentById);
router.post("/create", protectRoute, createDepartment);
router.put("/update", protectRoute, updateDepartment);
router.delete("/delete/:id", protectRoute, deleteDepartment);

export default router;
