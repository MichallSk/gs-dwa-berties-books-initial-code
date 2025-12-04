# Bertie's Books

An educational sample web application for the Dynamic Web Applications module. The app is a small Express + EJS site that stores and displays a catalogue of books in a MySQL database.

## Features
- List all books
- Add a new book (form)
- Filter bargain books
- Simple search page
- Interactive weather lookup (OpenWeatherMap)
- Book catalogue JSON API (GET /api/books)

## Prerequisites
- Node.js (v14+ recommended)
- npm (comes with Node.js)
- MySQL server (local or remote)

## Configuration

By default the app connects to MySQL using environment variables, which are read in `index.js`:

```js
host: process.env.BB_HOST || 'localhost',
user: process.env.BB_USER,
password: process.env.BB_PASSWORD,
database: process.env.BB_DATABASE,
```

If your MySQL server or credentials differ, change them in `index.js` or add your own environment/secret management. When running the app under a process manager (for example `forever`), it's a good idea to set the views directory explicitly in `index.js` so templates are found regardless of the current working directory:

```js
app.set('views', path.join(__dirname, 'views'))
```

## dotenv

To avoid committing database credentials to the repository, the project uses the `dotenv` module:


Example `.env` file used in development (matching the lecturer's marking setup):

```env
BB_USER=berties_books_app
BB_PASSWORD=qwertyuiop
BB_DATABASE=berties_books
BB_HOST=localhost
OWM_API_KEY=your_openweathermap_api_key_here
```

`.env` is **not** pushed to GitHub; on the lecturer's machine these variables will be set with the same names and values before running the app.

## Weather route

- `/weather` renders a form that lets visitors choose a city and view current conditions returned by OpenWeatherMap.
- The page highlights temperature, feels-like, humidity, wind, and cloud cover in a simple card layout.
- For convenience the sample code ships with a placeholder API key defined directly in `routes/weather.js`. Replace it with your own key before deploying and consider moving it back into an environment variable.

## API endpoints
- `/api/books` returns every book in JSON format with no authentication, making it easy to consume the catalogue programmatically.
- Optional query parameters: `search` (substring match on name), `minprice` / `maxprice` (numeric filters, supports snake_case variations), and `sort` (`name` or `price`, ascending). Parameters can be combined.
- Example calls:
   - `GET /api/books` → full catalogue.
   - `GET /api/books?search=world` → titles containing "world".
   - `GET /api/books?minprice=5&maxprice=10&sort=price` → £5-£10 books sorted by price.
   - `GET /api/books?search=classic&sort=name` → alphabetical list of matching books.

## Audit

The application records an audit trail of login attempts so that successful and failed logins can be reviewed later:

- A new `audit_log` table is created in `create_db.sql` with columns `username`, `success`, `ip_address`, and `created_at`.
- The `/users/loggedin` route inserts a row into `audit_log` for every login attempt:
	- `success = 1` for successful logins.
	- `success = 0` for failed logins (wrong username or password).
- The IP address of the client (`req.ip`) is stored when available.
- The `/users/audit` route queries `audit_log` ordered by timestamp and renders the `audit.ejs` view, which displays the full audit history in a simple table.

## Access Control

The application uses `express-session` to manage user sessions and restricts access to certain pages:

**Protected routes (login required):**
- `/users/list` — view registered users
- `/users/audit` — view login audit history
- `/users/logout` — logout (must be logged in to logout)
- `/books/addbook` — form to add a new book
- `/books/bookadded` — submit a new book
- `/books/bargainbooks` — view bargain books

**Public routes (no login required):**
- `/` — homepage
- `/about` — about page
- `/books/list` — view all books
- `/users/register` — registration form
- `/users/registered` — registration confirmation
- `/users/login` — login form
- `/users/loggedin` — login processing
- `/books/search` — search form
- `/books/search-result` — search results
- `/weather` — interactive weather page (OpenWeatherMap)
- `/api/books` — JSON list of all books
- `/api/books?search=term` — filtered JSON list of books containing `term`
- `/api/books?minprice=5&max_price=10` — books priced between £5 and £10 (supports `minprice/maxprice` or `min_price/max_price`)
- `/api/books?sort=name` — sorted results (supports `name` or `price`)

The `redirectLogin` middleware checks for `req.session.userId`; if absent, users are redirected to the login page. When a user successfully logs in via `/users/loggedin`, their username is stored in `req.session.userId` and they gain access to protected routes.

## Validation

The application uses `express-validator` to perform server-side validation on user input before processing or storing data in the database.

**Where validation is applied:**

1. **User Registration (`/users/registered`)**
   - Email: Must be valid email format
   - Username: 5-20 characters, alphanumeric only
   - Password: Minimum 8 characters
   - First name: Required, letters only
   - Last name: Required, letters only
   - **Reasoning**: Registration data is stored permanently in the database and used for authentication. Invalid data could cause security issues, database errors, or broken login functionality.

2. **User Login (`/users/loggedin`)**
   - Username: Required (not empty)
   - Password: Required (not empty)
   - **Reasoning**: Prevents empty submissions and database queries with null values. Although failed logins are logged in the audit trail, validation ensures clean data reaches the authentication logic.

3. **Add Book (`/books/bookadded`)**
   - Book name: Required, 1-100 characters
   - Price: Required, must be a valid number between 0 and 9999.99
   - **Reasoning**: Books are stored in the database and displayed throughout the app. Invalid prices could break display logic (e.g., `toFixed()` calls) or cause incorrect financial data. Name length limits prevent database overflow.

**Where validation is NOT applied:**

1. **Search (`/books/search-result`)**
   - **Reasoning**: Search is a read-only operation that doesn't modify data. Empty or unusual search terms simply return no results. The query uses parameterized statements to prevent SQL injection, so validation beyond that is unnecessary.

2. **Static/Read-Only Routes (`/books/list`, `/books/bargainbooks`, `/users/list`, `/users/audit`)**
   - **Reasoning**: These routes only display data from the database and don't accept user input beyond authentication checks. No validation is needed.

3. **Homepage and About (`/`, `/about`)**
   - **Reasoning**: No user input is collected on these pages.

**Validation Strategy**: Validation is applied to all routes that accept user input and either store it in the database or use it in critical operations (authentication, data modification). If validation fails, users are redirected back to the form to correct their input. This prevents invalid data from entering the system while maintaining a simple user experience.

## Sanitization

The application uses `express-sanitizer` to remove potentially malicious HTML and script tags from user input, protecting against XSS (Cross-Site Scripting) attacks.

**Where sanitization is applied:**

1. **User Registration (`/users/registered`)**
   - Username: Sanitized to remove HTML/script tags
   - First name: Sanitized to remove HTML/script tags
   - Last name: Sanitized to remove HTML/script tags
   - Email: Sanitized to remove HTML/script tags
   - **Reasoning**: These fields are stored in the database and displayed on pages like `/users/list` and audit logs. Without sanitization, malicious users could inject script tags (e.g., `<script>alert('XSS')</script>`) that would execute when other users view these pages, compromising security.

2. **User Login (`/users/loggedin`)**
   - Username: Sanitized to remove HTML/script tags
   - **Reasoning**: The username is displayed in success/failure messages and stored in the audit log. Sanitizing prevents any injected scripts from executing when viewing login results or audit history.

3. **Add Book (`/books/bookadded`)**
   - Book name: Sanitized to remove HTML/script tags
   - **Reasoning**: Book names are displayed on multiple pages (`/books/list`, `/books/bargainbooks`, search results). If a malicious user adds a book with `<script>` tags in the name, those scripts would execute for anyone viewing the book list, creating an XSS vulnerability.

**Where sanitization is NOT applied:**

1. **Passwords (Registration and Login)**
   - **Reasoning**: Passwords are hashed with bcrypt before storage and are never displayed to users. Sanitizing passwords could alter their value and break authentication. Since passwords are hashed and not rendered in HTML, they don't pose an XSS risk. Additionally, users should be free to use any characters in their passwords for stronger security.

2. **Price fields (`/books/bookadded`)**
   - **Reasoning**: Prices are numeric values validated by `express-validator` to ensure they're valid floats. HTML/script tags cannot be valid numbers, so validation already prevents malicious input. The price field is also not a typical vector for XSS attacks since it's restricted to numeric format.

3. **Search queries (`/books/search-result`)**
   - **Reasoning**: Search terms are only used in parameterized SQL queries and displayed back to the user who submitted them. They are not stored in the database or shown to other users, so the XSS risk is minimal. Parameterized queries already prevent SQL injection.

**Sanitization Strategy**: Sanitization is applied to all text fields that are (1) stored in the database AND (2) displayed to users on rendered pages. This prevents stored XSS attacks where malicious content could affect other users. Fields that are hashed, numeric-only, or only shown to the submitter are not sanitized to preserve functionality and user choice.

## Run the application

Start the app in the foreground for development:

```powershell
node index.js
```

Or use `forever` (or another process manager) to run it in the background on a Linux VM:

```bash
# install forever globally (once)
npm install -g forever

# start the app (run from project root)
forever start index.js

# restart or list processes
forever list
forever restart index.js
```

By default the server listens on port `8000`. Open `http://localhost:8000/` (or replace with your VM's host/port) in a browser.

## Useful routes

- GET `/` — Homepage
- GET `/about` — About page
- GET `/books/list` — Show all books
- GET `/books/addbook` — Form to add a book (POSTs to `/books/bookadded`)
- POST `/books/bookadded` — Adds the submitted book to the database
- GET `/books/bargainbooks` — Shows books priced under £20
- GET `/books/search` — Search page

## Views and templates

EJS templates live in the `views/` folder. Templates used by the app include `index.ejs`, `list.ejs`, `addbook.ejs`, `bargainbooks.ejs`, `search.ejs`, and `register.ejs`.


## Development notes
- The project uses `mysql2` as the MySQL driver. The app sends `name` and `price` fields to the `books` table — the column for the title is `name` in the SQL scripts.
- When formatting prices in templates, the code converts values with `parseFloat(book.price).toFixed(2)` because database values may be returned as strings.

## License & attribution
This project is a student/example project for learning purposes. Feel free to adapt it for your coursework.
