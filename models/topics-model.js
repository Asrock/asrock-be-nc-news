const db = require("../db/connection")

exports.getTopics = () => db
    .query("SELECT * FROM topics")
    .then(({ rows }) => rows);

exports.getTopic = (slug) => db
    .query("SELECT * FROM topics where slug = $1", [slug])
    .then(({ rows }) => rows.length ? rows[0] : Promise.reject({ status: 404, msg: "topic does not exist" }));