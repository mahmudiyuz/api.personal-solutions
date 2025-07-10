const express = require("express");

const app = express();

app.use(express.json());

require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool();

app.get("/list", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM vacancies WHERE state = 1;"
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.post("/create", async (req, res) => {
  const { name, salary, adress, conditions, responsibility, requirements } =
    req.body;
  const values = [
    name,
    salary,
    adress,
    conditions,
    responsibility,
    requirements,
  ];
  const query = `
    INSERT INTO vacancies (name, salary, adress, conditions, responsibility, requirements)
    VALUES (&1, &2, &3, &4, &5, &6)
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, values);

    res.status(201).json({ message: "Data is created.", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const values = [id];

  const result = await pool.query(
    `
      UPDATE vacancies
      SET state = 0
      WHERE id = $1;
    `,
    values
  );

  res.status(200).json({ message: "Data is deleted.", data: result.rows[0] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
