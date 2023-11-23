const articlesModel = require("../models/articles-model")

exports.getArticles = (req, res, next) => {
    return articlesModel.getArticles(req.query)
        .then(articles => res.status(200).send({ articles }))
        .catch(next);
};

exports.getArticle = (req, res, next) => {
    return articlesModel.getArticle(req.params.article_id)
        .then(article => res.status(200).send({ article }))
        .catch(next);
};