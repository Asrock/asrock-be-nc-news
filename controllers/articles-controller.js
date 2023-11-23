const articlesModel = require("../models/articles-model");
const commentsModel = require("../models/comments-model");

exports.getArticles = (req, res, next) => {
    return articlesModel.getArticles()
        .then(articles => res.status(200).send({ articles }))
        .catch(next);
};

exports.getArticle = (req, res, next) => {
    return articlesModel.getArticle(req.params.article_id)
        .then(article => res.status(200).send({ article }))
        .catch(next);
};

exports.patchArticle = (req, res, next) => {
    return articlesModel.modifyArticle(req.params.article_id, req.body)
        .then(article => res.status(200).send({ article }))
        .catch(next);
};

exports.getArticleComments = (req, res, next) => {
    return commentsModel.getComments({ article_id: req.params.article_id })
        .then(comments => res.status(200).send({ comments }))
        .catch(next);
};