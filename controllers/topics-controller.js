const topicsModel = require("../models/topics-model");

exports.getTopics = (req, res, next) => topicsModel.getTopics()
    .then(topics => res.status(200).send({ topics }))
    .catch(next);