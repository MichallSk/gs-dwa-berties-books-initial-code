// Create a new router
const express = require("express")
const bcrypt = require('bcrypt')            // Task 1: import bcrypt
const saltRounds = 10                       // Task 1: define salt rounds
const { check, validationResult } = require('express-validator');
const router = express.Router()

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}


router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', 
                 [check('email').isEmail().withMessage('Invalid email address'),
                  check('username').isLength({ min: 5, max: 20}).withMessage('Username must be 5-20 characters'),
                  check('username').isAlphanumeric().withMessage('Username must contain only letters and numbers'),
                  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
                  check('first').notEmpty().withMessage('First name is required'),
                  check('first').isAlpha().withMessage('First name must contain only letters'),
                  check('last').notEmpty().withMessage('Last name is required'),
                  check('last').isAlpha().withMessage('Last name must contain only letters')], 
                 function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./register')
    }
    else {
        const username = req.sanitize(req.body.username)
        const first = req.sanitize(req.body.first)
        const last = req.sanitize(req.body.last)
        const email = req.sanitize(req.body.email)
        const plainPassword = req.body.password

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) return next(err)

            const sql = "INSERT INTO users (username, first_name, last_name, email, password_hash) VALUES (?,?,?,?,?)"
            const values = [username, first, last, email, hashedPassword]

            db.query(sql, values, function(dbErr) {
                if (dbErr) return next(dbErr)

                // Render a nicely formatted confirmation page
                res.render('registered.ejs', {
                    first,
                    last,
                    email,
                    username,
                    password: plainPassword,
                    hashedPassword
                })
            })
        })
    }
});

// LIST USERS PAGE - GET /users/list
// Shows a list of registered users (without passwords)
router.get('/list', redirectLogin, function (req, res, next) {
    const sql = "SELECT id, username, first_name, last_name, email FROM users";

    db.query(sql, function (err, result) {
        if (err) return next(err);

        res.render('users-list.ejs', { users: result });
    });
});

// LOGIN FORM PAGE - GET /users/login
// Shows a form asking for username and password
router.get('/login', function (req, res, next) {
    res.render('login.ejs')
});

// LOGIN PROCESSING - POST /users/loggedin
// Compares submitted username and password with values stored in the database
router.post('/loggedin',
    [check('username').notEmpty().withMessage('Username is required'),
     check('password').notEmpty().withMessage('Password is required')],
    function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('./login')
    }
    
    const username = req.sanitize(req.body.username)
    const plainPassword = req.body.password
	const ip = req.ip || null

    // Look up the user by username
    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], function (err, results) {
        if (err) return next(err)

        // If no user found, login fails
        if (!results || results.length === 0) {
            // Record failed login attempt in audit_log and stop
            const auditSql = "INSERT INTO audit_log (username, success, ip_address) VALUES (?,?,?)";

            return db.query(auditSql, [username, 0, ip], function (auditErr) {
                if (auditErr) return next(auditErr)

                return res.render('loggedin.ejs', {
                    success: false,
                    username,
                    message: 'Login failed: username or password is incorrect.'
                })
            })
        }

        const user = results[0]

        // Compare submitted password with stored hash
        bcrypt.compare(plainPassword, user.password_hash, function (compareErr, match) {
            if (compareErr) return next(compareErr)

            if (!match) {
                // Password does not match – record failed attempt and stop
                const auditSql = "INSERT INTO audit_log (username, success, ip_address) VALUES (?,?,?)";

                return db.query(auditSql, [username, 0, ip], function (auditErr) {
                    if (auditErr) return next(auditErr)

                    return res.render('loggedin.ejs', {
                        success: false,
                        username,
                        message: 'Login failed: username or password is incorrect.'
                    })
                })
            }

            // Successful login – record success and show a message
            // Save user session here, when login is successful
            req.session.userId = req.body.username;
            
            const auditSql = "INSERT INTO audit_log (username, success, ip_address) VALUES (?,?,?)";

            return db.query(auditSql, [username, 1, ip], function (auditErr) {
                if (auditErr) return next(auditErr)

                return res.render('loggedin.ejs', {
                    success: true,
                    username,
                    message: 'Login successful. Welcome back, ' + username + '!'
                })
            })
        })
    })
})

// AUDIT LOG PAGE - GET /users/audit
// Shows the full audit history of login attempts
router.get('/audit', redirectLogin, function (req, res, next) {
    const sql = "SELECT username, success, ip_address, created_at FROM audit_log ORDER BY created_at DESC";

    db.query(sql, function (err, result) {
        if (err) return next(err)

        res.render('audit.ejs', { auditEntries: result })
    })
})

// LOGOUT - GET /users/logout
// Destroys the user session and logs them out
router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router
