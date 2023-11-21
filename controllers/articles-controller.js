const articlesModel = require("../models/articles-model")

exports.getArticle = (req, res, next) => {
    return articlesModel.getArticle(req.params.article_id)
        .then(article => article ? res.status(200).send({ article }) : next({ status: 404, msg: "article does not exist" }))
        .catch(next);
};