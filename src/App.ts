// App.ts

// IMPORT EXPRESS
import express, { Request, Response } from 'express';
import authRoutes from './routes/auth-route'; //import auth routes
import appRoutes from './routes/app-route';
import corsMiddleware from './middlewares/cors';
import path from 'path';
import { createServer } from 'node:http';                         // Implement Web Sockets
import { Server } from "socket.io";                               // Implement Web Sockets

const app = express();
const httpServer = createServer(app);                             // Implement Web Sockets
const io = new Server(httpServer, {                               // Implement Web Sockets
  cors: { origin: 'http://localhost:5173' } 
});         
// Make 'io' accessible to your controllers
app.set("io", io);

// Middleware to parse JSON bodies (Crucial for Postman POST requests)
app.use(express.json());
// Middleware for CORS
app.use(corsMiddleware);

// Routes
app.use('/auth', authRoutes);
app.use('/api', appRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
});

// Start server and listen on specified port
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Backend Server and WebSockets running on http://localhost:${PORT}`);
});

// global error handler: middleware for any unexpected errors 
app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ // Changed .send to .json for consistency
    success: false,
    message: err.message || 'Internal Server Error' 
  });
});

// Health Check / Welcome Route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Circle App API!');
});