const db = require("../db/connection")
const topicsModel = require("../models/topics-model")

exports.getArticles = ({ topic, ...invalidQuery }) => {
    if (Object.keys(invalidQuery).length || Array.isArray(topic)) return Promise.reject({ status: 400, msg: "Bad request" });

    const selectStatement =
        `SELECT 
        article_id,
        author,
        title,
        article_id,
        topic,
        created_at,
        votes,
        article_img_url,
        (SELECT COUNT(1) FROM comments c WHERE c.article_id = article_id)::INT comment_count
    FROM articles`;
    const orderStatement = "ORDER BY created_at ASC";

    if (topic != null) {
        const whereStatement = "WHERE topic = $1";
        return Promise.all([
            db.query(`${selectStatement} ${whereStatement} ${orderStatement}`, [topic]),
            topicsModel.getTopic(topic)
        ]).then(([{ rows }]) => rows);
    }

    return db.query(`${selectStatement} ${orderStatement}`).then(({ rows }) => rows);
};

exports.getArticle = (id) => db
    .query("SELECT * FROM articles WHERE article_id = $1", [id])
    .then(({ rows }) => rows[0] ? rows[0] : Promise.reject({ status: 404, msg: "article does not exist" }));

exports.modifyArticle = (id, { inc_votes, ...partialArticle }) => {
    if(Object.keys(partialArticle).length) return Promise.reject({ status: 400, msg: "Bad request" });

    return db
        .query(`UPDATE articles SET votes = (votes + $2) WHERE article_id = $1 RETURNING *`, [id, inc_votes])
        .then(({ rows }) => rows[0] ? rows[0] : Promise.reject({ status: 404, msg: "article does not exist" }));
};