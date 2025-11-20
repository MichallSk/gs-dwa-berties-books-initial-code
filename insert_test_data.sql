# Insert data into the tables

USE berties_books;

INSERT INTO books (name, price)
VALUES ('Brighton Rock', 20.25),
	   ('Brave New World', 25.00),
	   ('Animal Farm', 12.99);

-- Insert a default user 'gold' with password 'smiths'
-- The password_hash below is bcrypt-hashed version of 'smiths'
INSERT INTO users (username, first_name, last_name, email, password_hash)
VALUES ('gold', 'Gold', 'User', 'gold@example.com', '$2b$10$hnHlyzwTyURiVWASGixfb.27aahcF3UDqe1jHiyCI5s5fNlxWEQSm');