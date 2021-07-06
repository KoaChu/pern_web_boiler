const Pool = require("pg").Pool

const pool = new Pool({
    user: "postgres",
    password: "Victory11",
    host: "localhost",
    port: 5432,
    database: "pern_web"
});


module.exports = pool;
