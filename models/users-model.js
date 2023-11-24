const db = require("../db/connection")

const notFound = {status:404, msg:"user does not exist"};

exports.getUsers = () => db
    .query("SELECT * FROM users")
    .then(({ rows }) => rows);

exports.getUser = (username) => db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));