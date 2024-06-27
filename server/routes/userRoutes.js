import express from "express";
import {
  isAdminRoute,
  protectRoute,
  isAdminOrSpecialRole,
} from "../middlewares/authMiddlewave.js";
import {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/get-team", protectRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationRead);
router.put("/change-password", protectRoute, changeUserPassword);

// //  ADMIN ROUTES
router
  .route("/:id")
  .put(protectRoute, isAdminOrSpecialRole, activateUserProfile)
  .delete(protectRoute, isAdminOrSpecialRole, deleteUserProfile);

export default router;
