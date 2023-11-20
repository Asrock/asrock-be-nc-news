const db = require("../db/connection")

exports.getTopics = () => db
    .query("SELECT * FROM topics")
    .then(({ rows }) => rows)