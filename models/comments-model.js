const db = require("../db/connection");

const badRequest = { status: 400, message: "Bad request" };
const notFound = { status: 404, message: "comment does not exist" };

exports.getComments = ({ article_id, limit, p }) => {
    const hasArticle = article_id !== undefined;

    //Validation
    if (+limit === 0) return Promise.reject(badRequest);                    //Limit 0 is not allowed

    const values = [];
    let sqlQuery = `SELECT * FROM comments c`;

    //WHERE
    if (hasArticle && values.push(article_id))
        sqlQuery += ` WHERE c.article_id = $${values.length}`;

    //LIMIT
    if (limit != null && values.push(+limit))
        sqlQuery += ` LIMIT $${values.length}`;

    //OFFSET
    if (p != null && values.push(p * (limit ??= 10) - limit))
        sqlQuery += ` OFFSET $${values.length}`;

    return db
        .query(sqlQuery, values)
        .then(({ rows }) => rows);
}

exports.createComment = ({ article_id, username, body, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length) return Promise.reject(badRequest);

    return db
        .query(`INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *`, [article_id, username, body])
        .then(({ rows }) => rows[0])
}

exports.modifyComment = (id, { inc_votes, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length) return Promise.reject(badRequest);

    return db
        .query(`UPDATE comments SET votes = (votes + $2) WHERE comment_id = $1 RETURNING *`, [id, inc_votes])
        .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));
};

exports.deleteComment = (id) => db
    .query("DELETE FROM comments WHERE comment_id = $1", [id])
    .then(({ rowCount }) => rowCount || Promise.reject(notFound));
