const db = require("../db/connection")

exports.getArticles = ({ topic, ...invalidQuery }) => {
    if (Object.keys(invalidQuery).length || Array.isArray(topic)) return Promise.reject({ status: 400, msg: "Bad request" });

    const [whereStatement, sqlValues] = topic != null ? [`WHERE topic = $1`, [topic]] : [];
    return db
        .query(`
            SELECT 
                article_id,
                author,
                title,
                article_id,
                topic,
                created_at,
                votes,
                article_img_url,
                (SELECT COUNT(1) FROM comments c WHERE c.article_id = article_id)::INT comment_count
            FROM articles
            ${whereStatement}
            ORDER BY created_at ASC`, sqlValues)
        .then(({ rows }) => rows);
};

exports.getArticle = (id) => db
    .query("SELECT * FROM articles WHERE article_id = $1", [id])
    .then(({ rows }) => rows[0] ? rows[0] : Promise.reject({ status: 404, msg: "article does not exist" }));