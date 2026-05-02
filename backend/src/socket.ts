import { Server, Socket } from 'socket.io';

let waitingPlayer: { id: string; username: string; socket: Socket } | null = null;
const activeRooms: Map<string, { p1: any, p2: any, problemId: number, startTime: number }> = new Map();

export default function setupSocket(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected to Socket.IO: ${socket.id}`);

        socket.on('find_match', (data: { username: string }) => {
            console.log(`${data.username} is looking for a match...`);
            
            if (waitingPlayer) {
                // Match found
                const roomId = `battle_${Date.now()}`;
                const problemId = Math.floor(Math.random() * 10) + 1; // Random problem 1-10
                
                activeRooms.set(roomId, {
                    p1: waitingPlayer,
                    p2: { id: socket.id, username: data.username, socket },
                    problemId,
                    startTime: Date.now()
                });

                waitingPlayer.socket.join(roomId);
                socket.join(roomId);

                io.to(roomId).emit('match_found', { 
                    roomId, 
                    problemId,
                    opponent: {
                        p1: waitingPlayer.username,
                        p2: data.username
                    }
                });

                waitingPlayer = null;
            } else {
                // Wait for match
                waitingPlayer = { id: socket.id, username: data.username, socket };
                socket.emit('waiting_for_match');
            }
        });

        socket.on('submit_battle_code', (data: { roomId: string, score: number, username: string }) => {
            const room = activeRooms.get(data.roomId);
            if (!room) return;

            if (data.score > 0) {
                io.to(data.roomId).emit('battle_over', { 
                    winner: data.username, 
                    score: data.score 
                });
                activeRooms.delete(data.roomId);
            }
        });

        socket.on('disconnect', () => {
            if (waitingPlayer?.id === socket.id) {
                waitingPlayer = null;
            }
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}
