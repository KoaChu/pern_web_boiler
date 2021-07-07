const router = require("express").Router();
const bcrypt = require("bcrypt");

const jwtGenerator = require("../utils/jwtGenerator");
const pool = require("../db");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email,
    ]);

    if (user.rows.length !== 0) {
      return res.status(401).send("User Exists");
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, bcryptPassword]
    );

    const token = jwtGenerator(newUser.rows[0].user_id);

    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

//LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if ( user.rows.length === 0) {
            return res.status(401).json("Invalid password or email.")
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

        if (!validPassword) {
            return res.status(401).json("Invalid Login");
        }

        const token = jwtGenerator(user.rows[0].user_id);

        res.json(token);

    } catch (error) {
        console.log(err);
        res.status(401).send("Invalid Login");
    }
});

module.exports = router;
