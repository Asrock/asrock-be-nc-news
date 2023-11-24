const db = require("../db/connection");
const articlesModel = require("./articles-model");
const usersModel = require("../models/users-model");

exports.getComments = ({ article_id }) => {
    return Promise.all([
        db.query(`SELECT * FROM comments WHERE article_id = $1`, [article_id]),
        articlesModel.getArticle(article_id)
    ]).then(([{ rows }]) => rows);
}

exports.createComment = ({ article_id }, { username, body, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length || (username == null) || (body == null)) return Promise.reject({ status: 400, msg: "Bad request" });
    
    return Promise.all([articlesModel.getArticle(article_id), usersModel.getUser(username)])
        .then(() => db.query(`INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *`, [body, article_id, username]))
        .then(({ rows }) => rows[0]);
}

exports.modifyComment = (id, { inc_votes, ...partialComment }) => {
    if(Object.keys(partialComment).length) return Promise.reject({ status: 400, msg: "Bad request" });

    return db
        .query(`UPDATE comments SET votes = (votes + $2) WHERE comment_id = $1 RETURNING *`, [id, inc_votes])
        .then(({ rows }) => rows.length ? rows[0] : Promise.reject({ status: 404, msg: "comment does not exist" }));
};