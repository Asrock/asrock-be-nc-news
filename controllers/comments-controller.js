const commentsModel = require("../models/comments-model");

exports.patchComment = (req, res, next) => {
    return commentsModel.modifyComment(req.params.comment_id, req.body)
        .then((comment) => res.status(200).send({ comment }))
        .catch(next);
};