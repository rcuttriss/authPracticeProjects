// server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

const users = [];

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { name: req.body.name, password: hashedPassword };
    users.push(user);
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

app.post("/users/login", async (req, res) => {
  const user = users.find((user) => user.name === req.body.name);
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send("Success");
    } else {
      res.send("Not Allowed");
    }
  } catch {
    res.status(500).send();
  }
});

// Connect to the database
const db = new sqlite3.Database("./blogs.db", (err) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to database");
  }
});

// Create a table
const createTable = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    subtitle TEXT,
    content TEXT
  )`,
    (err) => {
      if (err) {
        console.error("Could not create table", err);
      } else {
        console.log("Table created or already exists");
      }
    }
  );
};

// Route to get all users
app.get("/blogs", (req, res) => {
  db.all(`SELECT * FROM blogs`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ blogs: rows });
    }
  });
});

// Route to add a user
app.post("/blogs", (req, res) => {
  const { title, subtitle, content } = req.body;
  db.run(
    `INSERT INTO blogs (title, subtitle, content) VALUES (?, ?, ?)`,
    [title, subtitle, content],
    (err) => {
      if (err) {
        console.error("Could not insert blog", err);
      } else {
        console.log("Blog inserted");
      }
    }
  );
  res.status(201).send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
