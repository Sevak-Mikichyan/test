const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

class User extends Model { }

User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isAuthenticated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: { args: [["online", "offline"]] },
        },
        defaultValue: "offline"
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    }
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
});

module.exports = { User };