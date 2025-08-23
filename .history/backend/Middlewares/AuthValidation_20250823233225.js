const Joi = require("joi");

const signupValidation = (req, res, next) => {
    console.log("📥 Incoming Signup Request:", req.body); // Debugging incoming data

    const schema = Joi.object({
        name: Joi.string().trim().min(3).max(100).required(),
        username: Joi.string().trim().required(),
        password: Joi.string().min(4).max(100).required()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        console.error("❌ Validation Error:", error.details.map(err => err.message)); // Debugging
        return res.status(400).json({ 
            message: "Bad request", // ✅ More standard error message
            errors: error.details.map(err => err.message) 
        });
    }

    next();
};

const loginValidation = (req, res, next) => {
    console.log("📥 Incoming Login Request:", req.body); // Debugging incoming data

    const schema = Joi.object({
        username: Joi.string().trim().required()
            .messages({
                "string.empty": "Username is required"
            }),

        password: Joi.string().trim().min(4).max(100).required() // Added `.trim()`
            .messages({
                "string.empty": "Password is required",
                "string.min": "Password must be at least 4 characters long",
                "string.max": "Password cannot exceed 100 characters"
            })
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        console.error("❌ Validation Error:", error.details.map(err => err.message)); // Debugging
        return res.status(400).json({ 
            message: "Bad request", // ✅ More standard error message
            errors: error.details.map(err => err.message) 
        });
    }

    next();
};

module.exports = {
    signupValidation,
    loginValidation
};
