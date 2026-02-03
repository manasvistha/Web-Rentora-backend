import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// If your file is src/database/database.db.ts
import { connectDB } from './database/database.db';
import { PORT, ALLOWED_ORIGINS } from './config/index.ts'; 
import authRoutes from './routes/auth.route.ts';
import adminUserRoutes from './routes/admin.user.route.ts';

const app: Application = express();

// 1. DATABASE CONNECTION
connectDB();

// 2. BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SECURITY & LOGGING
app.use(helmet()); 
app.use(morgan('dev')); 

// 4. CORS CONFIGURATION
app.use(cors({
  origin: (origin, callback) => {
    // Crucial for Flutter: Mobile apps often send requests with no origin
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 5. SANITIZATION MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
  const skipFields = ["email", "password", "profilePicture"];
  
  const sanitize = (obj: any): any => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const key in obj) {
        if (skipFields.includes(key) || typeof obj[key] !== "string") {
          continue;
        }
        let value = obj[key];
        value = value.replace(/\$/g, ""); // Remove $ to prevent NoSQL injection
        if (!value.includes("@")) {
          value = value.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Simple XSS escape
        }
        obj[key] = value;
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  next();
});

// 6. RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// 7. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminUserRoutes);

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "Rentora API is live" });
});

// Static files for images
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/public/profile-pictures', express.static(path.join(__dirname, '../uploads/profile-pictures')));

// 8. ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 9. SERVER START
const port = PORT || 5000;
app.listen(Number(port), "0.0.0.0", () => {
  console.log(`\n✅ Rentora Server Started`);
  console.log(`📡 Port: ${port}`);
  console.log(`📱 For Flutter connection, use your machine's IP address.`);
});