const mysql = require("mysql2");
const url = require("url");

let config;

if (process.env.JAWSDB_URL) {
  const connectionUrl = url.parse(process.env.JAWSDB_URL);
  const [user, password] = connectionUrl.auth.split(":");

  config = {
    connectionLimit: 10,
    host: connectionUrl.hostname,
    user: user,
    password: password,
    database: connectionUrl.pathname.replace("/", ""),
  };
} else {
  config = {
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    database: process.env.npm_package_config_DB_NAME,
  };
}

const db = mysql.createPool(config);

module.exports = db.promise();
