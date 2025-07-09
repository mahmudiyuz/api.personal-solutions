const express = require("express");
const db = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// GET /vacancies
app.get("/vacancies", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM vacancies");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
