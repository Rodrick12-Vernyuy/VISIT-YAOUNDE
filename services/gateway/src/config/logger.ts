import winston from 'winston';
import { env } from './env';

const devFormat = process.stdout.isTTY
  ? winston.format.combine(winston.format.colorize(), winston.format.simple())
  : winston.format.simple();

export const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'gateway' },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.nodeEnv === 'production' ? winston.format.json() : devFormat
  ),
  transports: [new winston.transports.Console()],
});
