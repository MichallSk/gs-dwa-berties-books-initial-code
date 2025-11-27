// ===================================
// BOOK ROUTES (Search, List, Add)
// ===================================

// Import Express router
const express = require("express")
const { check, validationResult } = require('express-validator');
const router = express.Router()

// Middleware to redirect to login if user is not authenticated
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

// ===== ROUTES =====

// SEARCH PAGE - GET /search
// Displays the search form for looking up books
router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

// ADD BOOK PAGE - GET /addbook
// Displays the form to add a new book to the database
router.get('/addbook', redirectLogin, function(req, res, next){
    res.render("addbook.ejs")
});

// SEARCH RESULT - GET /search-result
// Processes the search query from the form and returns matching books
// Example: /search-result?search_text=animal
router.get('/search-result', function (req, res, next) {
    // Read the search text from the form (name="search_text")
    const term = req.query.search_text ? req.query.search_text.trim() : '';

    // If no search term provided, render a friendly message
    if (!term) {
        return res.render('search-result.ejs', { query: term, results: [] });
    }

    // Use a parameterized LIKE query to find books whose name contains the term
    const sql = "SELECT * FROM books WHERE name LIKE ?";
    const params = ['%' + term + '%'];

    db.query(sql, params, (err, result) => {
        if (err) return next(err);

        // Render the search-result template with the results (may be empty)
        res.render('search-result.ejs', { query: term, results: result });
    });
});

// LIST ALL BOOKS - GET /list
// Fetches all books from the database and displays them in a list
router.get('/list', redirectLogin, function(req, res, next) {
    // SQL query to get all books from the database
    let sqlquery = "SELECT * FROM books";
    
    // Execute the query
    db.query(sqlquery, (err, result) => {
        if (err) {
            // If there's an error, pass it to error handler
            next(err)
        }
        // Pass the books to the template for display
        res.render("list.ejs", {availableBooks:result})
    });
});

// ADD BOOK - POST /bookadded
// Handles form submission to add a new book to the database
// Data received: name (book title) and price
router.post('/bookadded', 
    redirectLogin,
    [check('name').notEmpty().withMessage('Book name is required'),
     check('name').isLength({ min: 1, max: 100 }).withMessage('Book name must be 1-100 characters'),
     check('price').notEmpty().withMessage('Price is required'),
     check('price').isFloat({ min: 0, max: 9999.99 }).withMessage('Price must be a valid number between 0 and 9999.99')],
    function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('./addbook')
    }
    
    // SQL query with placeholders (?) for safe data insertion
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    
    // Extract book name and price from the form submission
    let newrecord = [req.sanitize(req.body.name), req.body.price]
    
    // Execute the insert query
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            // If there's an error, pass it to error handler
            next(err)
        }
        else {
            // Success! Display confirmation message with the book details
            res.send('This book is added to database, name: '+ req.body.name + ' price: £'+ req.body.price)
        }
    })
});

// BARGAIN BOOKS - GET /bargainbooks
// Fetches all books priced under £20 and displays them
router.get('/bargainbooks', redirectLogin, function(req, res, next) {
    // SQL query to get books priced under £20
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    
    // Execute the query
    db.query(sqlquery, (err, result) => {
        if (err) {
            // If there's an error, pass it to error handler
            next(err)
        }
        // Pass the bargain books to the template for display
        res.render("bargainbooks.ejs", {bargainBooks:result})
    });
});

// Export the router so it can be used in index.js
module.exports = router
