// ===================================
// API ROUTES
// ===================================

const express = require('express')

const router = express.Router()

// GET /api/books
// Returns the book catalogue as JSON, optionally filtered by ?search=
router.get('/books', (req, res, next) => {
  const rawTerm = typeof req.query.search === 'string' ? req.query.search : ''
  const sanitizedTerm = rawTerm && typeof req.sanitize === 'function' ? req.sanitize(rawTerm) : rawTerm
  const trimmedTerm = sanitizedTerm.trim()

  const rawMin = req.query.minprice ?? req.query.min_price
  const rawMax = req.query.maxprice ?? req.query.max_price

  const rawSort = typeof req.query.sort === 'string' ? req.query.sort : ''
  const sanitizedSort = rawSort && typeof req.sanitize === 'function' ? req.sanitize(rawSort) : rawSort
  const sortValue = sanitizedSort.trim().toLowerCase()

  const minPrice = rawMin !== undefined && rawMin !== '' && !Number.isNaN(parseFloat(rawMin))
    ? parseFloat(rawMin)
    : null
  const maxPrice = rawMax !== undefined && rawMax !== '' && !Number.isNaN(parseFloat(rawMax))
    ? parseFloat(rawMax)
    : null

  let sqlquery = 'SELECT * FROM books'
  const params = []

  const conditions = []

  if (trimmedTerm) {
    conditions.push('name LIKE ?')
    params.push('%' + trimmedTerm + '%')
  }

  if (minPrice !== null) {
    conditions.push('price >= ?')
    params.push(minPrice)
  }

  if (maxPrice !== null) {
    conditions.push('price <= ?')
    params.push(maxPrice)
  }

  if (conditions.length > 0) {
    sqlquery += ' WHERE ' + conditions.join(' AND ')
  }

  let orderClause = ''
  if (sortValue === 'name') {
    orderClause = ' ORDER BY name ASC'
  } else if (sortValue === 'price') {
    orderClause = ' ORDER BY price ASC'
  }

  db.query(sqlquery + orderClause, params, (err, result) => {
    if (err) {
      res.json(err)
      return next(err)
    }
    res.json(result)
  })
})

module.exports = router
