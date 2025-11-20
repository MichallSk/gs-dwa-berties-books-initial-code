-- Create database script for Berties books

-- Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

CREATE TABLE IF NOT EXISTS books (
    id     INT AUTO_INCREMENT,
    name   VARCHAR(50),
    price  DECIMAL(5, 2),
    PRIMARY KEY(id));

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    first_name    VARCHAR(50) NOT NULL,
    last_name     VARCHAR(50) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL  # bcrypt hashes are 60 chars
);

# Audit log table to store login attempts (successful and failed)
CREATE TABLE IF NOT EXISTS audit_log (
     id         INT AUTO_INCREMENT PRIMARY KEY,
     username   VARCHAR(50) NOT NULL,
     success    TINYINT(1) NOT NULL,
     ip_address VARCHAR(45) NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the application user
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON berties_books.* TO 'berties_books_app'@'localhost';
