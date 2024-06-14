import express from "express";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateTask,
} from "../controllers/taskController.js";
import {
  isAdminRoute,
  protectRoute,
  isAdminOrSpecialRole,
} from "../middlewares/authMiddlewave.js";

const router = express.Router();

router.post("/create", protectRoute, isAdminOrSpecialRole, createTask);
router.post(
  "/duplicate/:id",
  protectRoute,
  isAdminOrSpecialRole,
  duplicateTask
);
router.post("/activity/:id", protectRoute, postTaskActivity);

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);

router.put(
  "/create-subtask/:id",
  protectRoute,
  isAdminOrSpecialRole,
  createSubTask
);
router.put("/update/:id", protectRoute, updateTask);
router.put("/:id", protectRoute, isAdminOrSpecialRole, trashTask);

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminOrSpecialRole,
  deleteRestoreTask
);

export default router;
