const dotenv = require('dotenv');
dotenv.config();

const PSQL_USERNAME = process.env.PSQL_USERNAME || "postgres";
const PSQL_PASSWORD = process.env.PSQL_PASSWORD || "root";
const PSQL_HOST = process.env.PSQL_HOST || "localhost";
const PSQL_PORT = process.env.PSQL_PORT || 5432;
const PSQL_DATABASE = process.env.PSQL_DATABASE || "database";

module.exports = {
    development: {
        username: PSQL_USERNAME,
        password: PSQL_PASSWORD,
        host: PSQL_HOST,
        port: PSQL_PORT,
        database: PSQL_DATABASE,
        dialect: "postgres",
    },
    test: {
        username: PSQL_USERNAME,
        password: PSQL_PASSWORD,
        host: PSQL_HOST,
        port: PSQL_PORT,
        database: PSQL_DATABASE,
        dialect: "postgres",
    },
    production: {
        username: PSQL_USERNAME,
        password: PSQL_PASSWORD,
        host: PSQL_HOST,
        port: PSQL_PORT,
        database: PSQL_DATABASE,
        dialect: "postgres",
    },
};