const express = require("express");

const app = express();

require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool();

app.get("/vacancies", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM vacancies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
