const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const UserModel = require("../Models/User");

const signup = async (req, res) => {
    try {
        const { name, username, password, course, semester } = req.body;
        const user = await UserModel.findOne({ username });
        if (user) {
            return res.status(409)
                .json({ message: 'User already exists, you can login', success: false });
        }

        const userModel = new UserModel({ 
            name, 
            username, 
            password,
            course: course || 'MCA',
            semester: semester || 1
        });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201)
            .json({
                message: "Signup successfully",
                success: true
            });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            });
    }
};


const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel.findOne({ username });
        const errmsg= "Username or password is wrong ... Try again...";
        if (!user) {
            return res.status(403)
                .json({ message: errmsg, success: false });
        }

        const isPassEqual = await bcrypt.compare(password , user.password);
        if (!isPassEqual) {
            return res.status(403)
            .json({ message: errmsg, success: false });
        }

        const jwtToken = jwt.sign(
            {
                username: user.email, 
                _id: user.id,
                isAdmin: user.isAdmin,
                course: user.course,
                semester: user.semester
            },
            process.env.JWT_SECRET,
            {expiresIn:"24h"}
        )

        res.status(200)
            .json({
                message: "login successfully",
                success: true,
                jwtToken,
                email,
                name: user.name,
                isAdmin: user.isAdmin,
                course: user.course,
                semester: user.semester
            });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            });
    }
};

module.exports = {
    signup,
    login
};

