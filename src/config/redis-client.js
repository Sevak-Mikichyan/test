const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
});

const connect_to_redis = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await redisClient.connect();
            resolve();
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = { redisClient, connect_to_redis };