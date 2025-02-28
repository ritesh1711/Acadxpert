const Joi = require("joi");

const signupValidation = (req, res, next) => {
    console.log("📥 Incoming Signup Request:", req.body); // Debugging incoming data

    const schema = Joi.object({
        name: Joi.string().trim().min(3).max(100).required()
            .messages({
                "string.empty": "Name is required",
                "string.min": "Name must be at least 3 characters long",
                "string.max": "Name cannot exceed 100 characters"
            }),

        email: Joi.string().email().trim().required()
            .messages({
                "string.email": "Invalid email format",
                "string.empty": "Email is required"
            }),

        password: Joi.string().trim().min(4).max(100).required() // Added `.trim()`
            .messages({
                "string.empty": "Password is required",
                "string.min": "Password must be at least 4 characters long",
                "string.max": "Password cannot exceed 100 characters"
            }),

        role: Joi.string().valid("student", "faculty", "admin").required()
            .messages({
                "any.only": "Role must be one of ['student', 'faculty', 'admin']",
                "string.empty": "Role is required"
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

const loginValidation = (req, res, next) => {
    console.log("📥 Incoming Login Request:", req.body); // Debugging incoming data

    const schema = Joi.object({
        email: Joi.string().email().trim().required()
            .messages({
                "string.email": "Invalid email format",
                "string.empty": "Email is required"
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
