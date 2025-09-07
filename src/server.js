import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

const app = express();
app.use(bodyParser.json());

const PORT = 8000;
const JWT_SECRET = "supersecret";

// ------------------ LOAD BOOKS ------------------
const booksPath = path.join(process.cwd(), "data", "books.json");
let rawBooks = JSON.parse(fs.readFileSync(booksPath, "utf-8"));

// Normalize books into an array
let books = [];
if (Array.isArray(rawBooks)) {
  books = rawBooks;
} else if (rawBooks.books && Array.isArray(rawBooks.books)) {
  books = rawBooks.books;
} else if (typeof rawBooks === "object") {
  books = Object.keys(rawBooks).map((isbn) => ({
    isbn,
    ...rawBooks[isbn],
  }));
} else {
  throw new Error("❌ Invalid books.json format");
}

console.log("📚 Books loaded:", books.length);

// ------------------ ROUTES ------------------

// Task 1: Get all books
app.get("/books", async (req, res) => {
  try {
    const data = await fs.promises.readFile(booksPath, "utf-8");
    let rawBooks = JSON.parse(data);
    let booksArr = [];
    if (Array.isArray(rawBooks)) {
      booksArr = rawBooks;
    } else if (rawBooks.books && Array.isArray(rawBooks.books)) {
      booksArr = rawBooks.books;
    } else if (typeof rawBooks === "object") {
      booksArr = Object.keys(rawBooks).map((isbn) => ({
        isbn,
        ...rawBooks[isbn],
      }));
    } else {
      throw new Error("❌ Invalid books.json format");
    }
    res.json(booksArr);
  } catch (err) {
    res.status(500).json({ message: "Failed to load books", error: err.message });
  }
});

// Task 2: Get book(s) by ISBN
app.get("/books/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const result = books.filter((b) => b.isbn === isbn);
  if (result.length > 0) {
    res.json(result);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get all books by author
app.get("/books/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = books.filter((b) => b.author.toLowerCase() === author);
  res.json(result);
});

// Task 4: Get all books by title
app.get("/books/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = books.filter((b) => b.title.toLowerCase().includes(title));
  res.json(result);
});

// Task 5: Get book reviews by ISBN
app.get("/books/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find((b) => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) {
    return res.json({ reviews: "No reviews yet" });
  }

  res.json({ title: book.title, reviews: book.reviews });
});

// ------------------ USER AUTH ------------------
let users = [];

// Task 6: Register
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }
  users.push({ username, password });
  res.json({ message: "User registered successfully" });
});

// Task 7: Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

// Middleware to protect routes
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Task 8: Add/Modify review
app.post("/books/review/:isbn", authenticate, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const book = books.find((b) => b.isbn === isbn);

  if (!book) return res.status(404).json({ message: "Book not found" });

  if (!book.reviews) book.reviews = {};
  book.reviews[req.user.username] = review;

  res.json({ message: "Review added/modified", reviews: book.reviews });
});

// Task 9: Delete review
app.delete("/books/review/:isbn", authenticate, (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find((b) => b.isbn === isbn);

  if (!book || !book.reviews || !book.reviews[req.user.username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete book.reviews[req.user.username];
  res.json({ message: "Review deleted", reviews: book.reviews });
});

// ------------------ START SERVER ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
