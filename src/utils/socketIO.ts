const socketIO = (io: import('socket.io').Server) => {
  io.on('connection', (socket) => {
    console.log(`ID: ${socket.id} just connected`);

    socket.on('join-room', (data: { roomId?: string }, callback: (msg: string) => void) => {
      if (data?.roomId) {
        socket.join('room' + data.roomId);
        callback('Join room successful');
      } else {
        callback('Must provide a valid user id');
      }
    });

    socket.on('leave-room', (data: { roomId?: string }) => {
      if (data?.roomId) {
        socket.leave('room' + data.roomId);
      }
    });

    socket.on('disconnect', () => {
      console.log(`ID: ${socket.id} disconnected`);
    });
  });
};

export default socketIO;
