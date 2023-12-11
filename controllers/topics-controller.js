const topicsModel = require("../models/topics-model");
const articlesModel = require("../models/articles-model");


exports.getTopics = (req, res, next) => topicsModel.getTopics()
    .then(topics => res.status(200).send({ topics }))
    .catch(next);

exports.postTopic = (req, res, next) => {
    return topicsModel.createTopic(req.body)
        .then(topic => res.status(201).send({ topic }))
        .catch(next);
};

exports.getTopicArticles = (req, res, next) => {
    const { sort_by, order, limit, p } = req.query;
    const { topic } = req.params;
    return topicsModel
        .getTopic(topic)
        .then(() => articlesModel.getArticles({ topic, sort_by, order, limit, p }))
        .then(result => res.status(200).send(result))
        .catch(next);
};