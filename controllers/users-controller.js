const usersModel = require("../models/users-model");

exports.getUsers = (req, res, next) => usersModel.getUsers()
    .then(users => res.status(200).send({ users }))
    .catch(next);

exports.getUser = (req, res, next) => usersModel.getUser(req.params.username)
    .then(user => res.status(200).send({ user }))
    .catch(next);