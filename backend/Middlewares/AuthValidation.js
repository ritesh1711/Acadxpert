const Joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(3).max(100).required(),
        email: Joi.string().email().trim().required(),
        password: Joi.string().min(4).max(100).required()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ 
            message: "Bad request", 
            errors: error.details.map(err => err.message) 
        });
    }

    next();
};

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().trim().required(),
        password: Joi.string().min(4).max(100).required()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ 
            message: "Bad request", 
            errors: error.details.map(err => err.message) 
        });
    }

    next();
};

module.exports = {
    signupValidation,
    loginValidation
};
