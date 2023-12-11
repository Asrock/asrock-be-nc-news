const db = require("../db/connection");
const { formatSqlInsert } = require("../utils/sql-utils");

const badRequest = { status: 400, message: "Bad request" };
const notFound = { status: 404, message: "article does not exist" };

const comment_countSql = "(SELECT COUNT(1) FROM comments c WHERE c.article_id = a.article_id)::INT comment_count";

exports.getArticles = ({ topic, sort_by, order, limit, p }) => {
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

    const hasTopic = topic !== undefined;
    const sorts = Array.isArray(sort_by) ? sort_by : [sort_by ?? "created_at"];
    const orders = Array.isArray(order) ? order : [sort_by ? (order ?? "DESC") : (order ?? "ASC")];
    const sortableColumns = Object.keys(selectedColumns);                   //Sort allowed for all columns (including comment_count)
    const offset = p ? (p * (limit ??= 10) - limit) : 0;                    //Set default limit when using pagination

    //Validation
    const isValid = sorts.every(col => sortableColumns.includes(col))       //Allowed columns only (prevent SQL injection)
        && orders.every(order => (/^(?:ASC|DESC)$/i).test(order))           //ASC|DESC values only (prevent SQL injection)
        && sorts.every((value, index) => sorts.indexOf(value) === index)    //Ensure sorts has not duplicated columns
        && orders.length <= sorts.length                                    //Avoid unpaired sort_by and order eg. (?sort_by=author&order=desc&order=asc)
        && +limit !== 0;                                                    //Limit 0 is not allowed

    if (!isValid) return Promise.reject(badRequest);

    const values = [];
    let sqlQuery = `SELECT ${Object.values(selectedColumns).map(col => col.sql ?? col.alias)} FROM articles a`;

    //WHERE
    if (hasTopic && values.push(topic))
        sqlQuery += ` WHERE a.topic = $${values.length}`;

    //ORDER BY
    sqlQuery += ` ORDER BY ${sorts.map((col, index) => `${selectedColumns[col].alias} ${orders?.[index] ?? "DESC"}`)}`; //DESC is default value for any column when sorting

    //LIMIT
    if (limit != null && values.push(+limit))
        sqlQuery += ` LIMIT $${values.length}`;

    //OFFSET
    if (p != null && values.push(offset)) {
        sqlQuery += ` OFFSET $${values.length}`;

        //Display total_count
        const subValues = [];
        let sqlSubQuery = "SELECT COUNT(1)::INT total_count FROM articles a";

        if (hasTopic && subValues.push(topic))
            sqlSubQuery += ` WHERE a.topic = $${subValues.length}`;

        return Promise
            .all([db.query(sqlQuery, values), db.query(sqlSubQuery, subValues)])
            .then(([{ rows: articles }, { rows: [{ total_count }] }]) => ({ articles, total_count }));
    }

    return db
        .query(sqlQuery, values)
        .then(({ rows: articles }) => ({ articles }));
};

exports.getArticle = (article_id) => db
    .query(`SELECT *, ${comment_countSql} FROM articles a WHERE a.article_id = $1`, [article_id])
    .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));

exports.modifyArticle = (id, { inc_votes, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length) return Promise.reject(badRequest);

    return db
        .query(`UPDATE articles a SET votes = (a.votes + $2) WHERE a.article_id = $1 RETURNING a.*, ${comment_countSql}`, [id, inc_votes])
        .then(({ rows }) => rows.length ? rows[0] : Promise.reject(notFound));
};

exports.createArticle = ({ author, title, body, topic, article_img_url = undefined, ...invalidKeys }) => {
    if (Object.keys(invalidKeys).length) return Promise.reject(badRequest);

    const { columns, params, values } = formatSqlInsert({ author, title, body, topic }, { article_img_url });

    return db
        .query(`INSERT INTO articles (${columns}) VALUES (${params}) RETURNING *, 0 comment_count`, values)
        .then(({ rows }) => rows[0]);
}

exports.deleteArticle = (id) => db
    .query(`WITH deletedComments AS (DELETE FROM comments WHERE article_id = $1 RETURNING article_id)
        DELETE FROM articles WHERE article_id in (SELECT * FROM deletedComments)`, [id])
    .then(({ rowCount }) => rowCount || Promise.reject(notFound));
