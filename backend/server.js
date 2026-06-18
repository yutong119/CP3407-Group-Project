require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();

// Middleware 中间件设置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Database connection pool 数据连接池：不用每次请求都创建新连接，可以复用连接，大大提高性能。
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'safestay_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Make pool accessible to routes 挂载中间件
app.use((req, res, next) => {
  req.pool = pool;  // 将数据库连接池挂到每个请求对象上
  next();           // 继续处理请求
});

// Routes 路由挂载
app.use('/api/users', require('./routes/users'));      // /api/users/* 交给 users.js 处理
app.use('/api/cases', require('./routes/cases'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/categories', require('./routes/categories'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SafeStay Backend is running' });
});

// Error handling middleware 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SafeStay Backend running on port ${PORT}`);
});
