const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/database";

const connectToMongoDB = () => {
    return new Promise((resolve, reject) => {
        try {
            mongoose.set('debug', false);
            mongoose.connect(MONGO_URI);
            return resolve();
        } catch (e) {
            return reject(e);
        }
    });
};

module.exports = { connectToMongoDB };