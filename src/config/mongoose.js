const mongoose = require('mongoose');

const MONGO_DB_URI = process.env.MONGO_DB_URI;

const connect_to_mongo_db = () => {
    return new Promise((resolve, reject) => {
        try {
            mongoose.set("debug", false);
            mongoose.connect(MONGO_DB_URI);
            return resolve();
        } catch (e) {
            return reject(e);
        }
    });
};

module.exports = { connect_to_mongo_db };