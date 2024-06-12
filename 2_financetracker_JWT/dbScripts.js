const sqlite3 = require("sqlite3").verbose();

const connectDB = () => {
  db = new sqlite3.Database("./expenses.db", (err) => {
    if (err) {
      console.error("Could not connect to database", err);
    } else {
      console.log("Connected to database");
    }
  });
};

const createExpensesTable = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        desc TEXT,
        amount INTEGER,
        date TEXT,
        category TEXT,
        author TEXT
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

const createUsersTable = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
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

connectDB();
// createExpensesTable();
// createUsersTable();
