const UserModel = require("../Models/User");

const getUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getUser };
