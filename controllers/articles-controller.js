const articlesModel = require("../models/articles-model");
const commentsModel = require("../models/comments-model");

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

exports.patchArticle = (req, res, next) => {
    return articlesModel.modifyArticle(req.params.article_id, req.body)
        .then(article => res.status(200).send({ article }))
        .catch(next);
};

exports.getArticleComments = (req, res, next) => {
    return commentsModel.getComments(req.params)
        .then(comments => res.status(200).send({ comments }))
        .catch(next);
};

exports.postArticleComment = (req, res, next) => {
    return commentsModel.createComment(req.params, req.body)
        .then(comment => res.status(201).send({ comment }))
        .catch(next);
};