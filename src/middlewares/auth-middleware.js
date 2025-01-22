const jwt = require('jsonwebtoken');
const { Result } = require('../utils/result');
const { User } = require('../models/user-model');

const authMiddleware = async (request, response, next) => {
    try {
        const { authorization } = request.headers;
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return response.status(401).json(new Result(401, "Access denied: Missing or invalid token"));
        }

        const accessToken = authorization.split(' ')[1];

        try {
            const user = jwt.verify(accessToken, JWT_SECRET_KEY);
            request.user = user;
            return next();
        } catch (error) {
            return response.status(403).json(new Result(403, "Invalid or expired token"));
        }
    } catch (e) {
        console.error(e);
        return response.status(500).json(new Result(500, "Internal server error"));
    }
};

module.exports = { authMiddleware };