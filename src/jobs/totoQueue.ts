import { Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';

const redisOptions: RedisOptions = {
  host: 'localhost',
  port: 6379,
};

const totoQueue = new Queue('totoQueue', { connection: redisOptions });


export { totoQueue };