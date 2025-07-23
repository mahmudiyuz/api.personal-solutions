const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

const pool = new Pool();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// create vacancy
app.post("/create", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      salary,
      adress,
      conditions,
      responsibility,
      requirements,
      status,
    } = req.body;

    if (
      !name ||
      !salary ||
      !adress ||
      !conditions ||
      !responsibility ||
      !requirements ||
      !status
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    let imageUrl = null;

    if (req.file) {
      const fileName = Date.now() + "_" + req.file.originalname;

      const { error } = await supabase.storage
        .from("vacancies-images")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        return res.status(500).json({ message: "Image upload failed", error });
      }

      const { data: urlData } = supabase.storage
        .from("vacancies-images")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    const result = await pool.query(
      `
        INSERT INTO vacancies 
          (name, salary, adress, conditions, responsibility, requirements, status, image)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `,
      [
        name,
        salary,
        adress,
        JSON.parse(conditions),
        JSON.parse(responsibility),
        JSON.parse(requirements),
        status,
        imageUrl,
      ]
    );

    res.status(201).json({ message: "Data created", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// update vacancy
app.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, salary, adress, conditions, responsibility, requirements } =
      req.body;

    if (
      !name ||
      !salary ||
      !adress ||
      !conditions ||
      !responsibility ||
      !requirements
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    let imageUrl = null;
    if (req.file) {
      const fileName = Date.now() + "_" + req.file.originalname;

      const { error } = await supabase.storage
        .from("vacancies-images")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        return res.status(500).json({ message: "Image upload failed", error });
      }

      const { data: urlData } = supabase.storage
        .from("vacancies-images")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    const { rowCount, rows } = await pool.query(
      `
        UPDATE vacancies
        SET name = $2,
            salary = $3,
            adress = $4,
            conditions = $5,
            responsibility = $6,
            requirements = $7,
            image = COALESCE($8, image)
        WHERE id = $1 AND state = 1
        RETURNING *;
      `,
      [
        id,
        name,
        salary,
        adress,
        JSON.parse(conditions),
        JSON.parse(responsibility),
        JSON.parse(requirements),
        imageUrl,
      ]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Not found or inactive" });
    }

    res.json({ message: "Data updated", data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal error", error });
  }
});

// list vacancy
app.get("/list", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM vacancies WHERE state = 1;"
    );

    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// delete vacancy
app.delete("/delete/:id", async (req, res) => {
  try {
    const { rowCount, rows } = await pool.query(
      `
       UPDATE vacancies 
       SET state = 0 
       WHERE id = $1 
       RETURNING *
      `,
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Data successfully deleted", data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// create user
app.post("/create-user", async (req, res) => {
  try {
    const { name, number, vacancy, cityzenship } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const { rows } = await pool.query(
      `
        insert into users (name, number, vacancy, cityzenship)
        values ($1, $2, $3, $4)
        returning *;
      `,
      [name, number, vacancy, cityzenship]
    );

    res
      .status(201)
      .json({ message: "Data successfully created", data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// list users
app.get("/list-users", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      select * from users
    `);

    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// not found middleware
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
