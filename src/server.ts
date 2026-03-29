// src/server.ts

import { createServer } from 'node:http';           // Implement Web Sockets
import { Server } from "socket.io";                 // Implement Web Sockets
import app from './App';

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { origin: ['http://localhost:5173', 'https://circle-dw.vercel.app'] }
});

// Make 'io' accessible to controllers
app.set("io", io);

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Backend Server and WebSockets running on http://localhost:${PORT}`);
});