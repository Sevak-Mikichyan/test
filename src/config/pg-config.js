const dotenv = require('dotenv');
dotenv.config();

const PG_USERNAME = process.env.PG_USERNAME || "postgres";
const PG_PASSWORD = process.env.PG_PASSWORD || "root";
const PG_HOST = process.env.PG_HOST || "localhost";
const PG_PORT = process.env.PG_PORT || 5432;
const PG_DATABASE = process.env.PG_DATABASE || "database";

module.exports = {
    development: {
        username: PG_USERNAME,
        password: PG_PASSWORD,
        host: PG_HOST,
        port: PG_PORT,
        database: PG_DATABASE,
        dialect: "postgres",
    },
    test: {
        username: PG_USERNAME,
        password: PG_PASSWORD,
        host: PG_HOST,
        port: PG_PORT,
        database: PG_DATABASE,
        dialect: "postgres",
    },
    production: {
        username: PG_USERNAME,
        password: PG_PASSWORD,
        host: PG_HOST,
        port: PG_PORT,
        database: PG_DATABASE,
        dialect: "postgres",
    },
};