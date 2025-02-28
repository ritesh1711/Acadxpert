const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/User");

const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409).json({
                message: 'User already exists, please login.',
                success: false
            });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ 
            name, 
            email, 
            password: hashedPassword, 
            role: role || "user" // Default role is "user"
        });

        await newUser.save();

        res.status(201).json({
            message: "Signup successful",
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(403).json({ 
                message: "Authentication failed. Email or password is incorrect.", 
                success: false 
            });
        }

        // Check if password matches
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ 
                message: "Authentication failed. Email or password is incorrect.", 
                success: false 
            });
        }

        // Generate JWT Token with role
        const jwtToken = jwt.sign(
            { email: user.email, _id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "24h" }
        );

        res.status(200).json({
            message: "Login successful",
            success: true,
            jwtToken,
            email: user.email,
            name: user.name,
            role: user.role // Send role to frontend
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

module.exports = {
    signup,
    login
};
