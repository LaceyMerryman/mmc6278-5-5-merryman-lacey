const mysql = require("mysql2");

const db = mysql.createPool(process.env.JAWSDB_URL || {
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  database: process.env.npm_package_config_DB_NAME,
});

module.exports = db.promise();
