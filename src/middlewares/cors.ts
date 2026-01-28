// cors.ts
// this middleware allows cross-origin resource sharing (CORS) for the Express application
// untuk melidungikan akses ke API dari domain lain. Analogi CORS = SATPAM disebuah bangunan

import cors from 'cors';


// this only works on frontend, cant test with postman
const corsMiddleware = cors({
        origin: ['http://localhost:5173', 'kilau.ai'], // ganti dengan URL front-end kamu
        methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],  // set the allowed HTTP methods
        credentials: true,                                  // allow credentials
    });
    
export default corsMiddleware; 