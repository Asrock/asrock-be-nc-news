const usersModel = require("../models/users-model");

exports.getUsers = (req, res, next) => usersModel.getUsers()
    .then(users => res.status(200).send({ users: users }))
    .catch(next);