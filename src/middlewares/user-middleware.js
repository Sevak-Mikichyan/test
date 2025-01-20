const { User } = require("../models/user-model");
const { Result } = require("../utils/result");

const userMiddleware = async (request, response, next) => {
    const { user: { id } } = request;
    const user = await User.findOne({
        where: { id },
        attributes: { exclude: ["password"] }
    });
    if (!user) {
        return response.status(404).json(new Result(404, "User user not found"));
    }
    request.user = user;
    return next();
};

module.exports = { userMiddleware };