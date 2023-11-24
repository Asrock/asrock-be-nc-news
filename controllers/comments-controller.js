const commentsModel = require("../models/comments-model");

exports.deleteComment = (req, res, next) => {
    return commentsModel.deleteComment(req.params.comment_id)
        .then(() => res.status(204).send())
        .catch(next);
};