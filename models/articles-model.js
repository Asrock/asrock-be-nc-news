const db = require("../db/connection");
const topicsModel = require("../models/topics-model");
const usersModel = require("../models/users-model");

const badRequest = { status: 400, msg: "Bad request" };

exports.getArticles = ({ topic, sort_by, order, ...invalidQuery }) => {
    if (Object.keys(invalidQuery).length || Array.isArray(topic)) return Promise.reject(badRequest);

    const sorts = Array.isArray(sort_by) ? sort_by : [sort_by ?? "created_at"];
    const orders = Array.isArray(order) ? order : [sort_by ? (order ?? "DESC") : (order ?? "ASC")];
    const sortableColumns = ["article_id", "author", "title", "article_id", "topic", "created_at", "votes", "article_img_url"];

    const isValid = sorts.every(col => sortableColumns.includes(col))       //Allowed columns only (prevent SQL injection)
        && orders.every(order => (/^(?:ASC|DESC)$/i).test(order))           //ASC|DESC values only (prevent SQL injection)
        && sorts.every((value, index) => sorts.indexOf(value) === index)    //Ensure sorts has not duplicated columns
        && orders.length <= sorts.length;                                   //Avoid Unpaired sort_by and order when sort_by has value (?sort_by=author&order=desc&order=asc)

    if (!isValid) return Promise.reject(badRequest);

    const orderStatement = `ORDER BY ${sorts.map((col, index) => `${col} ${orders?.[index] ?? "DESC"}`)}`; //DESC is default value for any column when sorting
    const selectStatement =
        `SELECT 
        article_id,
        author,
        title,
        topic,
        created_at,
        votes,
        article_img_url,
        (SELECT COUNT(1) FROM comments c WHERE c.article_id = article_id)::INT comment_count
    FROM articles`;

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
    .query(
        `SELECT a.*,
            (SELECT COUNT (1) FROM comments c WHERE c.article_id = a.article_id)::INT comment_count
        FROM articles a
        WHERE a.article_id = $1`, [id])
    .then(({ rows }) => rows.length ? rows[0] : Promise.reject({ status: 404, msg: "article does not exist" }));

exports.modifyArticle = (id, { inc_votes, ...partialArticle }) => {
    if (Object.keys(partialArticle).length) return Promise.reject({ status: 400, msg: "Bad request" });

    return db
        .query(`UPDATE articles SET votes = (votes + $2) WHERE article_id = $1 RETURNING *`, [id, inc_votes])
        .then(({ rows }) => rows.length ? rows[0] : Promise.reject({ status: 404, msg: "article does not exist" }));
};

exports.createArticle = ({ author, title, body, topic, article_img_url, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length || (author == null) || (topic == null)) return Promise.reject({ status: 400, msg: "Bad request" }); //Null checks to avoid not found

    const [columns, params, values] = Object
        .entries({ author, title, body, topic, ...article_img_url && { article_img_url } })
        .reduce(([columns, params, values], [key, value], index) => [[...columns, key], [...params, `$${++index}`], [...values, value]], [[], [], []])

    return Promise
        .all([topicsModel.getTopic(topic), usersModel.getUser(author)])
        .catch(err => Promise.reject(err.status === 404 ? { status: 422, msg: "Unprocessable Entity" } : err))
        .then(() => db.query(
            `INSERT INTO articles (${columns}) VALUES (${params}) RETURNING *, 0 comment_count`, values))
        .then(({ rows }) => rows[0]);

    // return Promise.all([topicsModel.getTopic(topic), usersModel.getUser(author)])
    //     .then(() => db.query(
    //         `INSERT INTO articles (author, title, body, topic, article_img_url)
    //         VALUES ($1, $2, $3, $4, $5)
    //         RETURNING *`, [author, title, body, topic, article_img_url]))
    //     .then(({ rows }) => rows[0]);
}