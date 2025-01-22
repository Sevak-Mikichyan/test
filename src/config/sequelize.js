const { Sequelize } = require('sequelize');

const PG_SQL_USERNAME = process.env.PG_SQL_USERNAME || "postgres";
const PG_SQL_PASSWORD = process.env.PG_SQL_PASSWORD || "root";
const PG_SQL_HOST = process.env.PG_SQL_HOST || "localhost";
const PG_SQL_PORT = process.env.PG_SQL_PORT || 5432;
const PG_SQL_DATABASE = process.env.PG_SQL_DATABASE || "database";

const sequelize = new Sequelize({
    username: PG_SQL_USERNAME,
    password: PG_SQL_PASSWORD,
    host: PG_SQL_HOST,
    port: PG_SQL_PORT,
    database: PG_SQL_DATABASE,
    dialect: "postgres",
    logging: false,
});

const connect_to_pg_sql = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.authenticate();
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = { sequelize, connect_to_pg_sql };