// App.ts

// IMPORT EXPRESS
import express, { Request, Response } from 'express';
import authRoutes from './routes/auth-route'; //import auth routes
import appRoutes from './routes/app-route';
import corsMiddleware from './middlewares/cors';
import path from 'path';


const app = express();

// Middleware to parse JSON bodies (Crucial for Postman POST requests)
app.use(express.json());
// Middleware for CORS
app.use(corsMiddleware);

// Routes
app.use('/auth', authRoutes);
app.use('/api', appRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  res.send('Welcome to the Shopping Cart API!');
});

app.listen(process.env.PORT || 3000, () => {    // Start server and listen on specified port
  console.log(`Backend server is running on http://localhost:${process.env.PORT || 3000}`); // Log message when server starts
});