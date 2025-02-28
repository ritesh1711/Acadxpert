const jwt = require("jsonwebtoken");
const User = require("../Models/User");

exports.verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id); // ✅ Use `_id`

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Unauthorized" });
    }
};
