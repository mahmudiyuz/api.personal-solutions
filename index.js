require("dotenv").config();
const express = require("express");
const db = require("./db");
const app = express();

app.get("/vacancies", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM vacancies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
