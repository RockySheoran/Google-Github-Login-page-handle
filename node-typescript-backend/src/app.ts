import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });  
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import { errorHandler, notFound } from './middlewares/errorMiddleware';
import './config/passport';
// import sanitize from './middlewares/sanitize';

// Load environment variables

// Connect to database
// connectDB();

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 3. Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Cookie Parser
app.use(cookieParser());

// 5. CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// 6. Custom Sanitization Middleware
// app.use(sanitize());

// 7. Prevent Parameter Pollution
app.use(
  hpp()
);

// 8. Passport Authentication
app.use(passport.initialize());

// 9. Routes
app.use('/api/auth', authRoutes);

// 10. Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running...',
    timestamp: new Date().toISOString(),
  });
});

// 11. Error Handling
app.use(notFound);
app.use(errorHandler);

// Server Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});