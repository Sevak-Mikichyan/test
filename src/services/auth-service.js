const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Result } = require("../utils/result");
const { Validator } = require("../utils/validator");
const { User } = require("../models/user-model");
const { redisClient } = require('../config/redis-client');

class AuthService {

    async registration(request) {
        try {
            const { username, email, password } = request.body;
            if ([username, email, password].some(field => field === undefined)) {
                return new Result(400, "All fields are required");
            }

            const validator = new Validator({ username, email, password });
            if (!validator.isValid()) {
                return new Result(422, "Invalid credentials", validator.invalidData);
            }

            const usernameExists = await User.findOne({ where: { username } });
            if (usernameExists) return new Result(409, "User with that username already exists");

            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) return new Result(409, "User with that email already exists");

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                username,
                email,
                password: hashedPassword,
                isAuthenticated: true,
                refreshToken: null,
            });

            const userDataForToken = { id: newUser.id, username: newUser.username };
            const refreshToken = this.#generateToken(userDataForToken, "7d");
            const accessToken = this.#generateToken(userDataForToken, "1h");

            newUser.refreshToken = refreshToken;
            await newUser.save();

            return new Result(201, "Registered successfully", { accessToken, refreshToken });
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async login(request) {
        try {
            const { email, password } = request.body;

            if ([email, password].some(field => field === undefined)) {
                return new Result(400, "All fields are required");
            }

            const failedAttempts = await redisClient.get(`${email}:failedAttempts`);
            if (failedAttempts && parseInt(failedAttempts) >= 3) {
                const lockTime = await redisClient.get(`${email}:lockTime`);
                if (lockTime) {
                    const timeLeft = 180 - (Math.floor(Date.now() / 1000) - lockTime);
                    if (timeLeft > 0) {
                        return new Result(429, `Too many attempts. Try again in ${timeLeft} seconds`);
                    } else {
                        await redisClient.del(`${email}:failedAttempts`);
                        await redisClient.del(`${email}:lockTime`);
                    }
                }
            }

            const validator = new Validator({ email, password });
            if (!validator.isValid()) {
                return new Result(422, "Invalid credentials", validator.invalidData);
            }

            const user = await User.findOne({ where: { email } });
            if (!user) return new Result(404, "User not found");

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                const currentFailedAttempts = await redisClient.get(`${email}:failedAttempts`);
                const newFailedAttempts = currentFailedAttempts ? parseInt(currentFailedAttempts) + 1 : 1;

                await redisClient.set(`${email}:failedAttempts`, newFailedAttempts);

                if (newFailedAttempts >= 3) {
                    await redisClient.set(`${email}:lockTime`, Math.floor(Date.now() / 1000));
                    return new Result(429, "Too many incorrect attempts. Your account is locked for 5 minutes.");
                }

                return new Result(401, "Incorrect password");
            }

            const userDataForToken = { id: user.id, username: user.username };
            const accessToken = this.#generateToken(userDataForToken, "1h");
            const refreshToken = this.#generateToken(userDataForToken, "7d");

            await User.update({ refreshToken }, { where: { id: user.id } });
            await redisClient.del(`${email}:failedAttempts`);

            return new Result(200, "Logged in successfully", { accessToken, refreshToken });
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async logout(request) {
        try {
            const { user: { id } } = request;
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return new Result(404, "User not found");
            }
            user.refreshToken = null;
            await user.save();
            return new Result(200, "Logged out successfully");
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async refreshTokens(request) {
        try {
            const { refreshToken } = request.body;
            if (!refreshToken) {
                return new Result(403, "Refresh token is required");
            }

            try {
                const userData = this.#verifyToken(refreshToken);
                const user = await User.findOne({ where: { id: userData.id, refreshToken } });

                if (!user) return new Result(403, "Invalid refresh token");

                const userDataForToken = { id: user.id, username: user.username };
                const newAccessToken = this.#generateToken(userDataForToken, "1h");
                const newRefreshToken = this.#generateToken(userDataForToken, "7d");

                user.refreshToken = newRefreshToken;
                await user.save();

                return new Result(200, "Token refreshed successfully", {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                });
            } catch (e) {
                return new Result(403, "Invalid or expired refresh token");
            }
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    #generateToken(userData, expiresIn) {
        return jwt.sign(userData, process.env.JWT_SECRET_KEY, { expiresIn });
    }

    #verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
    }
}

module.exports = { authService: new AuthService() };