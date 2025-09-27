const mysql = require("mysql2");

const config = process.env.JAWSDB_URL || {
  connectionLimit: 10,
  host: "localhost",
  user: "sp84cq2uad0vt0tt",
  password: "ddmqzixtrpd52hf0",
  database: "music_shop",
};
const db = mysql.createPool(config);

module.exports = db.promise();