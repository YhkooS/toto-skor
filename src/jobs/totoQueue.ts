import { Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';

const redisUrl = process.env.REDISCLOUD_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);

const redisOptions: RedisOptions = {
    host: url.hostname || 'localhost',
    port: parseInt(url.port || '6379'),
    password: url.password || undefined,
    username: url.username || undefined,
};

const totoQueue = new Queue('totoQueue', { connection: redisOptions });
const skorQueue = new Queue('skorQueue', { connection: redisOptions })

export { totoQueue };
export { skorQueue }