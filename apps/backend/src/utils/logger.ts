import winston from 'winston';

const { combine, colorize, timestamp, printf, errors, splat } = winston.format;

const logStack = printf(({ level, message, timestamp, stack }) => {
  return stack
    ? `[${timestamp}] ${level}: ${message}\n${stack}`
    : `[${timestamp}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    splat(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logStack,
  ),
  transports: [new winston.transports.Console()],
});

if (process.env.NODE_ENV === 'test') {
  logger.transports.forEach((transport) => (transport.silent = true));
}
