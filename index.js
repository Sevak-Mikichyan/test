const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
const chalk = require('chalk');
const { server } = require('./server');
const { sequelize } = require('./src/config/sequelize');
const { redisClient } = require('./src/config/redis-client');
const { connectToWebSocketServer } = require('./ws-server');
const { autoBackup } = require('./src/utils/auto-backup');
const { Message } = require('./src/utils/message');
const { connectToMongoDB } = require('./src/config/mongoose');

const SERVER_PORT = process.env.SERVER_PORT || 5001;
const SERVER_HOST = process.env.SERVER_HOST || "localhost";
const SERVER_URI = process.env.SERVER_URI || `http://${SERVER_HOST}:${SERVER_PORT}`;
const WSS_URI = process.env.WSS_URI || `ws://localhost:${SERVER_PORT}`;
const PG_URI = process.env.PG_URI || "postgresql://postgres:1596@localhost:5432/database";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/database";
const REDIS_URI = process.env.REDIS_URI || "redis://localhost:6379"
const TIMEZONE = process.env.TIMEZONE || "UTC";

!async function () {
    try {
        console.log(chalk.yellow("[nodemon] 3.1.9"));
        console.log(chalk.yellow("[nodemon] to restart at any time, enter `rs`"));
        console.log(chalk.yellow("[nodemon] watching path(s): *.*"));
        console.log(chalk.yellow("[nodemon] watching extensions: js,mjs,cjs,json"));
        console.log(chalk.green("[nodemon] starting `node index.js`"));
        console.log("");

        server.listen(SERVER_PORT, SERVER_HOST, async () => {
            Message.success("HTTP server connected successfully", SERVER_URI);
            try {
                await connectToWebSocketServer(server);
                Message.success("Websocket server connected successfully", WSS_URI);
            } catch (e) {
                Message.error("Failed to connect to the websocket server", e);
                process.exit(1);
            }

            try {
                await sequelize.authenticate();
                Message.success("PostgreSQL database connected successfully", PG_URI);
            } catch (e) {
                Message.error("Failed to connect to the postgresql database", e);
                process.exit(1);
            }

            try {
                await connectToMongoDB();
                Message.success("MongoDB connected successfully", MONGO_URI);
            } catch (e) {
                Message.error("Failed to connect to the MongoDB", e);
                process.exit(1);
            }

            try {
                await redisClient.connect();
                Message.success("Redis client connected successfully", REDIS_URI);
            } catch (e) {
                Message.error("Failed to connect to the redis client", e);
                process.exit(1);
            }

            cron.schedule("0 0 * * * *", async () => {
                try {
                    const backupPath = await autoBackup(5);
                    Message.success("Backup completed successfuly", backupPath);
                } catch (e) {
                    Message.error("Error during backup process", e);
                }
            }, { TIMEZONE });
        });

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}();

server.on("error", (e) => {
    Message.error("Failed to connect to the HTTP server", e);
    process.exit(1);
});