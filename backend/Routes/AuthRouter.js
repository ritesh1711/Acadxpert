const express = require('express');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const { signup, login } = require('../Controlers/AuthControler');
const router = express.Router();



router.post('/login', loginValidation , login);
router.post('/signup', signupValidation , signup);

module.exports = router; // ✅ Ensure the router is exported
