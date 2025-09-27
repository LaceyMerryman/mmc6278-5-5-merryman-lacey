// app.js
const express = require('express');
const path = require('path');
const apiRoutes = require('./api-routes');

const app = express();

// Middleware for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Use your API routes
app.use('/', apiRoutes);

module.exports = app;
