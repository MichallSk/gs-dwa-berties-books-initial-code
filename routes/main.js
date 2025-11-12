// ===================================
// MAIN ROUTES (Homepage and About)
// ===================================

// Import Express router
const express = require("express")
const router = express.Router()

// ===== ROUTES =====

// HOME PAGE - GET /
// Renders the main homepage
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

// ABOUT PAGE - GET /about
// Renders the about page with shop information
router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

// Export the router so it can be used in index.js
module.exports = router