// database.js

const sqlite3 = require("sqlite3").verbose();

// Connect to the database (or create it if it doesn't exist)
const db = new sqlite3.Database("./blogs.db", (err) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to database");
  }
});

// Example function to insert a user
const insertBlog = (title, subtitle, text) => {
  db.run(
    `INSERT INTO blogs (title, subtitle, content) VALUES (?, ?, ?)`,
    [title, subtitle, text],
    (err) => {
      if (err) {
        console.error("Could not insert user", err);
      } else {
        console.log("User inserted");
      }
    }
  );
};

// Example function to query users
const getBlogs = () => {
  db.all(`SELECT * FROM blogs`, [], (err, rows) => {
    if (err) {
      console.error("Could not retrieve blogs", err);
    } else {
      rows.forEach((row) => {
        console.log(row);
      });
    }
  });
};

// Example usage
createTable();
insertBlog("title", "subtitle", "text");
getBlogs();

// Close the database connection
db.close((err) => {
  if (err) {
    console.error("Could not close database", err);
  } else {
    console.log("Database connection closed");
  }
});
