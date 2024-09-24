require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Setup app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter)

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const mainRoute = require('./routes/main_route');
app.use('/', mainRoute);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { message: err.message, error: err });
});

// Start the server
const port = process.env.APP_PORT || 3000;
const host = process.env.APP_HOST || '127.0.0.1';
const server = http.createServer(app);

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});

//Graceful shutdown to avoid port conflict
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated, server closed.');
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Process interrupted, server closed.');
  });
});
