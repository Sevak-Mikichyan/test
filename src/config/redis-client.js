const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
});

module.exports = { redisClient };