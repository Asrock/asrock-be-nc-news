const db = require("../db/connection");
const articlesModel = require("./articles-model");
const usersModel = require("../models/users-model");

exports.getComments = ({ article_id }, { p, limit }) => {
    if(+limit === 0 || +p === 0) return Promise.reject({ status: 400, msg: "Bad request" });

    const offset = p ? (p * (limit ??= 10) - limit) : 0;

    return Promise.all([
        db.query(`SELECT * FROM comments WHERE article_id = $1 LIMIT $2 OFFSET $3`, [article_id, limit, offset]),
        articlesModel.getArticle(article_id)
    ]).then(([{ rows }]) => rows);
}

exports.createComment = ({ article_id }, { username, body, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length || (username == null) || (body == null)) return Promise.reject({ status: 400, msg: "Bad request" });

    return Promise.all([articlesModel.getArticle(article_id), usersModel.getUser(username)])
        .then(() => db.query(`INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *`, [body, article_id, username]))
        .then(({ rows }) => rows[0]);
}