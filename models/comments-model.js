const db = require("../db/connection");
const articlesModel = require("./articles-model");
const usersModel = require("../models/users-model");

const badRequest = { status: 400, msg: "Bad request" };
const notFound = { status: 404, msg: "comment does not exist" };

exports.getComments = ({ article_id }, { p, limit }) => {
    if(+limit === 0 || +p === 0) return Promise.reject(badRequest);

    const offset = p ? (p * (limit ??= 10) - limit) : 0;

    return Promise.all([
        db.query(`SELECT * FROM comments WHERE article_id = $1 LIMIT $2 OFFSET $3`, [article_id, limit, offset]),
        articlesModel.getArticle(article_id)
    ]).then(([{ rows }]) => rows);
}

//TODO - Check if should return 422
exports.createComment = ({ article_id }, { username, body, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length || (username == null)) return Promise.reject(badRequest);
    
    return Promise.all([articlesModel.getArticle(article_id), usersModel.getUser(username)])
        .then(() => db.query(`INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *`, [body, article_id, username]))
        .then(({ rows }) => rows[0]);
}

exports.modifyComment = (id, { inc_votes, ...partialComment }) => {
    if(Object.keys(partialComment).length) return Promise.reject(badRequest);

    return db
        .query(`UPDATE comments SET votes = (votes + $2) WHERE comment_id = $1 RETURNING *`, [id, inc_votes])
        .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));
};

exports.deleteComment = (id) => db
    .query("DELETE FROM comments WHERE comment_id = $1", [id])
    .then(({rowCount}) => rowCount || Promise.reject({status:404, msg: "comment does not exist"}));