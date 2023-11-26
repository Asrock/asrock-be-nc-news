const topicsModel = require("../models/topics-model");

exports.getTopics = (req, res, next) => topicsModel.getTopics()
    .then(topics => res.status(200).send({ topics }))
    .catch(next);

exports.postTopic = (req, res, next) => {
    return topicsModel.createTopic(req.body)
        .then(topic => res.status(201).send({ topic }))
        .catch(next);
};