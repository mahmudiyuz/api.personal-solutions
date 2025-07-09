const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/vacancies", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vacancies");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

app.listen(port, () => {
  console.log(`Server started`);
});
