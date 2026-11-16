import mongoose from 'mongoose';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import socketIO from './utils/socketIO';
import 'dotenv/config';

const myIp = process.env.BACKEND_IP;

let server: ReturnType<typeof app.listen> | undefined;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  server = app.listen(config.port, myIp as string, () => {
    logger.info(`Listening to ip http://${myIp}:${config.port}`);
  });

  const io = new SocketServer(server, {
    cors: {
      origin: '*',
    },
  });

  socketIO(io);

  global.io = io;
  server.listen(config.port, process.env.BACKEND_IP as string, () => {});
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
