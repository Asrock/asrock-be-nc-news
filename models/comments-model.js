const db = require("../db/connection");
const articlesModel = require("./articles-model");

exports.getComments = (queryParams) => {
    if (!queryParams?.hasOwnProperty("article_id")) throw new Error("Not implemented");

    const { article_id } = queryParams;
    
    return Promise.all([
        db.query(`SELECT * FROM comments WHERE article_id = $1`, [article_id]),
        articlesModel.getArticle(article_id)
    ]).then(([{rows}]) => rows);
}