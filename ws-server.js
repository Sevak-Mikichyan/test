const WebSocket = require('ws');
const chalk = require('chalk');
const { redisClient } = require('./src/config/redis-client');
const { User } = require('./src/models/user-model');

const connect_to_ws_server = (server) => {
    return new Promise((resolve, reject) => {
        try {
            const wss = new WebSocket.Server({ server });

            wss.on("connection", (ws) => {
                const clientAddress = ws._socket.remoteAddress;
                let id;
                console.log(`New client connected: ${chalk.green(clientAddress)}`);

                ws.on("message", async (message) => {
                    try {
                        const data = JSON.parse(message);
                        id = String(data.id);

                        if (id) {
                            await redisClient.set(`user:${id}:status`, "online");
                            await User.update({ status: "online" }, { where: { id } });
                            console.log(`Client with ${chalk.green(id)} id connected from ${chalk.green(clientAddress)}`);
                        } else {
                            console.error(`Received message but no id provided: ${chalk.green(message)}`);
                        }
                    } catch (e) {
                        console.error(`Error parsing message: ${e.message}`);
                    }
                });

                ws.on("close", async () => {
                    if (id) {
                        await redisClient.set(`user:${id}:status`, "offline");
                        await User.update({ status: "offline" }, { where: { id } });
                        console.log(`Client disconnected: ${chalk.green(clientAddress)}`);
                    } else {
                        console.error(`No client id to delete on disconnect.`);
                    }
                });
            });

            resolve();
        } catch (e) {
            return reject(e);
        }
    });
};

module.exports = { connect_to_ws_server };