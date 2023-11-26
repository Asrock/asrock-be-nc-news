const db = require("../db/connection");
const topicsModel = require("../models/topics-model");
const usersModel = require("../models/users-model");

const badRequest = { status: 400, msg: "Bad request" };
const notFound = { status: 404, msg: "article does not exist" };

const comment_countSql = "(SELECT COUNT(1) FROM comments c WHERE c.article_id = a.article_id)::INT comment_count";

exports.getArticles = ({ topic, sort_by, order, limit, p, ...invalidQuery }) => {
    if (Object.keys(invalidQuery).length || Array.isArray(topic)) return Promise.reject(badRequest);

    const selectedColumns = {
        article_id: { alias: "a.article_id" },
        author: { alias: "a.author" },
        title: { alias: "a.title" },
        topic: { alias: "a.topic" },
        created_at: { alias: "a.created_at" },
        votes: { alias: "a.votes" },
        article_img_url: { alias: "a.article_img_url" },
        comment_count: { alias: "comment_count", sql: comment_countSql }
    };

    const sorts = Array.isArray(sort_by) ? sort_by : [sort_by ?? "created_at"];
    const orders = Array.isArray(order) ? order : [sort_by ? (order ?? "DESC") : (order ?? "ASC")];
    const sortableColumns = Object.keys(selectedColumns);                   //Sort allowed for all columns including comment_count
    const offset = p ? (p * (limit ??= 10) - limit) : 0;

    const isValid = sorts.every(col => sortableColumns.includes(col))       //Allowed columns only (prevent SQL injection)
        && orders.every(order => (/^(?:ASC|DESC)$/i).test(order))           //ASC|DESC values only (prevent SQL injection)
        && sorts.every((value, index) => sorts.indexOf(value) === index)    //Ensure sorts has not duplicated columns
        && orders.length <= sorts.length                                    //Avoid Unpaired sort_by and order when sort_by has value (?sort_by=author&order=desc&order=asc)
        && +limit !== 0                                                     //Limit 0 is not alowed
        && +p !== 0;                                                        //Page 0 is not allowed

    if (!isValid) return Promise.reject(badRequest);

    const values = topic != null ? [topic] : [];
    const sql = {
        selectStatement: `SELECT ${Object.values(selectedColumns).map(col => col.sql ?? col.alias)} FROM articles a`,
        whereStatement: topic != null ? `WHERE a.topic = $${values.length}` : "",
        orderStatement: `ORDER BY ${sorts.map((col, index) => `${selectedColumns[col].alias} ${orders?.[index] ?? "DESC"}`)}`, //DESC is default value for any column when sorting
        limitStatement: (limit != null && values.push(+limit)) ? `LIMIT $${values.length}` : "",
        offsetStatement: (p != null && values.push(offset)) ? `OFFSET $${values.length}` : ""
    }
    const sqlQuery = Object.values(sql).join(" ");

    return Promise.all([
        db.query(sqlQuery, values),
        p == null ? Promise.resolve({ rows: [] }) : db.query(`SELECT COUNT(1)::INT total_count FROM articles a ${sql.whereStatement}`, topic ? [topic] : []),
        topic == null ? Promise.resolve() : topicsModel.getTopic(topic) //Check topic exists for this article
    ]).then(([{ rows: articles }, { rows: [total_count] }]) => ({ articles, ...(total_count != null && total_count) }));
};

exports.getArticle = (id) => db
    .query(
        `SELECT *, ${comment_countSql}
        FROM articles a
        WHERE a.article_id = $1`, [id])
    .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));

exports.modifyArticle = (id, { inc_votes, ...partialArticle }) => {
    if (Object.keys(partialArticle).length) return Promise.reject(badRequest);

    return db
        .query(
            `UPDATE articles a
            SET votes = (a.votes + $2)
            WHERE a.article_id = $1
            RETURNING a.*, ${comment_countSql}
        `, [id, inc_votes])
        .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));
};

exports.createArticle = ({ author, title, body, topic, article_img_url, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length || (author == null) || (topic == null)) return Promise.reject(badRequest); //Null checks to avoid not found

    const [columns, params, values] = Object
        .entries({ author, title, body, topic, ...article_img_url && { article_img_url } })
        .reduce(([columns, params, values], [key, value], index) => [[...columns, key], [...params, `$${++index}`], [...values, value]], [[], [], []])

    return Promise
        .all([topicsModel.getTopic(topic), usersModel.getUser(author)])
        .catch(err => Promise.reject(err.status === 404 ? { status: 422, msg: "Unprocessable Entity" } : err))
        .then(() => db.query(`INSERT INTO articles (${columns}) VALUES (${params}) RETURNING *, 0 comment_count`, values))
        .then(({ rows }) => rows[0]);
}