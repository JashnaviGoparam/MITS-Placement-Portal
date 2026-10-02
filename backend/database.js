require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.MYSQLHOST || "localhost",
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "janureddy",
    database: process.env.MYSQLDATABASE || "mits_placement"
});

db.connect((err) => {
    if (err) {
        console.log("❌ MySQL connection failed:");
        console.log(err.message);
        return;
    }

    console.log("✅ MySQL Connected Successfully!");
});

module.exports = db;