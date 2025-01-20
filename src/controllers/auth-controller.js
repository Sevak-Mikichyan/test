const express = require('express');
const { Controller } = require('../utils/controller');
const { authService } = require('../services/auth-service');
const { authMiddleware } = require('../middlewares/auth-middleware');
const { userMiddleware } = require('../middlewares/user-middleware');

const authController = express.Router();

Controller.init(authController, authService, [
    new Controller("post", '/registration', "registration"),
    new Controller("post", '/login', "login"),
    new Controller("delete", '/logout', "logout", [authMiddleware, userMiddleware]),
    new Controller("post", '/refresh-tokens', "refreshTokens"),
]);

module.exports = { authController };