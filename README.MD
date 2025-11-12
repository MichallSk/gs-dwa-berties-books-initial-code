# Bertie's Books

An educational sample web application for the Dynamic Web Applications module. The app is a small Express + EJS site that stores and displays a catalogue of books in a MySQL database.

## Features
- List all books
- Add a new book (form)
- Filter bargain books
- Simple search page

## Prerequisites
- Node.js (v14+ recommended)
- npm (comes with Node.js)
- MySQL server (local or remote)

## Configuration

By default the app connects to MySQL using the settings in `index.js`:

```js
host: 'localhost',
user: 'berties_books_app',
password: 'qwertyuiop',
database: 'berties_books',
```

If your MySQL server or credentials differ, change them in `index.js` or add your own environment/secret management. When running the app under a process manager (for example `forever`), it's a good idea to set the views directory explicitly in `index.js` so templates are found regardless of the current working directory:

```js
app.set('views', path.join(__dirname, 'views'))
```

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
