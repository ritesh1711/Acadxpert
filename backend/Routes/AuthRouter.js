const express = require("express");
const { signupValidation, loginValidation } = require("../Middlewares/AuthValidation");
const { signup, login } = require("../Controllers/AuthController");
const { getUser } = require("../Controllers/UserController");
 // New Controller
const verifyToken = require("../Middlewares/authMiddleware"); 
const router = express.Router();

router.post("/login", loginValidation, login);
router.post("/signup", signupValidation, signup);
router.get("/user", verifyToken, getUser); 

module.exports = router;
