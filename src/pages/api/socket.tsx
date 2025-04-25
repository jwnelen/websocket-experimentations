// File: pages/api/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
    io?: SocketIOServer | undefined;
    connectedClients?: Set<string>;
}

interface SocketWithIO extends NetSocket {
    server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
    if (!res.socket.server.connectedClients) {
        res.socket.server.connectedClients = new Set<string>();
    }

    if (res.socket.server.io) {
        console.log('Socket is already running');
        // If it's a GET request, return the current connection count
        if (req.method === 'GET') {
            return res.status(200).json({
                connectionCount: res.socket.server.connectedClients.size,
            });
        }
    } else {
        console.log('Socket is initializing');
        const io = new SocketIOServer(res.socket.server);
        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);

            // Handle incoming messages
            socket.on('message', (data) => {
                io.emit('message', data);
            });

            socket.on('is-typing', (data) => {
                console.log('istyping: ', data);
                io.emit('is-typing', data);
            });

            // Handle client disconnection
            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    res.end();
};

export default SocketHandler;
