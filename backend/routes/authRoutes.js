const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validate, registerSchema, loginSchema } = require("../validation/authValidation");

router.post("/register", validate(registerSchema), register);
router.post("/login",    validate(loginSchema),    login);
router.post("/refresh",                            refresh);
router.get ("/me",       protect,                  getMe);
router.post("/logout",   protect,                  logout);

module.exports = router;