const express = require('express');
const { Controller } = require('../utils/controller');
const { userService } = require('../services/user-service');
const { authMiddleware } = require('../middlewares/auth-middleware');
const { userMiddleware } = require('../middlewares/user-middleware');

const userController = express.Router();

Controller.init(userController, userService, [
    new Controller("get", '/get-profile/:id', "getProfile"),
    new Controller("get", '/get-user', "getUser", [authMiddleware, userMiddleware]),
    new Controller("delete", '/delete-user', "deleteUser", [authMiddleware, userMiddleware]),
    new Controller("put", '/update-user', "updateUser", [authMiddleware, userMiddleware]),
    new Controller("patch", "/change-password", "changePassword", [authMiddleware]),
    new Controller("get", '/forgot-password/:email', "forgotPassword"),
    new Controller("post", '/verify-code-to-change-password', "verifyCodeToChangePassword")
]);

module.exports = { userController };