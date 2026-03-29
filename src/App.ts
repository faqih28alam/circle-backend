// App.ts

// IMPORT EXPRESS
import express, { Request, Response } from 'express';
import authRoutes from './routes/auth-route';                     // import auth routes
import appRoutes from './routes/app-route';                       // import app routes
import userRoutes from './routes/user-route'
import followRoutes from './routes/follow-route';
import corsMiddleware from './middlewares/cors';                  // import CORS for bridge to client side

const app = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Routes
app.use('/api', authRoutes);
app.use('/api', appRoutes);
app.use('/api', userRoutes);
app.use('/api', followRoutes);

// global error handler: middleware for any unexpected errors 
app.use((err: any, req: any, res: any, next: any) => {
  console.log("Error: ", err);
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

export default app;