const Joi = require("joi");

const signupValidation = (req, res, next) => {
    console.log("📥 Incoming Signup Request:", req.body);

    const schema = Joi.object({
        name: Joi.string().trim().min(3).max(100).required()
            .messages({
                "string.empty": "Name is required",
                "string.min": "Name must be at least 3 characters",
                "string.max": "Name cannot exceed 100 characters"
            }),
        username: Joi.string().trim().required()
            .messages({
                "string.empty": "Username is required"
            }),
        password: Joi.string().min(4).max(100).required()
            .messages({
                "string.empty": "Password is required",
                "string.min": "Password must be at least 4 characters long",
                "string.max": "Password cannot exceed 100 characters"
            }),
        course: Joi.string().valid("MCA", "BCA", "MBA").default("MCA"), // adjust list as needed
        semester: Joi.number().integer().min(1).max(8).default(1)
    }).unknown(false); // ❌ reject any extra fields

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        console.error("❌ Validation Error:", error.details.map(err => err.message));
        return res.status(400).json({
            message: "Bad request",
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
