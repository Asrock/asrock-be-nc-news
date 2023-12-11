const articlesModel = require("../models/articles-model");
const commentsModel = require("../models/comments-model");

exports.getArticles = (req, res, next) => {
    const { sort_by, order, limit, p } = req.query;
    return articlesModel.getArticles({ sort_by, order, limit, p })
        .then(result => res.status(200).send(result))
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

exports.postArticle = (req, res, next) => {
    return articlesModel.createArticle(req.body)
        .then(article => res.status(201).send({ article }))
        .catch(next);
};

exports.deleteArticle = (req, res, next) => {
    return articlesModel.deleteArticle(req.params.article_id)
        .then(() => res.status(204).send())
        .catch(next);
};

exports.getArticleComments = (req, res, next) => {
    const { limit, p } = req.query;
    const { article_id } = req.params;

    return articlesModel
        .getArticle(article_id)
        .then(() => commentsModel.getComments({ article_id, limit, p }))
        .then(comments => res.status(200).send({ comments }))
        .catch(next);
};

exports.postArticleComment = (req, res, next) => {
    const { article_id } = req.params;
    return articlesModel
        .getArticle(article_id)
        .then(() => commentsModel.createComment({ article_id, ...req.body }))
        .then(comment => res.status(201).send({ comment }))
        .catch(next);
};