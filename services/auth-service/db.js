const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "auth_db",
});

db.connect((err) => {
    if (err) throw err;
    console.log("DB Connected");
});

module.exports = db;