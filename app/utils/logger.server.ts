import winston from "winston";

const custom = winston.format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const createLogger = (label: string) => {
  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp(),
      custom
    ),
    transports: [new winston.transports.Console()],
  });
  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        level: "verbose",
      })
    );
  }
  return logger;
};
