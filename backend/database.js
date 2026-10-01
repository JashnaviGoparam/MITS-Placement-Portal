const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "janureddy",
    database: "mits_placement"
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