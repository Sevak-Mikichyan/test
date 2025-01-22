const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { authController } = require('./src/controllers/auth-controller');
const { userController } = require('./src/controllers/user-controller');

const app = express();

const logFilePath = path.join(__dirname, "logs", "morgan.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

app.use(cors({
    origin: ["http://localhost:3001"],
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
}));

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(morgan("dev"));
app.use(morgan("combined", { stream: logStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use('/api/auth', authController);
app.use('/api/user', userController);

const server = http.createServer(app);

const connect_to_http_server = async (port, host = "localhost") => {
    return new Promise((resolve, reject) => {
        try {
            server.listen(port, host, () => {
                resolve();
            });

            server.on("error", (e) => {
                reject(e);
            });
        } catch (e) {
            return reject(e);
        }
    });
};

module.exports = { server, connect_to_http_server };