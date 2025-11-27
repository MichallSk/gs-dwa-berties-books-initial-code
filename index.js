// ===========================
// BERTIE'S BOOKS - MAIN SERVER
// ===========================

// Import required packages/libraries
require('dotenv').config()                  // Load environment variables from .env
var session = require('express-session')  // Session management for Express
var express = require ('express')           // Web framework for Node.js
var ejs = require('ejs')                    // Template engine (generates HTML dynamically)
const path = require('path')                // Utility for working with file paths
var mysql = require('mysql2');              // Database driver for MySQL

// ===== SETUP =====
// Create the Express application object
const app = express()
const port = 8000                           // Server runs on port 8000 (localhost:8000)

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))

// ===== DATABASE CONFIGURATION =====
// Set up MySQL database connection pool (multiple connections for better performance)
// Credentials come from environment variables (see .env and README dotenv section)
const db = mysql.createPool({
    host: process.env.BB_HOST || 'localhost',  // Database server location
    user: process.env.BB_USER,                 // Database user
    password: process.env.BB_PASSWORD,         // Database password
    database: process.env.BB_DATABASE,         // Database name
    waitForConnections: true,               // Wait for connection if limit reached
    connectionLimit: 10,                    // Max simultaneous connections
    queueLimit: 0,                          // Unlimited queue for pending connections
});
global.db = db;                             // Make database available to all routes

// ===== TEMPLATE ENGINE =====
// Tell Express to use EJS for rendering HTML templates
app.set('view engine', 'ejs')

// ===== MIDDLEWARE =====
// Enable parsing of form data (POST request bodies)
app.use(express.urlencoded({ extended: true }))

// Serve static files (CSS, JavaScript, images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')))

// ===== APPLICATION DATA =====
// Store shop information to use in all templates
app.locals.shopData = {shopName: "Bertie's Books"}

// ===== ROUTE HANDLERS =====
// Load and register routes for homepage and about page (routes/main.js)
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load and register routes for user-related pages (routes/users.js)
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load and register routes for book-related pages (routes/books.js)
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)

// ===== START SERVER =====
// Start the web server and listen on the specified port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))