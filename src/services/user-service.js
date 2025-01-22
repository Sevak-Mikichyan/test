const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { User } = require("../models/user-model");
const { Result } = require("../utils/result");
const { Validator } = require("../utils/validator");
const { redisClient } = require('../config/redis-client');
const { createVerificationCode } = require('../utils/verification-code');
const { sendMail } = require('../config/nodemailer');
const { sendSMS } = require('../config/twilio');

class UserService {
    async getProfile(request) {
        try {
            const id = Number(request.params.id);
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return new Result(404, "User's profile not found");
            }
            const status = await redisClient.get(`user:${id}:status`) ?? await user.status;
            const profile = {
                id,
                username: user.username,
                status
            }
            return new Result(200, "User's profile retrieved successfully", profile);
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async getUser(request) {
        try {
            const user = request.user;
            user.status = await redisClient.get(`user:${user.id}:status`) ?? await user.status;
            await user.save();
            await sendSMS("+37494950247", "Hello World!");
            return new Result(200, "User retrieved successfully", { user });
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async deleteUser(request) {
        try {
            const user = request.user;
            await user.destroy();
            return new Result(200, "User deleted successfully");
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async updateUser(request) {
        try {
            const profile = request.user;
            const { username, email } = request.body;

            if (!username && !email) {
                return new Result(400, "No fields provided for update");
            }

            const validator = new Validator({ username, email });
            if (!validator.isValid()) {
                return new Result(422, "Invalid credentials", validator.invalidData);
            }

            if (username && await User.findOne({ where: { username, id: { $ne: id } } })) {
                return new Result(409, "User with that username already exists");
            }

            if (email && await User.findOne({ where: { email, id: { $ne: id } } })) {
                return new Result(409, "User with that email already exists");
            }

            if (username) profile.username = username;
            if (email) profile.email = email;
            await profile.save();

            return new Result(200, "User profile updated successfully");
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async changePassword(request) {
        try {
            const { user: { id } } = request;
            const { currentPassword, newPassword } = request.body;

            const profile = await User.findOne({ where: { id } });
            if (!profile) {
                return new Result(404, "User not found");
            }

            if (!currentPassword || !newPassword) {
                return new Result(400, "Both current and new passwords are required");
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, profile.password);
            if (!isPasswordValid) {
                return new Result(401, "Incorrect password");
            }

            const validator = new Validator({ password: newPassword });
            if (!validator.isValid()) {
                return new Result(422, "Invalid password format", validator.invalidData);
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            profile.password = hashedNewPassword;
            await profile.save();

            return new Result(200, "Password changed successfully");
        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async forgotPassword(request) {
        try {
            const { email } = request.params;
            if (!email) {
                return new Result(400, "Email is required");
            }

            const validator = new Validator({ email });
            if (!validator.isValid()) {
                return new Result(422, "Invalid email", validator.invalidData);
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return new Result(404, "User with that email not found");
            }

            const verificationCode = createVerificationCode(2, 6);
            const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

            await redisClient.set(`${email}:verificationCode`, hashedVerificationCode);
            await redisClient.expire(`${email}:verificationCode`, 90);

            try {
                const message = await sendMail({
                    email,
                    subject: "Verification Code",
                    text: `Your verification code is: ${verificationCode}`
                });
                console.log(message);
            } catch (e) {
                console.error(e);
            }

            return new Result(200, "We have sent a verification code to your email");

        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }

    async verifyCodeToChangePassword(request) {
        try {
            const { email, verificationCode, newPassword } = request.body;
            if (!email || !verificationCode || !newPassword) {
                return new Result(400, "Email, verification code, and new password are required");
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

            const hashedVerificationCode = await redisClient.get(`${email}:verificationCode`);
            if (!hashedVerificationCode) {
                return new Result(404, "Verification code for this email not found or expired");
            }

            if (!await bcrypt.compare(verificationCode, hashedVerificationCode)) {
                const failedAttempts = await redisClient.get(`${email}:failedAttempts`);
                const newFailedAttempts = failedAttempts ? parseInt(failedAttempts) + 1 : 1;

                await redisClient.set(`${email}:failedAttempts`, newFailedAttempts);

                if (newFailedAttempts >= 3) {
                    await redisClient.set(`${email}:lockTime`, Math.floor(Date.now() / 1000));
                    return new Result(429, "Too many incorrect attempts. Your account is locked for 5 minutes.");
                }

                return new Result(400, "Incorrect verification code");
            }

            const validator = new Validator({ password: newPassword });
            if (!validator.isValid()) {
                return new Result(422, "Invalid password format", validator.invalidData);
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await User.update({ password: hashedNewPassword }, { where: { email } });
            await redisClient.del(`${email}:failedAttempts`);
            await redisClient.del(`${email}:verificationCode`);

            return new Result(201, "Your password changed successfully");

        } catch (e) {
            console.error(e);
            return new Result(500, "Internal server error");
        }
    }
}

module.exports = { userService: new UserService() };