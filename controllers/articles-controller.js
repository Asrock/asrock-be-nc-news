const articlesModel = require("../models/articles-model")

exports.getArticle = (req, res, next) => {
    return articlesModel.getArticle(req.params.article_id)
        .then(article => res.status(200).send({ article }))
        .catch(next);
};