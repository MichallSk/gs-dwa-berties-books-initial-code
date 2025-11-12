// ===================================
// BOOK ROUTES (Search, List, Add)
// ===================================

// Import Express router
const express = require("express")
const router = express.Router()

// ===== ROUTES =====

// SEARCH PAGE - GET /search
// Displays the search form for looking up books
router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

// ADD BOOK PAGE - GET /addbook
// Displays the form to add a new book to the database
router.get('/addbook', function(req, res, next){
    res.render("addbook.ejs")
});

// SEARCH RESULT - GET /search-result
// Processes the search query from the form
// Example: /search-result?keyword=animal
router.get('/search-result', function (req, res, next) {
    res.send("You searched for: " + req.query.keyword)
});

// LIST ALL BOOKS - GET /list
// Fetches all books from the database and displays them in a list
router.get('/list', function(req, res, next) {
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
router.post('/bookadded', function (req, res, next) {
    // SQL query with placeholders (?) for safe data insertion
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    
    // Extract book name and price from the form submission
    let newrecord = [req.body.name, req.body.price]
    
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
}) 

// Export the router so it can be used in index.js
module.exports = router
