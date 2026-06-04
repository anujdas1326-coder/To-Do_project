const jwt = require('jsonwebtoken');
const userModel = require('../models/login');

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    console.error("JWT_SECRET is missing in .env");
    process.exit(1);
}

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const decoded = jwt.verify(token, SECRET_KEY);

        const user = await userModel
            .findById(decoded.id)
            .select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};

module.exports = authenticateUser;