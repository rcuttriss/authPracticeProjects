require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

const connectDB = () => {
  db = new sqlite3.Database("./expenses.db", (err) => {
    if (err) {
      console.error("Could not connect to database", err);
    } else {
      console.log("Connected to database");
    }
  });
};

const authenticateToken = async (accessToken) => {
  try {
    return await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return false;
  }
};

// login
app.get("/login", async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const auth = await authenticateToken(accessToken);
  if (!auth) return res.sendStatus(403);
  res.json({ success: "token is valid" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.get(
    "SELECT username, hashedPassword FROM users WHERE username = ?",
    [username],
    async (err, row) => {
      if (err) {
        console.error("Could not find user", err);
        return res
          .status(500)
          .json({ success: false, message: "Could not find user" });
      } else {
        if (row === undefined) {
          // user not found (make user)
          db.run(
            "INSERT INTO users (username, hashedPassword) VALUES(?,?)",
            [username, hashedPassword],
            (insertErr) => {
              if (insertErr) {
                console.error("Could not insert user", insertErr);
                return res
                  .status(500)
                  .json({ success: false, message: "Could not insert user" });
              }
              const accessToken = jwt.sign(
                { username },
                process.env.ACCESS_TOKEN_SECRET
              );
              return res.json({ success: true, accessToken });
            }
          );
        } else {
          // user found (sign in)
          console.log("User already exists, checking password...");
          const match = await bcrypt.compare(password, row.hashedPassword);
          if (match) {
            console.log("Password matches!");
            const accessToken = jwt.sign(
              { username },
              process.env.ACCESS_TOKEN_SECRET
            );
            return res.json({ success: true, accessToken });
          } else {
            return res
              .status(403)
              .json({ success: false, message: "Invalid Credentials" });
          }
        }
      }
    }
  );
});

// expenses
app.get("/expenses", async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const auth = await authenticateToken(accessToken);
  if (auth) {
    const decoded = jwt.decode(accessToken);
    const username = decoded["username"];
    db.all(
      `SELECT * FROM expenses WHERE author = ?`,
      [username],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ expenses: rows });
        }
      }
    );
  } else {
    res.sendStatus(403);
  }
});

app.post("/expenses", (req, res) => {
  const { title, desc, amount, date, category } = req.body;
  const accessToken = req.headers.authorization.split(" ")[1];
  const auth = authenticateToken(accessToken);

  if (auth) {
    const decoded = jwt.decode(accessToken);
    const username = decoded["username"];
    db.run(
      `INSERT INTO expenses (title, desc, amount, date, category, author) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, desc, amount, date, category, username],
      (err) => {
        if (err) {
          console.error("Could not insert expense", err);
        } else {
          console.log("Expense inserted");
        }
      }
    );
    res.json({ success: true });
  } else {
    res.sendStatus(403);
  }
});

app.delete("/expenses", (req, res) => {
  const { title } = req.body;
  const accessToken = req.headers.authorization.split(" ")[1];
  const auth = authenticateToken(accessToken);
  const decoded = jwt.decode(accessToken);
  const username = decoded["username"];

  if (auth) {
    db.run(
      "DELETE FROM expenses WHERE title = ? AND author = ?",
      [title, username],
      function (err) {
        if (err) {
          console.error("Could not delete expense", err);
          res
            .status(500)
            .json({ success: false, message: "Could not delete expense" });
        }
        if (this.changes === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Expense not found" });
        }
        console.log("Expense deleted");
        res.json({ success: true, message: "Expense deleted" });
      }
    );
  } else {
    res.sendStatus(403);
  }
});

app.listen(port);
console.log("App is listening...");
connectDB();
