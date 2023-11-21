const db = require("../db/connection")

exports.getArticle = (id) => db
    .query("SELECT * FROM articles WHERE article_id = $1", [id])
    .then(({ rows }) => rows[0]);