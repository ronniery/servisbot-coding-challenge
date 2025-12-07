import winston from 'winston';

const { combine, colorize, timestamp, printf, errors, splat } = winston.format;

const logStack = printf((info: winston.Logform.TransformableInfo) => {
  const { level, message } = info;
  const timestamp = info.timestamp as string;
  const stack = info.stack as string | undefined;

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
  logger.transports.forEach((transport: winston.transport) => (transport.silent = true));
}
