import type { Server as SocketIoServer } from 'socket.io';

declare global {
  // eslint-disable-next-line no-var
  var io: SocketIoServer | undefined;
}

export {};
