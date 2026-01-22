// App.ts

// IMPORT EXPRESS
import express, { Request, Response } from 'express';
// import productRoutes from './routes/product-route'; //import product routes
// import orderRoutes from './routes/order-route';     //import order routes
// import transferPointsRoutes from './routes/transferPoints-route'; //import transfer points routes
// import supplierRoutes from './routes/supplier-route'; //import supplier routes
import authRoutes from './routes/auth-route'; //import auth routes
import corsMiddleware from './middlewares/cors';

const app = express();

// Middleware to parse JSON bodies (Crucial for Postman POST requests)
app.use(express.json());
// Middleware for CORS
app.use(corsMiddleware);

// Routes
// app.use('/api/v1', productRoutes);
// app.use('/api/v1', orderRoutes);
// app.use('/api/v1', transferPointsRoutes);
// app.use('/api/v1', supplierRoutes);
app.use('/auth', authRoutes);

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
  console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`); // Log message when server starts
});