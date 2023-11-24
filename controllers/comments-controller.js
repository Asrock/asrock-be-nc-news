const commentsModel = require("../models/comments-model");

exports.patchComment = (req, res, next) => {
    return commentsModel.modifyComment(req.params.comment_id, req.body)
        .then((comment) => res.status(200).send({ comment }))
        .catch(next);
};

exports.deleteComment = (req, res, next) => {
    return commentsModel.deleteComment(req.params.comment_id)
        .then(() => res.status(204).send())
        .catch(next);
};