import { Server, Socket } from 'socket.io';

export default function setupSocket(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected to Socket.IO: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}
