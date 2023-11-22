const db = require("../db/connection");

exports.getComments = (queryParams = {}) => {
    const { article_id } = queryParams;

    const whereStatement = article_id ? { query: ` WHERE article_id = $1`, values: [article_id] } : { query: "", values: [] };

    //This would change if query is available
    return db
        .query(`SELECT * FROM comments${whereStatement.query}`, whereStatement.values)
        .then(({ rows }) => {
            return (rows.length && !queryParams.hasOwnProperty(article_id)) ? rows : Promise.reject({ status: 404, msg: "comments does not exist" });
        });
}