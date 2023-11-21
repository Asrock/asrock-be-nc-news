const db = require("../db/connection")

exports.getUsers = () => db
    .query("SELECT * FROM users")
    .then(({ rows }) => rows)