const express = require("express");

const app = express();

require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool();

app.get("/list", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM vacancies");
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.post("/create", async (req, res) => {
  try {
    await pool.query(`
        INSERT INTO vacancies (name, salary, adress, conditions, responsibility, requirements)
        VALUES (
          'Разнорабочий на строительный склад',
          '2300 за 11 часов',
          'м. Ломоносовская',
          ARRAY[
            'Гибкий график работы удобный вам: 2/2, 1/2, 3/3, 5/2 и тд.;',
            'Работа временная или на постоянной основе;',
            'Есть дневные и ночные смены.8:00-20:00 и 21:00-9:30;',
            'Смены по 12 часов, есть перекуры/перерывы, обед;',
            'Оплата после смены или раз в неделю на карточку;',
            'Развозка от ст. м. Ломоносовская'
          ],
          ARRAY[
            'Прием и разгрузка коробок строительными материалами',
            'Замотка стрейчем товара на поддонах',
            'Уборка упаковочного картона',
            'Выполнение поручений от старшего смены'
          ],
          ARRAY[
            'Желание зарабатывать, скорость работы, обучаемость.'
          ]
        );
      `);

    res.json({ data: "Data stored successfully." });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
