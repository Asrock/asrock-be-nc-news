const db = require("../db/connection")

exports.getUsers = () => db
    .query("SELECT * FROM users")
    .then(({ rows }) => rows);

exports.getUser = (username) => db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows }) => rows.length ? rows[0] : Promise.reject({ status: 404, msg: "username does not exist" }));