const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
const chalk = require('chalk');
const { server, connect_to_http_server } = require('./http-server');
const { connect_to_ws_server } = require('./ws-server');
const { connect_to_pg_sql } = require('./src/config/sequelize');
const { connect_to_mongo_db } = require('./src/config/mongoose');
const { connect_to_redis } = require('./src/config/redis-client');
const { autoBackup } = require('./src/utils/auto-backup');
const { Message } = require('./src/utils/message');

const HTTP_SERVER_PORT = process.env.HTTP_SERVER_PORT;
const HTTP_SERVER_HOST = process.env.HTTP_SERVER_HOST;
const HTTP_SERVER_URI = process.env.HTTP_SERVER_URI;
const WS_SERVER_URI = process.env.WS_SERVER_URI;
const PG_SQL_URI = process.env.PG_SQL_URI;
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const REDIS_URI = process.env.REDIS_URI
const TIMEZONE = process.env.TIMEZONE || "UTC";

!async function () {
    try {
        console.log(chalk.yellow("[nodemon] 3.1.9"));
        console.log(chalk.yellow("[nodemon] to restart at any time, enter `rs`"));
        console.log(chalk.yellow("[nodemon] watching path(s): *.*"));
        console.log(chalk.yellow("[nodemon] watching extensions: js,mjs,cjs,json"));
        console.log(chalk.green("[nodemon] starting `node index.js`"));
        console.log("");

        try {
            await connect_to_http_server(HTTP_SERVER_PORT, HTTP_SERVER_HOST);
            Message.success("HTTP server connected successfully", HTTP_SERVER_URI);
        } catch (e) {
            Message.error("Failed to connect to the HTTP server", e);
            process.exit(1);
        }

        try {
            await connect_to_ws_server(server);
            Message.success("Websocket server connected successfully", WS_SERVER_URI);
        } catch (e) {
            Message.error("Failed to connect to the WebSocket server", e);
            process.exit(1);
        }

        try {
            await connect_to_pg_sql();
            Message.success("PostgreSQL database connected successfully", PG_SQL_URI);
        } catch (e) {
            Message.error("Failed to connect to the PostgreSQL", e);
            process.exit(1);
        }

        try {
            await connect_to_mongo_db();
            Message.success("MongoDB connected successfully", MONGO_DB_URI);
        } catch (e) {
            Message.error("Failed to connect to the MongoDB", e);
            process.exit(1);
        }

        try {
            await connect_to_redis();
            Message.success("Redis client connected successfully", REDIS_URI);
        } catch (e) {
            Message.error("Failed to connect to the Redis", e);
            process.exit(1);
        }


        cron.schedule("0 0 * * * ", async () => {
            try {
                const backupPath = await autoBackup(5);
                Message.success("Backup completed successfuly", backupPath);
            } catch (e) {
                Message.error("Error during backup process", e);
            }
        }, { timezone: TIMEZONE });


    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}();