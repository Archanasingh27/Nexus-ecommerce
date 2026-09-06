// Shared Backend REST API for Nexus MERN E-Commerce Platform
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { seedDatabase } from './seed/seeder.js';
import Product from './models/Product.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import advertisementRoutes from './routes/advertisementRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import path from 'path';

dotenv.config();

const app = express();

const server = http.createServer(app);

// Initialize Real-Time Socket.IO Server
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach io to global for controllers to access
global.io = io;

io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`);

  // Rider joins duty room or location room
  socket.on('join_rider_room', (riderId) => {
    if (riderId) {
      socket.join(`rider_${riderId}`);
      console.log(`[Socket.IO] Rider ${riderId} joined personal room`);
    }
  });

  socket.on('join_vendor_room', (vendorId) => {
    if (vendorId) {
      socket.join(`vendor_${vendorId}`);
      console.log(`[Socket.IO] Vendor ${vendorId} joined vendor room`);
    }
  });

  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket.IO] User ${userId} joined user room`);
    }
  });

  socket.on('join_order_tracking', (orderId) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
      console.log(`[Socket.IO] Client joined order tracking room: order_${orderId}`);
    }
  });

  socket.on('join_city_room', (city) => {
    if (city) {
      const room = `city_${city.toLowerCase().trim()}`;
      socket.join(room);
      console.log(`[Socket.IO] Rider joined city room: ${room}`);
    }
  });

  // Real-Time GPS Tracking Broadcaster
  socket.on('rider_location_update', (locationData) => {
    if (locationData) {
      if (locationData.orderId) {
        socket.to(`order_${locationData.orderId}`).emit('rider_location_updated', locationData);
        global.io.emit(`tracking_${locationData.orderId}`, locationData);
      }
      if (locationData.userId) {
        socket.to(`user_${locationData.userId}`).emit('rider_location_updated', locationData);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Dynamic CORS Configuration to support all Vercel domains, preview deployments, and localhosts
const corsOptions = {
  origin: (origin, callback) => {
    // Allow any origin (reflect incoming origin)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Auto-connect DB middleware for serverless/Vercel support
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health Check API
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Nexus MERN E-Commerce Backend with Socket.IO Multi-Vendor & Delivery Engine',
    timestamp: new Date().toISOString(),
  });
});

// Root API Welcome
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'NEXUS Commerce API Server is active.',
    health: '/health',
  });
});

// Mount Routes (Supports both direct /route and /api/route)
const apiRoutes = [
  ['/auth', authRoutes],
  ['/products', productRoutes],
  ['/categories', categoryRoutes],
  ['/orders', orderRoutes],
  ['/admin', adminRoutes],
  ['/users', userRoutes],
  ['/newsletter', newsletterRoutes],
  ['/advertisements', advertisementRoutes],
  ['/delivery', deliveryRoutes],
  ['/vendor', vendorRoutes],
  ['/upload', uploadRoutes],
  ['/chat', chatRoutes],
  ['/coupons', couponRoutes],
];

apiRoutes.forEach(([path, router]) => {
  app.use(path, router);
  app.use(`/api${path}`, router);
});

// Serve uploaded static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Seeder reset trigger endpoint for admin / dev convenience
app.post('/seed/reset', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database reset and seeded with demo data' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/seed/reset', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database reset and seeded with demo data' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database has 0 products
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Server] Database is empty. Running automatic seed...');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('[Server] Auto-seed check skipped:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Nexus Commerce Backend with Socket.IO running on port ${PORT}`);
  });
};

// Only start standalone HTTP server when not in serverless execution
if (!process.env.VERCEL) {
  startServer();
}

// Server entrypoint - Nexus Multi-Vendor Marketplace
export { io, server };
export default app;
